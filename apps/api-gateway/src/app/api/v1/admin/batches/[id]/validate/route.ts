// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Batch Validate API
// POST /api/v1/admin/batches/[id]/validate - Validate batch rows
// Owner: Afronovation, Inc.
// Access: Admin only
//
// Validates against 74-market scope
// Rejects ESH (Western Sahara)
// Workflow: mapped → validating → validated
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server';
import { 
  validateRow, 
  validateAGOAStatus, 
  validateAfCFTAStatus,
  validateDate 
} from '@/lib/ingestion/validators';
import type { ValidationError } from '@/lib/data/types';

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
    const body = await request.json();

    // Get validation configuration from request or batch template
    const config = {
      countryColumn: body.country_column,
      countryCodeType: body.country_code_type || 'iso3',
      requiredFields: body.required_fields || [],
      dataType: body.data_type, // 'agoa_status', 'afcfta_status', etc.
    };

    // Get batch
    const { data: batch, error: batchError } = await supabase
      .from('souvera_source_file_ingestion_batches')
      .select('*')
      .eq('id', batchId)
      .single();

    if (batchError || !batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Get template separately if it exists
    let template = null;
    if (batch.mapping_template_id) {
      const { data: templateData } = await supabase
        .from('souvera_source_ingestion_templates')
        .select('*')
        .eq('id', batch.mapping_template_id)
        .single();
      template = templateData;
    }
    
    // Attach template to batch for consistency with original code
    if (template) {
      batch.template = template;
    }

    // Validate status
    if (!['parsed', 'mapped'].includes(batch.status)) {
      return NextResponse.json({ 
        error: `Cannot validate batch in status: ${batch.status}. Must be parsed or mapped.` 
      }, { status: 400 });
    }

    // Apply template config if available
    if (batch.template) {
      config.countryColumn = config.countryColumn || batch.template.country_column;
      config.countryCodeType = config.countryCodeType || batch.template.country_mapping_type;
      config.requiredFields = config.requiredFields.length > 0 
        ? config.requiredFields 
        : batch.template.required_columns || [];
      config.dataType = config.dataType || batch.template.target_data_type;
    }

    // Update status to validating
    await supabase
      .from('souvera_source_file_ingestion_batches')
      .update({ status: 'validating' })
      .eq('id', batchId);

    try {
      // Get all rows for validation
      const { data: rows, error: rowsError } = await supabase
        .from('souvera_source_file_ingestion_rows')
        .select('*')
        .eq('batch_id', batchId)
        .order('row_number');

      if (rowsError) {
        throw new Error(`Failed to fetch rows: ${rowsError.message}`);
      }

      if (!rows || rows.length === 0) {
        throw new Error('No rows found in batch');
      }

      let validCount = 0;
      let invalidCount = 0;
      let warningCount = 0;
      let excludedCount = 0;

      // Validate each row
      for (const row of rows) {
        const data = row.mapped_data || row.raw_data;
        const errors: ValidationError[] = [];
        const warnings: ValidationError[] = [];

        // Basic validation
        const basicValidation = validateRow(data as Record<string, unknown>, {
          countryColumn: config.countryColumn,
          countryCodeType: config.countryCodeType as 'iso3' | 'iso2' | 'name',
          requiredFields: config.requiredFields,
        });

        errors.push(...basicValidation.errors);
        warnings.push(...basicValidation.warnings);

        // Type-specific validation
        if (config.dataType === 'agoa_status') {
          const statusError = validateAGOAStatus(data.agoa_status || data.status);
          if (statusError) errors.push(statusError);

          const eligibleDateError = validateDate(data.eligible_since, 'eligible_since');
          if (eligibleDateError) errors.push(eligibleDateError);

          const suspensionDateError = validateDate(data.suspension_date, 'suspension_date');
          if (suspensionDateError) errors.push(suspensionDateError);
        }

        if (config.dataType === 'afcfta_status') {
          const statusError = validateAfCFTAStatus(data.afcfta_status || data.status);
          if (statusError) errors.push(statusError);

          const signedDateError = validateDate(data.signed_date, 'signed_date');
          if (signedDateError) errors.push(signedDateError);

          const ratifiedDateError = validateDate(data.ratified_date, 'ratified_date');
          if (ratifiedDateError) errors.push(ratifiedDateError);

          const depositedDateError = validateDate(data.deposited_date, 'deposited_date');
          if (depositedDateError) errors.push(depositedDateError);
        }

        // Determine status
        let newStatus: string;
        if (basicValidation.is_excluded) {
          newStatus = 'invalid';
          excludedCount++;
        } else if (errors.length > 0) {
          newStatus = 'invalid';
          invalidCount++;
        } else if (warnings.length > 0) {
          newStatus = 'warning';
          warningCount++;
          validCount++; // Warnings are still valid
        } else {
          newStatus = 'valid';
          validCount++;
        }

        // Update row
        await supabase
          .from('souvera_source_file_ingestion_rows')
          .update({
            status: newStatus,
            mapped_iso3: basicValidation.mapped_iso3,
            validation_errors: errors.length > 0 ? errors : null,
            validation_warnings: warnings.length > 0 ? warnings : null,
            is_excluded: basicValidation.is_excluded,
            exclusion_reason: basicValidation.exclusion_reason,
          })
          .eq('id', row.id);
      }

      // Update batch status and counts
      await supabase
        .from('souvera_source_file_ingestion_batches')
        .update({ 
          status: 'validated',
          valid_rows: validCount,
          invalid_rows: invalidCount + excludedCount,
          warning_rows: warningCount,
        })
        .eq('id', batchId);

      return NextResponse.json({
        success: true,
        message: 'Batch validated successfully',
        summary: {
          total: rows.length,
          valid: validCount,
          invalid: invalidCount,
          warnings: warningCount,
          excluded: excludedCount,
        },
        next_step: validCount > 0 
          ? 'Review validated rows and proceed to approval'
          : 'All rows invalid - review errors and re-upload',
      });

    } catch (validateError) {
      // Update batch with error
      await supabase
        .from('souvera_source_file_ingestion_batches')
        .update({ 
          status: 'failed',
          error_message: validateError instanceof Error ? validateError.message : 'Validation failed',
        })
        .eq('id', batchId);

      return NextResponse.json({
        success: false,
        error: validateError instanceof Error ? validateError.message : 'Validation failed',
      }, { status: 500 });
    }

  } catch (err) {
    console.error('Unexpected error in POST /api/v1/admin/batches/[id]/validate:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
