-- ===========================================
-- SOUVERA INTELLIGENCE TERMINAL
-- User Activity Log Table
-- Owner: Afronovation, Inc.
-- ===========================================

-- Create user activity log for tracking platform usage
CREATE TABLE IF NOT EXISTS souvera_user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES souvera_profiles(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_activity_user 
  ON souvera_user_activity_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_activity_created 
  ON souvera_user_activity_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_activity_type 
  ON souvera_user_activity_log(activity_type);

-- Enable RLS
ALTER TABLE souvera_user_activity_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own activity
CREATE POLICY user_activity_read_own ON souvera_user_activity_log
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Admins can read all activity (will be verified in API)
CREATE POLICY user_activity_read_admin ON souvera_user_activity_log
  FOR SELECT
  USING (true);

-- Policy: System can insert activity logs
CREATE POLICY user_activity_insert ON souvera_user_activity_log
  FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE souvera_user_activity_log IS 'User activity tracking for analytics and audit';

-- Add status column to profiles if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'souvera_profiles' AND column_name = 'status'
  ) THEN
    ALTER TABLE souvera_profiles ADD COLUMN status text DEFAULT 'active';
  END IF;
END $$;

-- Add last_active_at column to profiles if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'souvera_profiles' AND column_name = 'last_active_at'
  ) THEN
    ALTER TABLE souvera_profiles ADD COLUMN last_active_at timestamptz;
  END IF;
END $$;
