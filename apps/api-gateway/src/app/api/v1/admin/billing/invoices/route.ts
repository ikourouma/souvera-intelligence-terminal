// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// Admin Invoices List/Create API
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

export async function GET(request: NextRequest) {
  const { isAdmin, isSuperAdmin } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const statusFilter = searchParams.get('status') || 'all';
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    const supabase = getServiceClient();

    let query = supabase
      .from('souvera_invoices')
      .select('*, user:user_id(id, email, full_name)', { count: 'exact' });

    if (search) {
      query = query.or(`invoice_number.ilike.%${search}%`);
    }

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (startDate) {
      query = query.gte('invoice_date', startDate);
    }

    if (endDate) {
      query = query.lte('invoice_date', endDate);
    }

    const offset = (page - 1) * limit;
    query = query.order('invoice_date', { ascending: false }).range(offset, offset + limit - 1);

    const { data: invoices, error, count } = await query;

    if (error) {
      console.error('[Invoices] Error fetching:', error);
      return NextResponse.json(
        { error: 'Failed to fetch invoices' },
        { status: 500 }
      );
    }

    const formattedInvoices = (invoices || []).map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      userId: invoice.user_id,
      userEmail: invoice.user?.email || 'Unknown',
      userName: invoice.user?.full_name || 'Unknown',
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
    }));

    const totalPages = count ? Math.ceil(count / limit) : 1;

    const stats = await getInvoiceStats(supabase);

    return NextResponse.json({
      invoices: formattedInvoices,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
      },
      stats,
    });
  } catch (error) {
    console.error('[Invoices] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { isAdmin, isSuperAdmin, userInfo } = await verifyAdminAccess();

  if (!isAdmin || !isSuperAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized - Super Admin access required' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const {
      user_id,
      plan_id,
      amount,
      currency = 'USD',
      invoice_date,
      due_date,
      notes,
      payment_method,
      line_items,
    } = body;

    if (!user_id || !plan_id || amount === undefined || !invoice_date || !due_date) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, plan_id, amount, invoice_date, due_date' },
        { status: 400 }
      );
    }

    if (amount < 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than or equal to 0' },
        { status: 400 }
      );
    }

    if (new Date(due_date) < new Date(invoice_date)) {
      return NextResponse.json(
        { error: 'Due date must be on or after invoice date' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    const { data: numberData, error: numberError } = await supabase.rpc('generate_invoice_number');

    if (numberError) {
      console.error('[Invoices] Error generating number:', numberError);
      const fallbackNumber = `INV-${new Date().toISOString().slice(0, 7).replace('-', '')}-${Date.now().toString().slice(-4)}`;
      
      const { data: invoice, error: insertError } = await supabase
        .from('souvera_invoices')
        .insert({
          invoice_number: fallbackNumber,
          user_id,
          plan_id,
          amount,
          currency,
          status: 'draft',
          invoice_date,
          due_date,
          notes,
          payment_method,
          line_items: line_items || [],
          created_by: userInfo?.id,
          updated_by: userInfo?.id,
        })
        .select('*')
        .single();

      if (insertError) {
        console.error('[Invoices] Error creating invoice:', insertError);
        return NextResponse.json(
          { error: 'Failed to create invoice' },
          { status: 500 }
        );
      }

      return NextResponse.json({ invoice, message: 'Invoice created successfully' }, { status: 201 });
    }

    const { data: invoice, error: insertError } = await supabase
      .from('souvera_invoices')
      .insert({
        invoice_number: numberData,
        user_id,
        plan_id,
        amount,
        currency,
        status: 'draft',
        invoice_date,
        due_date,
        notes,
        payment_method,
        line_items: line_items || [],
        created_by: userInfo?.id,
        updated_by: userInfo?.id,
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('[Invoices] Error creating invoice:', insertError);
      return NextResponse.json(
        { error: 'Failed to create invoice' },
        { status: 500 }
      );
    }

    await supabase.from('souvera_user_activity_log').insert({
      user_id: userInfo?.id,
      action: 'invoice_created',
      entity_type: 'invoice',
      entity_id: invoice.id,
      metadata: {
        invoice_number: invoice.invoice_number,
        amount: invoice.amount,
        plan_id: invoice.plan_id,
        target_user_id: user_id,
      },
    });

    return NextResponse.json({ invoice, message: 'Invoice created successfully' }, { status: 201 });
  } catch (error) {
    console.error('[Invoices] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getInvoiceStats(supabase: ReturnType<typeof getServiceClient>) {
  try {
    const { data: invoices } = await supabase
      .from('souvera_invoices')
      .select('status, amount');

    if (!invoices) {
      return {
        totalInvoices: 0,
        totalPaid: 0,
        totalPending: 0,
        totalOverdue: 0,
        totalRevenue: 0,
        pendingRevenue: 0,
      };
    }

    const stats = {
      totalInvoices: invoices.length,
      totalPaid: invoices.filter((i) => i.status === 'paid').length,
      totalPending: invoices.filter((i) => i.status === 'sent' || i.status === 'draft').length,
      totalOverdue: invoices.filter((i) => i.status === 'overdue').length,
      totalRevenue: invoices
        .filter((i) => i.status === 'paid')
        .reduce((sum, i) => sum + parseFloat(i.amount), 0),
      pendingRevenue: invoices
        .filter((i) => i.status === 'sent' || i.status === 'overdue')
        .reduce((sum, i) => sum + parseFloat(i.amount), 0),
    };

    return stats;
  } catch (error) {
    console.error('[Invoices] Error getting stats:', error);
    return {
      totalInvoices: 0,
      totalPaid: 0,
      totalPending: 0,
      totalOverdue: 0,
      totalRevenue: 0,
      pendingRevenue: 0,
    };
  }
}
