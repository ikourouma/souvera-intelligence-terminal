-- ===========================================
-- SOUVERA INTELLIGENCE TERMINAL
-- SQL Pack v1.3 - Lead Submissions
-- Owner: Afronovation, Inc.
-- 
-- Creates lead_submissions table for contact,
-- request access, and newsletter form data.
-- ===========================================

-- Lead submissions table
CREATE TABLE IF NOT EXISTS lead_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Form identification
    form_type TEXT NOT NULL CHECK (form_type IN ('contact', 'request_access', 'newsletter')),
    source_page TEXT,
    
    -- Contact information
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    organization TEXT,
    organization_type TEXT,
    role TEXT,
    
    -- Form-specific fields
    inquiry_type TEXT,
    message TEXT,
    
    -- Status tracking
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'archived')),
    notes TEXT,
    
    -- Metadata
    ip_address TEXT,
    user_agent TEXT
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_lead_submissions_created_at ON lead_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_submissions_form_type ON lead_submissions(form_type);
CREATE INDEX IF NOT EXISTS idx_lead_submissions_status ON lead_submissions(status);
CREATE INDEX IF NOT EXISTS idx_lead_submissions_email ON lead_submissions(email);

-- Row Level Security
ALTER TABLE lead_submissions ENABLE ROW LEVEL SECURITY;

-- Only service role can insert/select (no public access)
CREATE POLICY "Service role full access" ON lead_submissions
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Allow anon inserts for form submissions (read restricted to service role)
CREATE POLICY "Allow anonymous inserts" ON lead_submissions
    FOR INSERT
    TO anon
    WITH CHECK (true);

COMMENT ON TABLE lead_submissions IS 'Captures form submissions from contact, request access, and newsletter forms';
