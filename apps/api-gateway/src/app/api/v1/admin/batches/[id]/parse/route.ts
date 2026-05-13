// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Batch Parse API
// POST /api/v1/admin/batches/[id]/parse - Parse batch file
// Owner: Afronovation, Inc.
// Access: Admin only
//
// Workflow: uploaded → parsing → parsed
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server';
import { parseCSV, parseJSON } from '@/lib/ingestion/parsers';

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
      .in('role', ['org_admin', 'platform_admin'])
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
    const { isAdmin, error: authError } = await verifyAdminAccess();
    if (!isAdmin) {
      return NextResponse.json({ error: authError }, { status: 403 });
    }

    const params = await context.params;
    const { id: batchId } = params;
    const supabase = getServiceClient();

    // Get batch and file asset
    const { data: batch, error: batchError } = await supabase
      .from('souvera_source_file_ingestion_batches')
      .select(`
        *,
        file_asset:souvera_source_file_assets(*)
      `)
      .eq('id', batchId)
      .single();

    if (batchError || !batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Validate status
    if (!['uploaded', 'stored'].includes(batch.status)) {
      return NextResponse.json({ 
        error: `Cannot parse batch in status: ${batch.status}. Must be uploaded or stored.` 
      }, { status: 400 });
    }

    const fileAsset = batch.file_asset;
    if (!fileAsset) {
      return NextResponse.json({ error: 'No file asset linked to batch' }, { status: 400 });
    }

    // PDF files are stored as evidence, not parsed
    if (fileAsset.file_type === 'pdf') {
      return NextResponse.json({ 
        error: 'PDF files are stored as evidence and cannot be parsed automatically',
        suggestion: 'Use manual data entry or link to a CSV/JSON export'
      }, { status: 400 });
    }

    // Update status to parsing
    await supabase
      .from('souvera_source_file_ingestion_batches')
      .update({ status: 'parsing' })
      .eq('id', batchId);

    try {
      // Download file from storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from(fileAsset.storage_bucket)
        .download(fileAsset.storage_path);

      if (downloadError || !fileData) {
        throw new Error(`Failed to download file: ${downloadError?.message}`);
      }

      const content = await fileData.text();
      
      // Parse based on file type
      let parseResult;
      switch (fileAsset.file_type) {
        case 'csv':
          parseResult = await parseCSV(content, { header: true, skipEmptyLines: true });
          break;
        case 'json':
          parseResult = await parseJSON(content);
          break;
        case 'xlsx':
          // XLSX parsing requires additional library (xlsx)
          // For now, return error suggesting CSV conversion
          throw new Error('XLSX parsing not yet implemented. Please convert to CSV.');
        case 'xml':
          throw new Error('XML parsing not yet implemented. Please convert to JSON or CSV.');
        default:
          throw new Error(`Unsupported file type: ${fileAsset.file_type}`);
      }

      if (!parseResult.success) {
        // Update batch with parsing error
        await supabase
          .from('souvera_source_file_ingestion_batches')
          .update({ 
            status: 'failed',
            error_message: parseResult.errors?.join('; ') || 'Parsing failed',
            error_details: { parse_errors: parseResult.errors }
          })
          .eq('id', batchId);

        return NextResponse.json({
          success: false,
          error: 'File parsing failed',
          errors: parseResult.errors,
        }, { status: 400 });
      }

      // Insert parsed rows
      const rowsToInsert = parseResult.rows.map((row) => ({
        batch_id: batchId,
        row_number: row.row_number,
        raw_data: row.data,
        status: 'pending',
      }));

      // Insert in batches of 500
      const batchSize = 500;
      for (let i = 0; i < rowsToInsert.length; i += batchSize) {
        const chunk = rowsToInsert.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('souvera_source_file_ingestion_rows')
          .insert(chunk);

        if (insertError) {
          throw new Error(`Failed to insert rows: ${insertError.message}`);
        }
      }

      // Update batch status
      await supabase
        .from('souvera_source_file_ingestion_batches')
        .update({ 
          status: 'parsed',
          total_rows: parseResult.rows.length,
          column_mapping: {
            detected_columns: parseResult.columns,
            column_types: null, // Will be inferred during mapping
          }
        })
        .eq('id', batchId);

      return NextResponse.json({
        success: true,
        message: 'File parsed successfully',
        total_rows: parseResult.rows.length,
        columns: parseResult.columns,
        meta: parseResult.meta,
        next_step: 'Proceed to column mapping',
      });

    } catch (parseError) {
      // Update batch with error
      await supabase
        .from('souvera_source_file_ingestion_batches')
        .update({ 
          status: 'failed',
          error_message: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
        })
        .eq('id', batchId);

      return NextResponse.json({
        success: false,
        error: parseError instanceof Error ? parseError.message : 'Parsing failed',
      }, { status: 500 });
    }

  } catch (err) {
    console.error('Unexpected error in POST /api/v1/admin/batches/[id]/parse:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
