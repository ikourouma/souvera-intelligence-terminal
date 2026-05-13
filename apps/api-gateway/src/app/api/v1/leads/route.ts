// ===========================================
// SOUVERA INTELLIGENCE TERMINAL
// POST /api/v1/leads
// Owner: Afronovation, Inc.
// Access: Public (write-only)
//
// Handles form submissions from contact,
// request access, and newsletter forms.
// ===========================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const VALID_FORM_TYPES = ['contact', 'request_access', 'newsletter'] as const;
type FormType = (typeof VALID_FORM_TYPES)[number];

interface LeadSubmission {
  form_type: FormType;
  email: string;
  first_name?: string;
  last_name?: string;
  organization?: string;
  organization_type?: string;
  role?: string;
  inquiry_type?: string;
  message?: string;
  source_page?: string;
}

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

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  return value.trim().slice(0, 1000);
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // 5 submissions per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Please wait a moment before submitting again.',
        },
        { status: 429 }
      );
    }

    const body = await request.json();

    const formType = body.form_type;
    if (!formType || !VALID_FORM_TYPES.includes(formType)) {
      return NextResponse.json(
        { error: 'Invalid form type', message: 'form_type is required and must be valid.' },
        { status: 400 }
      );
    }

    const email = sanitizeString(body.email);
    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email', message: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const submission: LeadSubmission & { ip_address: string; user_agent: string } = {
      form_type: formType,
      email,
      first_name: sanitizeString(body.first_name),
      last_name: sanitizeString(body.last_name),
      organization: sanitizeString(body.organization),
      organization_type: sanitizeString(body.organization_type),
      role: sanitizeString(body.role),
      inquiry_type: sanitizeString(body.inquiry_type),
      message: sanitizeString(body.message),
      source_page: sanitizeString(body.source_page),
      ip_address: ip,
      user_agent: request.headers.get('user-agent')?.slice(0, 500) || 'unknown',
    };

    const supabase = getServiceClient();

    const { error } = await supabase.from('lead_submissions').insert(submission);

    if (error) {
      console.error('[API] leads insert error:', error.message);
      return NextResponse.json(
        { error: 'Submission failed', message: 'Unable to process your request. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: getSuccessMessage(formType),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[API] leads unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

function getSuccessMessage(formType: FormType): string {
  switch (formType) {
    case 'contact':
      return 'Thank you for contacting us. Our team will respond within 2 business days.';
    case 'request_access':
      return 'Your access request has been received. We will review and respond shortly.';
    case 'newsletter':
      return 'You have been subscribed to Souvera Intelligence updates.';
    default:
      return 'Your submission has been received.';
  }
}
