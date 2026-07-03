-- ===========================================
-- SOUVERA INTELLIGENCE TERMINAL
-- Invoice Management Table
-- Owner: Afronovation, Inc.
-- Created: 2026-06-14
-- ===========================================

-- Create invoice status type if not exists
DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create invoices table
CREATE TABLE IF NOT EXISTS souvera_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID,
  plan_id TEXT NOT NULL,
  
  -- Invoice details
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'USD',
  status invoice_status NOT NULL DEFAULT 'draft',
  
  -- Dates
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  
  -- Metadata
  notes TEXT,
  payment_method TEXT,
  line_items JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT valid_dates CHECK (due_date >= invoice_date),
  CONSTRAINT paid_date_when_paid CHECK (
    (status = 'paid' AND paid_date IS NOT NULL) OR 
    (status != 'paid')
  )
);

-- Enable RLS
ALTER TABLE souvera_invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies (super admin only for full access)
CREATE POLICY "Super admins can manage invoices"
  ON souvera_invoices
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM souvera_organization_members om
      WHERE om.user_id = auth.uid()
      AND om.role = 'super_admin'
    )
  );

-- Platform admins can view invoices (read-only)
CREATE POLICY "Platform admins can view invoices"
  ON souvera_invoices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM souvera_organization_members om
      WHERE om.user_id = auth.uid()
      AND om.role IN ('platform_admin', 'super_admin')
    )
  );

-- Users can view their own invoices
CREATE POLICY "Users can view own invoices"
  ON souvera_invoices
  FOR SELECT
  USING (user_id = auth.uid());

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON souvera_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON souvera_invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON souvera_invoices(invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON souvera_invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON souvera_invoices(invoice_number);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_souvera_invoices_updated_at ON souvera_invoices;
CREATE TRIGGER update_souvera_invoices_updated_at
  BEFORE UPDATE ON souvera_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    year_month TEXT;
    seq_num INTEGER;
    new_number TEXT;
BEGIN
    year_month := TO_CHAR(NOW(), 'YYYYMM');
    
    -- Get the next sequence number for this month
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(invoice_number FROM 'INV-' || year_month || '-(\d+)') AS INTEGER)
    ), 0) + 1
    INTO seq_num
    FROM souvera_invoices
    WHERE invoice_number LIKE 'INV-' || year_month || '-%';
    
    new_number := 'INV-' || year_month || '-' || LPAD(seq_num::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON TABLE souvera_invoices IS 'Manual invoice tracking for subscription billing. Super admin managed.';
COMMENT ON COLUMN souvera_invoices.invoice_number IS 'Auto-generated format: INV-YYYYMM-XXXX';
COMMENT ON COLUMN souvera_invoices.line_items IS 'JSON array of line items for detailed invoices';
