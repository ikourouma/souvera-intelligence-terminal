// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Invoice Detail/Update/Delete API
// Owner: Afronovation, Inc.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess, getServiceClient } from '@/lib/admin/verify-admin';

const PLAN_NAMES: Record<string, string> = {
  explorer: 'Explorer',
  professional: 'Professional',
  business: 'Business',
  investor: 'Investor',
  institutional: 'Institutional',
};

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { isAdmin, isSuperAdmin } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const supabase = getServiceClient();

    const { data: invoice, error } = await supabase
      .from('souvera_invoices')
      .select('*, user:user_id(id, email, full_name, plan_id, status)')
      .eq('id', id)
      .single();

    if (error || !invoice) {
      console.error('[Invoice] Error fetching:', error);
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const formattedInvoice = {
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      userId: invoice.user_id,
      user: invoice.user ? {
        id: invoice.user.id,
        email: invoice.user.email,
        fullName: invoice.user.full_name,
        currentPlan: invoice.user.plan_id,
        status: invoice.user.status,
      } : null,
      planId: invoice.plan_id,
      planName: PLAN_NAMES[invoice.plan_id] || invoice.plan_id,
      amount: parseFloat(invoice.amount),
      currency: invoice.currency,
      status: invoice.status,
      invoiceDate: invoice.invoice_date,
      dueDate: invoice.due_date,
      paidDate: invoice.paid_date,
      paymentMethod: invoice.payment_method,
      notes: invoice.notes,
      lineItems: invoice.line_items,
      createdAt: invoice.created_at,
      updatedAt: invoice.updated_at,
      createdBy: invoice.created_by,
      updatedBy: invoice.updated_by,
    };

    return NextResponse.json({ invoice: formattedInvoice });
  } catch (error) {
    console.error('[Invoice] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { isAdmin, isSuperAdmin, userInfo } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = getServiceClient();

    const { data: existing, error: fetchError } = await supabase
      .from('souvera_invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {
      updated_by: userInfo?.id,
    };

    const allowedFields = [
      'plan_id',
      'amount',
      'currency',
      'status',
      'invoice_date',
      'due_date',
      'paid_date',
      'notes',
      'payment_method',
      'line_items',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (updateData.status === 'paid' && !updateData.paid_date && !existing.paid_date) {
      updateData.paid_date = new Date().toISOString().split('T')[0];
    }

    if (updateData.status && updateData.status !== 'paid') {
      updateData.paid_date = null;
    }

    if (updateData.due_date && updateData.invoice_date) {
      if (new Date(updateData.due_date as string) < new Date(updateData.invoice_date as string)) {
        return NextResponse.json(
          { error: 'Due date must be on or after invoice date' },
          { status: 400 }
        );
      }
    } else if (updateData.due_date && !updateData.invoice_date) {
      if (new Date(updateData.due_date as string) < new Date(existing.invoice_date)) {
        return NextResponse.json(
          { error: 'Due date must be on or after invoice date' },
          { status: 400 }
        );
      }
    }

    const { data: invoice, error: updateError } = await supabase
      .from('souvera_invoices')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      console.error('[Invoice] Error updating:', updateError);
      return NextResponse.json(
        { error: 'Failed to update invoice' },
        { status: 500 }
      );
    }

    await supabase.from('souvera_user_activity_log').insert({
      user_id: userInfo?.id,
      action: 'invoice_updated',
      entity_type: 'invoice',
      entity_id: invoice.id,
      metadata: {
        invoice_number: invoice.invoice_number,
        changes: Object.keys(updateData).filter((k) => k !== 'updated_by'),
        previous_status: existing.status,
        new_status: invoice.status,
      },
    });

    return NextResponse.json({ invoice, message: 'Invoice updated successfully' });
  } catch (error) {
    console.error('[Invoice] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { isAdmin, isSuperAdmin, userInfo } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const supabase = getServiceClient();

    const { data: existing, error: fetchError } = await supabase
      .from('souvera_invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .from('souvera_invoices')
      .update({ 
        status: 'cancelled',
        updated_by: userInfo?.id,
      })
      .eq('id', id);

    if (updateError) {
      console.error('[Invoice] Error cancelling:', updateError);
      return NextResponse.json(
        { error: 'Failed to cancel invoice' },
        { status: 500 }
      );
    }

    await supabase.from('souvera_user_activity_log').insert({
      user_id: userInfo?.id,
      action: 'invoice_cancelled',
      entity_type: 'invoice',
      entity_id: id,
      metadata: {
        invoice_number: existing.invoice_number,
        previous_status: existing.status,
        amount: existing.amount,
      },
    });

    return NextResponse.json({ message: 'Invoice cancelled successfully' });
  } catch (error) {
    console.error('[Invoice] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
