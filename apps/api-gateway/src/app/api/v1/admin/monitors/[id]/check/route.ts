// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Monitor Check API
// POST /api/v1/admin/monitors/[id]/check - Run monitor check
// Owner: Afronovation, Inc.
// Access: Admin only
//
// Creates review tasks for detected changes
// NO automatic publication
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server';
import { runMonitorCheck, type DetectedChange } from '@/lib/ingestion/monitors';
import type { PolicySourceMonitor } from '@/lib/data/types';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function verifyAdminAccess(): Promise<{ isAdmin: boolean; userId?: string; error?: string }> {
  try {
    const authSupabase = await createServerClient();
    const { data: { user }, error } = await authSupabase.auth.getUser();
    
    if (error || !user) {
      return { isAdmin: false, error: 'Authentication required' };
    }

    const supabase = getServiceClient();
    
    const { data: memberData } = await supabase
      .from('souvera_organization_members')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['org_admin', 'platform_admin', 'super_admin'])
      .limit(1);

    if (memberData && memberData.length > 0) {
      return { isAdmin: true, userId: user.id };
    }

    return { isAdmin: false, error: 'Admin access required' };
  } catch {
    return { isAdmin: false, error: 'Authentication failed' };
  }
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { isAdmin, userId, error: authError } = await verifyAdminAccess();
    if (!isAdmin || !userId) {
      return NextResponse.json({ error: authError }, { status: 403 });
    }

    const params = await context.params;
    const { id: monitorId } = params;
    const supabase = getServiceClient();

    // Get monitor
    const { data: monitor, error: fetchError } = await supabase
      .from('souvera_policy_source_monitors')
      .select('*')
      .eq('id', monitorId)
      .single();

    if (fetchError || !monitor) {
      return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });
    }

    if (!monitor.is_active) {
      return NextResponse.json({ error: 'Monitor is not active' }, { status: 400 });
    }

    // Run monitor check
    const result = await runMonitorCheck(monitor as PolicySourceMonitor);

    // Update monitor with check results
    await supabase
      .from('souvera_policy_source_monitors')
      .update({
        last_check_at: new Date().toISOString(),
        next_check_at: new Date(Date.now() + monitor.check_interval_minutes * 60 * 1000).toISOString(),
        last_content_hash: result.content_hash || monitor.last_content_hash,
        last_response_status: result.success ? 200 : 500,
        last_error_message: result.error_message || null,
        consecutive_failures: result.success ? 0 : (monitor.consecutive_failures || 0) + 1,
      })
      .eq('id', monitorId);

    // If changes detected, create snapshot and change events
    if (result.has_changed && result.detected_changes && result.detected_changes.length > 0) {
      // Create snapshot
      const { data: snapshot } = await supabase
        .from('souvera_policy_source_snapshots')
        .insert({
          monitor_id: monitorId,
          content_hash: result.content_hash,
          content_preview: result.content_preview,
          response_status: 200,
          has_changed: true,
          change_summary: `${result.detected_changes.length} change(s) detected`,
          detected_documents: result.detected_changes.map((c: DetectedChange) => ({
            title: c.document_title || c.title,
            url: c.document_url || c.url,
            type: c.document_type,
          })),
        })
        .select()
        .single();

      // Create change events and review tasks
      const eventsCreated: string[] = [];
      const reviewTasksCreated: string[] = [];

      for (const change of result.detected_changes) {
        // Create change event
        const { data: changeEvent } = await supabase
          .from('souvera_policy_change_events')
          .insert({
            monitor_id: monitorId,
            snapshot_id: snapshot?.id,
            event_type: change.event_type,
            event_title: change.title,
            event_description: change.description,
            event_url: change.url,
            event_date: change.date,
            document_title: change.document_title,
            document_url: change.document_url,
            document_type: change.document_type,
            extracted_data: change.extracted_data,
            matched_keywords: change.matched_keywords,
            status: 'detected',
          })
          .select()
          .single();

        if (changeEvent) {
          eventsCreated.push(changeEvent.id);

          // Create review task
          const policyType = monitor.monitor_name.toLowerCase().includes('agoa') ? 'agoa'
            : monitor.monitor_name.toLowerCase().includes('afcfta') ? 'afcfta'
            : 'trade';

          const { data: reviewTask } = await supabase
            .from('souvera_policy_review_queue')
            .insert({
              source_type: 'change_event',
              source_id: changeEvent.id,
              title: change.title,
              description: change.description || `Detected by ${monitor.monitor_name}`,
              priority: 75, // High priority for automated detections
              policy_type: policyType,
              status: 'under_review',
              created_by: userId,
            })
            .select()
            .single();

          if (reviewTask) {
            reviewTasksCreated.push(reviewTask.id);
          }
        }
      }

      return NextResponse.json({
        success: true,
        has_changed: true,
        message: `${result.detected_changes.length} change(s) detected and queued for review`,
        snapshot_id: snapshot?.id,
        events_created: eventsCreated,
        review_tasks_created: reviewTasksCreated,
        detected_changes: result.detected_changes,
      });
    }

    // No changes detected
    return NextResponse.json({
      success: result.success,
      has_changed: false,
      message: result.success 
        ? 'Monitor check completed - no changes detected'
        : `Monitor check failed: ${result.error_message}`,
      content_hash: result.content_hash,
    });

  } catch (err) {
    console.error('Unexpected error in POST /api/v1/admin/monitors/[id]/check:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
