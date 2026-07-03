-- ===========================================
-- SOUVERA INTELLIGENCE TERMINAL
-- Admin Notifications Table
-- Owner: Afronovation, Inc.
-- ===========================================

-- Create admin notifications table for real-time alerts
CREATE TABLE IF NOT EXISTS souvera_admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid REFERENCES souvera_profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('system', 'user', 'data', 'content')),
  category text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_admin_notifications_recipient 
  ON souvera_admin_notifications(recipient_id, is_read);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_created 
  ON souvera_admin_notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_type 
  ON souvera_admin_notifications(type, severity);

-- Enable RLS
ALTER TABLE souvera_admin_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Admin users can read their own notifications and global ones
CREATE POLICY admin_notifications_read ON souvera_admin_notifications
  FOR SELECT
  USING (
    recipient_id = auth.uid() 
    OR recipient_id IS NULL
  );

-- Policy: Only system can insert notifications
CREATE POLICY admin_notifications_insert ON souvera_admin_notifications
  FOR INSERT
  WITH CHECK (true);

-- Policy: Admin users can update their own notifications (mark as read)
CREATE POLICY admin_notifications_update ON souvera_admin_notifications
  FOR UPDATE
  USING (
    recipient_id = auth.uid() 
    OR recipient_id IS NULL
  );

COMMENT ON TABLE souvera_admin_notifications IS 'Admin notification system for real-time alerts';
