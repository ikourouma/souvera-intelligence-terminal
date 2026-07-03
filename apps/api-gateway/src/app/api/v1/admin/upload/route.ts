// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin File Upload API
// POST /api/v1/admin/upload - Upload source file
// Owner: Afronovation, Inc.
// Access: Admin only
//
// Supports: CSV, XLSX, JSON, XML, PDF
// Lifecycle: Upload → Store → Parse → Map → Validate → Review → Approve → Publish
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server';
import type { FileType, BatchStatus, ConfidenceLevel } from '@/lib/data/types';

const ADHOC_SOURCE_KEY = 'adhoc_admin_upload';

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

function getFileType(fileName: string, mimeType: string): FileType {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  if (ext === 'csv' || mimeType === 'text/csv') return 'csv';
  if (ext === 'xlsx' || mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'xlsx';
  if (ext === 'json' || mimeType === 'application/json') return 'json';
  if (ext === 'xml' || mimeType === 'application/xml' || mimeType === 'text/xml') return 'xml';
  if (ext === 'pdf' || mimeType === 'application/pdf') return 'pdf';
  if (ext === 'html' || mimeType === 'text/html') return 'html';
  if (ext === 'txt' || mimeType === 'text/plain') return 'text';
  
  return 'other';
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const { isAdmin, userId, error: authError } = await verifyAdminAccess();
    if (!isAdmin || !userId) {
      return NextResponse.json({ error: authError }, { status: 403 });
    }

    const supabase = getServiceClient();
    const formData = await request.formData();

    // Get file
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Get metadata
    const sourceId = formData.get('source_id') as string | null;
    const sourceName = formData.get('source_name') as string;
    const sourceUrl = formData.get('source_url') as string | null;
    const asOfDate = formData.get('as_of_date') as string;
    const templateId = formData.get('template_id') as string | null;
    const batchName = formData.get('batch_name') as string | null;
    const batchDescription = formData.get('batch_description') as string | null;
    const confidenceLevel = (formData.get('confidence_level') as ConfidenceLevel) || 'curated';

    // Governance note:
    // Ad-hoc Admin Upload is a controlled staging source for admin-uploaded files
    // when no explicit source is selected. It must not be treated as final
    // authoritative source attribution for published intelligence without review.
    let resolvedSourceId = sourceId;

    if (!resolvedSourceId) {
      const { data: adhocSource, error: adhocSourceError } = await supabase
        .from('souvera_data_sources')
        .select('id')
        .eq('key', ADHOC_SOURCE_KEY)
        .eq('is_active', true)
        .single();

      if (adhocSourceError || !adhocSource?.id) {
        console.error('Default ad-hoc source lookup failed:', adhocSourceError);

        return NextResponse.json(
          {
            error: 'No source selected and default source not found',
            details:
              adhocSourceError?.message ||
              'Default ad-hoc upload source is missing or inactive',
            sourceKey: ADHOC_SOURCE_KEY,
          },
          { status: 400 }
        );
      }

      resolvedSourceId = adhocSource.id;
    }

    // Validate required fields
    if (!sourceName) {
      return NextResponse.json({ error: 'source_name is required' }, { status: 400 });
    }
    if (!asOfDate) {
      return NextResponse.json({ error: 'as_of_date is required' }, { status: 400 });
    }

    // Determine file type
    const fileType = getFileType(file.name, file.type);
    
    // Validate file type
    const allowedTypes: FileType[] = ['csv', 'xlsx', 'json', 'xml', 'pdf'];
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json({ 
        error: `Unsupported file type: ${fileType}. Allowed: ${allowedTypes.join(', ')}` 
      }, { status: 400 });
    }

    // Generate storage path
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `uploads/${new Date().toISOString().split('T')[0]}/${timestamp}_${sanitizedFileName}`;

    // Upload file to Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('source-files')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('File upload error:', uploadError);
      console.error('Storage upload context:', {
        bucket: 'source-files',
        path: storagePath,
        fileName: file.name,
        mimeType: file.type || 'unknown',
        fileSize: file.size,
      });

      return NextResponse.json({ 
        error: 'Failed to upload file to storage',
        details: uploadError.message,
        bucket: 'source-files',
        fileName: file.name,
        mimeType: file.type || 'unknown',
        fileSize: file.size,
        storagePath,
      }, { status: 500 });
    }

    // Create file asset record
    const { data: fileAsset, error: assetError } = await supabase
      .from('souvera_source_file_assets')
      .insert({
        source_id: resolvedSourceId,
        file_name: file.name,
        file_type: fileType,
        file_size_bytes: file.size,
        mime_type: file.type,
        storage_path: storagePath,
        storage_bucket: 'source-files',
        fetch_method: 'upload',
        fetched_at: new Date().toISOString(),
        fetched_by: userId,
        is_pdf_evidence: fileType === 'pdf',
        pdf_extraction_status: fileType === 'pdf' ? 'pending' : null,
      })
      .select()
      .single();

    if (assetError) {
      console.error('File asset creation error:', assetError);
      return NextResponse.json({ error: 'Failed to create file asset record' }, { status: 500 });
    }

    // Create ingestion batch record
    const initialStatus: BatchStatus = fileType === 'pdf' ? 'stored' : 'uploaded';
    
    const { data: batch, error: batchError } = await supabase
      .from('souvera_source_file_ingestion_batches')
      .insert({
        source_id: resolvedSourceId,
        file_asset_id: fileAsset.id,
        batch_name: batchName || `Upload ${new Date().toISOString()}`,
        batch_description: batchDescription,
        status: initialStatus,
        source_name: sourceName,
        source_url: sourceUrl,
        as_of_date: asOfDate,
        last_reviewed_at: new Date().toISOString(),
        source_confidence: confidenceLevel,
        mapping_template_id: templateId,
        created_by: userId,
      })
      .select()
      .single();

    if (batchError) {
      console.error('Batch creation error:', batchError);
      return NextResponse.json({ error: 'Failed to create ingestion batch' }, { status: 500 });
    }

    // Create ingestion run record
    const { data: ingestionRun, error: runError } = await supabase
      .from('souvera_data_ingestion_runs')
      .insert({
        source_id: resolvedSourceId,
        run_type: 'upload',
        triggered_by: userId,
        status: 'queued',
      })
      .select()
      .single();

    if (!runError && ingestionRun) {
      // Link batch to ingestion run
      await supabase
        .from('souvera_source_file_ingestion_batches')
        .update({ ingestion_run_id: ingestionRun.id })
        .eq('id', batch.id);
    }

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      file_asset: {
        id: fileAsset.id,
        file_name: fileAsset.file_name,
        file_type: fileAsset.file_type,
        file_size_bytes: fileAsset.file_size_bytes,
        storage_path: fileAsset.storage_path,
      },
      batch: {
        id: batch.id,
        status: batch.status,
        source_name: batch.source_name,
        as_of_date: batch.as_of_date,
      },
      ingestion_run_id: ingestionRun?.id,
      next_step: fileType === 'pdf' 
        ? 'PDF stored as evidence. Proceed to manual review or request extraction.'
        : 'File uploaded. Proceed to parsing and mapping.',
    }, { status: 201 });

  } catch (err) {
    console.error('Unexpected error in POST /api/v1/admin/upload:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET endpoint to list templates for upload form
export async function GET(request: NextRequest) {
  try {
    const { isAdmin, error: authError } = await verifyAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: authError }, { status: 403 });
    }

    const supabase = getServiceClient();
    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get('target_type');

    // Get available templates
    let query = supabase
      .from('souvera_source_ingestion_templates')
      .select('id, template_name, template_description, target_table, target_data_type, required_columns, is_default')
      .eq('is_active', true);

    if (targetType) {
      query = query.eq('target_data_type', targetType);
    }

    const { data: templates, error } = await query.order('template_name');

    if (error) {
      console.error('Error fetching templates:', error);
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }

    // Get available sources for linking
    const { data: sources } = await supabase
      .from('souvera_data_sources')
      .select('id, key, name, source_type, ingestion_method')
      .eq('is_active', true)
      .order('name');

    return NextResponse.json({
      templates: templates || [],
      sources: sources || [],
      supported_file_types: ['csv', 'xlsx', 'json', 'xml', 'pdf'],
      required_fields: ['source_name', 'as_of_date'],
    });

  } catch (err) {
    console.error('Unexpected error in GET /api/v1/admin/upload:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
