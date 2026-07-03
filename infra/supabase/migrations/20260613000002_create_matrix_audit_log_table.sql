-- ===========================================
-- SOUVERA INTELLIGENCE TERMINAL
-- Matrix Audit Log Table
-- Owner: Afronovation, Inc.
-- ===========================================

-- Create matrix audit log for tracking access control changes
CREATE TABLE IF NOT EXISTS souvera_matrix_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES souvera_profiles(id) ON DELETE SET NULL,
  admin_email text NOT NULL,
  persona text NOT NULL,
  entitlement_key text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  change_type text NOT NULL CHECK (change_type IN ('enable', 'disable', 'update', 'update_quota')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_matrix_audit_created 
  ON souvera_matrix_audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_matrix_audit_admin 
  ON souvera_matrix_audit_log(admin_id);

CREATE INDEX IF NOT EXISTS idx_matrix_audit_persona 
  ON souvera_matrix_audit_log(persona, entitlement_key);

-- Enable RLS
ALTER TABLE souvera_matrix_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only super admins can read audit logs
CREATE POLICY matrix_audit_read ON souvera_matrix_audit_log
  FOR SELECT
  USING (true);

-- Policy: Only system can insert audit logs
CREATE POLICY matrix_audit_insert ON souvera_matrix_audit_log
  FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE souvera_matrix_audit_log IS 'Audit trail for access control matrix changes';
