-- ===========================================
-- SOUVERA INTELLIGENCE TERMINAL
-- Marketing CMS Tables Migration
-- Owner: Afronovation, Inc.
-- Created: June 14, 2026
-- ===========================================

-- ============================================
-- 1. Hero Slides Table
-- Homepage carousel slides with all content
-- ============================================

CREATE TABLE IF NOT EXISTS souvera_hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  badge text,
  title text NOT NULL,
  subtitle text,
  cta_primary_label text,
  cta_primary_url text,
  cta_secondary_label text,
  cta_secondary_url text,
  stat_1_value text,
  stat_1_label text,
  stat_2_value text,
  stat_2_label text,
  ticker_items jsonb DEFAULT '[]',
  accent_color text DEFAULT '#2563EB',
  background_image_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES souvera_profiles(id),
  updated_by uuid REFERENCES souvera_profiles(id)
);

CREATE INDEX idx_hero_slides_display_order ON souvera_hero_slides(display_order);
CREATE INDEX idx_hero_slides_active ON souvera_hero_slides(is_active);

-- RLS Policies for Hero Slides
ALTER TABLE souvera_hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hero_slides_public_read" ON souvera_hero_slides
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "hero_slides_admin_all" ON souvera_hero_slides
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM souvera_organization_members
      WHERE souvera_organization_members.user_id = auth.uid()
      AND souvera_organization_members.role IN ('super_admin', 'platform_admin')
    )
  );


-- ============================================
-- 2. Flash Banners Table
-- Announcement/marketing banners with scheduling
-- ============================================

CREATE TABLE IF NOT EXISTS souvera_flash_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text,
  message text NOT NULL,
  banner_type text NOT NULL DEFAULT 'info' CHECK (banner_type IN ('info', 'warning', 'success', 'promo')),
  link_text text,
  link_url text,
  background_gradient text DEFAULT 'linear-gradient(90deg, #1d4ed8 0%, #1e3a8a 40%, #166534 100%)',
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES souvera_profiles(id),
  updated_by uuid REFERENCES souvera_profiles(id)
);

CREATE INDEX idx_flash_banners_active ON souvera_flash_banners(is_active);
CREATE INDEX idx_flash_banners_schedule ON souvera_flash_banners(starts_at, ends_at);

-- RLS Policies for Flash Banners
ALTER TABLE souvera_flash_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "flash_banners_public_read" ON souvera_flash_banners
  FOR SELECT
  TO public
  USING (
    is_active = true
    AND (starts_at IS NULL OR starts_at <= now())
    AND (ends_at IS NULL OR ends_at > now())
  );

CREATE POLICY "flash_banners_admin_all" ON souvera_flash_banners
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM souvera_organization_members
      WHERE souvera_organization_members.user_id = auth.uid()
      AND souvera_organization_members.role IN ('super_admin', 'platform_admin')
    )
  );


-- ============================================
-- 3. Pricing Display Table
-- Plan pricing configuration for marketing pages
-- ============================================

CREATE TABLE IF NOT EXISTS souvera_pricing_display (
  plan_id text PRIMARY KEY,
  display_name text NOT NULL,
  badge_text text,
  badge_color text DEFAULT '#2563EB',
  tagline text,
  description text,
  price_monthly numeric DEFAULT 0,
  price_annual numeric,
  features jsonb DEFAULT '[]',
  cta_text text DEFAULT 'Get Started',
  cta_url text DEFAULT '/access/request-access',
  cta_style text DEFAULT 'outline' CHECK (cta_style IN ('primary', 'outline', 'ghost')),
  is_featured boolean DEFAULT false,
  is_visible boolean DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES souvera_profiles(id)
);

CREATE INDEX idx_pricing_display_order ON souvera_pricing_display(display_order);
CREATE INDEX idx_pricing_visible ON souvera_pricing_display(is_visible);

-- RLS Policies for Pricing Display
ALTER TABLE souvera_pricing_display ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pricing_public_read" ON souvera_pricing_display
  FOR SELECT
  TO public
  USING (is_visible = true);

CREATE POLICY "pricing_admin_all" ON souvera_pricing_display
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM souvera_organization_members
      WHERE souvera_organization_members.user_id = auth.uid()
      AND souvera_organization_members.role IN ('super_admin', 'platform_admin')
    )
  );


-- ============================================
-- 4. Trust Logos Table
-- Data source badges and partner logos
-- ============================================

CREATE TABLE IF NOT EXISTS souvera_trust_logos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  abbreviation text NOT NULL,
  logo_url text,
  color text DEFAULT '#2563EB',
  note text,
  website_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES souvera_profiles(id),
  updated_by uuid REFERENCES souvera_profiles(id)
);

CREATE INDEX idx_trust_logos_display_order ON souvera_trust_logos(display_order);
CREATE INDEX idx_trust_logos_active ON souvera_trust_logos(is_active);

-- RLS Policies for Trust Logos
ALTER TABLE souvera_trust_logos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trust_logos_public_read" ON souvera_trust_logos
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "trust_logos_admin_all" ON souvera_trust_logos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM souvera_organization_members
      WHERE souvera_organization_members.user_id = auth.uid()
      AND souvera_organization_members.role IN ('super_admin', 'platform_admin')
    )
  );


-- ============================================
-- 5. Feature Flags Table
-- Platform feature toggles
-- ============================================

CREATE TABLE IF NOT EXISTS souvera_feature_flags (
  flag_key text PRIMARY KEY,
  description text,
  is_enabled boolean DEFAULT false,
  scope text DEFAULT 'global' CHECK (scope IN ('global', 'admin', 'user', 'tier')),
  tier_restriction text[],
  metadata jsonb DEFAULT '{}',
  updated_by uuid REFERENCES souvera_profiles(id),
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_feature_flags_enabled ON souvera_feature_flags(is_enabled);
CREATE INDEX idx_feature_flags_scope ON souvera_feature_flags(scope);

-- RLS Policies for Feature Flags
ALTER TABLE souvera_feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feature_flags_public_read" ON souvera_feature_flags
  FOR SELECT
  TO public
  USING (scope = 'global' AND is_enabled = true);

CREATE POLICY "feature_flags_authenticated_read" ON souvera_feature_flags
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "feature_flags_admin_all" ON souvera_feature_flags
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM souvera_organization_members
      WHERE souvera_organization_members.user_id = auth.uid()
      AND souvera_organization_members.role IN ('super_admin', 'platform_admin')
    )
  );


-- ============================================
-- 6. Marketing CMS Audit Log Table
-- Track all CMS changes
-- ============================================

CREATE TABLE IF NOT EXISTS souvera_marketing_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('create', 'update', 'delete', 'reorder')),
  old_values jsonb,
  new_values jsonb,
  changed_by uuid REFERENCES souvera_profiles(id),
  changed_at timestamptz DEFAULT now()
);

CREATE INDEX idx_marketing_audit_table ON souvera_marketing_audit_log(table_name);
CREATE INDEX idx_marketing_audit_record ON souvera_marketing_audit_log(record_id);
CREATE INDEX idx_marketing_audit_date ON souvera_marketing_audit_log(changed_at);

-- RLS Policies for Audit Log
ALTER TABLE souvera_marketing_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "marketing_audit_admin_read" ON souvera_marketing_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM souvera_organization_members
      WHERE souvera_organization_members.user_id = auth.uid()
      AND souvera_organization_members.role IN ('super_admin', 'platform_admin')
    )
  );

CREATE POLICY "marketing_audit_admin_insert" ON souvera_marketing_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM souvera_organization_members
      WHERE souvera_organization_members.user_id = auth.uid()
      AND souvera_organization_members.role IN ('super_admin', 'platform_admin')
    )
  );


-- ============================================
-- Triggers for updated_at timestamps
-- ============================================

CREATE OR REPLACE FUNCTION update_marketing_cms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_hero_slides_updated_at
  BEFORE UPDATE ON souvera_hero_slides
  FOR EACH ROW
  EXECUTE FUNCTION update_marketing_cms_updated_at();

CREATE TRIGGER trigger_flash_banners_updated_at
  BEFORE UPDATE ON souvera_flash_banners
  FOR EACH ROW
  EXECUTE FUNCTION update_marketing_cms_updated_at();

CREATE TRIGGER trigger_pricing_display_updated_at
  BEFORE UPDATE ON souvera_pricing_display
  FOR EACH ROW
  EXECUTE FUNCTION update_marketing_cms_updated_at();

CREATE TRIGGER trigger_trust_logos_updated_at
  BEFORE UPDATE ON souvera_trust_logos
  FOR EACH ROW
  EXECUTE FUNCTION update_marketing_cms_updated_at();

CREATE TRIGGER trigger_feature_flags_updated_at
  BEFORE UPDATE ON souvera_feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_marketing_cms_updated_at();


-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON TABLE souvera_hero_slides IS 'Homepage carousel slides with marketing content';
COMMENT ON TABLE souvera_flash_banners IS 'Announcement banners with optional scheduling';
COMMENT ON TABLE souvera_pricing_display IS 'Pricing plan display configuration';
COMMENT ON TABLE souvera_trust_logos IS 'Data source and partner logos for trust section';
COMMENT ON TABLE souvera_feature_flags IS 'Platform-wide feature toggles';
COMMENT ON TABLE souvera_marketing_audit_log IS 'Audit trail for all marketing CMS changes';
