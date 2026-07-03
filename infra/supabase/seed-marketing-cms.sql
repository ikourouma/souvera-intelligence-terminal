-- ===========================================
-- SOUVERA INTELLIGENCE TERMINAL
-- Marketing CMS Seed Data
-- Owner: Afronovation, Inc.
-- Created: June 14, 2026
-- ===========================================

-- Note: Run this script AFTER running the migration to create the tables.
-- This seeds initial content based on existing hardcoded data.

-- ============================================
-- Seed Hero Slides
-- ============================================

INSERT INTO souvera_hero_slides (
  badge, title, subtitle,
  cta_primary_label, cta_primary_url,
  cta_secondary_label, cta_secondary_url,
  stat_1_value, stat_1_label,
  stat_2_value, stat_2_label,
  ticker_items, accent_color,
  display_order, is_active
) VALUES
(
  'Intelligence Platform',
  'The Africa &
Caribbean
Decision Engine.',
  'Institutional-grade macroeconomic intelligence for governments, investors, and enterprises across African and Caribbean markets.',
  'Explore Platform', '/platform',
  'Request Access', '/access/request-access',
  '50+', 'Markets Covered',
  '6', 'Key Sectors',
  '["ZAF ▲ 1.2%", "NGA ▲ 3.4%", "KEN ▲ 5.0%", "ETH ▲ 7.1%"]',
  '#2563EB',
  0, true
),
(
  'Regional Intelligence',
  'Africa-Caribbean
Trade Intelligence.
Powered by Data.',
  'Connecting institutional capital with comprehensive intelligence across the transatlantic trade corridor — from Lagos to Kingston.',
  'Africa Intelligence', '/intelligence/africa',
  'Caribbean Intelligence', '/intelligence/caribbean',
  '$1.9T', 'Sub-Saharan GDP',
  '$270B', 'Caribbean GDP',
  '["DOM ▲ 5.1%", "JAM ▲ 4.2%", "GUY ▲ 6.2%", "TTO LNG"]',
  '#0891B2',
  1, true
),
(
  'Sector Intelligence',
  'Strategic Sectors.
Data-Driven
Insights.',
  'From African fintech to Caribbean energy — Souvera delivers the intelligence institutional investors need to move with conviction.',
  'Explore Sectors', '/sectors',
  'Request Demo', '/access/request-demo',
  '$14B', 'Fintech Market',
  '$320B', 'Mining & Minerals',
  '["Mining ▲ 12.4%", "Fintech ▲ 28%", "Energy ▲ 8.1%", "Agri ▲ 6.5%"]',
  '#16A34A',
  2, true
)
ON CONFLICT DO NOTHING;


-- ============================================
-- Seed Flash Banner
-- ============================================

INSERT INTO souvera_flash_banners (
  label, message, banner_type,
  link_text, link_url,
  background_gradient,
  is_active, display_order
) VALUES
(
  'Now Live',
  'Souvera Intelligence Terminal — Africa & Caribbean market intelligence now available.',
  'info',
  'Explore Platform', '/platform',
  'linear-gradient(90deg, #1d4ed8 0%, #1e3a8a 40%, #166534 100%)',
  true, 0
)
ON CONFLICT DO NOTHING;


-- ============================================
-- Seed Pricing Display
-- ============================================

INSERT INTO souvera_pricing_display (
  plan_id, display_name, badge_text, badge_color,
  description, price_monthly, features,
  cta_text, cta_url, cta_style,
  is_featured, is_visible, display_order
) VALUES
(
  'explorer', 'Explorer', 'Free', '#22C55E',
  'Get started with public macroeconomic data across Africa and the Caribbean.',
  0,
  '["Country profiles & GDP overview", "Market signal indicators", "Regional intelligence summaries", "Interactive intelligence map", "Caribbean overview"]',
  'Request Access', '/access/request-access', 'outline',
  false, true, 0
),
(
  'professional', 'Professional', 'Most Popular', '#2563EB',
  'Full macro data, sector intelligence, and expanded analysis for active analysts.',
  49,
  '["Everything in Explorer", "Inflation & Debt/GDP metrics", "Sector scores & analysis", "Expanded market coverage", "GDP forecast data", "Trade summary data", "Country comparison tools"]',
  'View Plans', '/access', 'primary',
  true, true, 1
),
(
  'business', 'Business', 'Recommended', '#F59E0B',
  'Full forecasts, trade data, and downloadable reports for investment teams.',
  199,
  '["Everything in Professional", "Full GDP forecasts & scenarios", "Full trade data — exports, imports, partners", "Sector forecasts", "Downloadable country reports", "Historical data series"]',
  'View Plans', '/access', 'outline',
  false, true, 2
),
(
  'institutional', 'Institutional', 'Enterprise', '#A78BFA',
  'Full API access, white-label intelligence, and dedicated support for institutions.',
  1999,
  '["Everything in Business", "Full API access", "White-label data feeds", "Custom briefings & memos", "Methodology documentation", "Dedicated account support"]',
  'Contact Sales', '/contact', 'ghost',
  false, true, 3
)
ON CONFLICT (plan_id) DO NOTHING;


-- ============================================
-- Seed Trust Logos
-- ============================================

INSERT INTO souvera_trust_logos (
  name, abbreviation, color, note,
  display_order, is_active
) VALUES
('World Bank', 'WB', '#2563EB', 'Macro · Weekly', 0, true),
('Intl Monetary Fund', 'IMF', '#16A34A', 'Forecasts · Monthly', 1, true),
('UN Comtrade', 'UNC', '#7C3AED', 'Trade · Monthly', 2, true),
('African Dev Bank', 'AfDB', '#F59E0B', 'Africa · Monthly', 3, true),
('GDELT Project', 'GDL', '#DC2626', 'Signals · Hourly', 4, true),
('OECD / DB Nomics', 'OEC', '#0891B2', 'Macro · Monthly', 5, true),
('UNCTAD', 'UNC', '#EA580C', 'FDI · Quarterly', 6, true),
('Intl Energy Agency', 'IEA', '#4F46E5', 'Energy · Monthly', 7, true)
ON CONFLICT DO NOTHING;


-- ============================================
-- Seed Feature Flags
-- ============================================

INSERT INTO souvera_feature_flags (
  flag_key, description, is_enabled, scope
) VALUES
-- Content Management Flags
('enable_new_homepage_hero', 'Display the new CMS-managed hero carousel', true, 'global'),
('enable_caribbean_intelligence', 'Enable Caribbean region intelligence features', true, 'global'),
('enable_trade_intelligence', 'Enable trade intelligence module', true, 'global'),

-- Platform Access Flags
('enable_api_access', 'Allow API access for institutional users', true, 'tier'),
('enable_reports_download', 'Allow users to download reports', true, 'tier'),
('enable_sector_forecasts', 'Enable sector forecast data', true, 'tier'),
('enable_country_comparison', 'Enable country comparison tools', true, 'tier'),

-- Security & Content Protection Flags
('allow_right_click_copy', 'Allow non-authenticated users to right-click and copy content', false, 'global'),
('allow_text_selection', 'Allow text selection for non-authenticated users', false, 'global'),
('allow_screenshot_tools', 'Allow browser screenshot extensions (experimental)', false, 'global'),
('enable_watermark', 'Add watermark to exported reports and charts', true, 'tier'),

-- System & Maintenance Flags
('maintenance_mode', 'Put the platform in maintenance mode', false, 'global'),
('enable_beta_features', 'Enable experimental beta features for testing', false, 'admin'),
('enable_analytics_tracking', 'Enable user analytics and behavior tracking', true, 'global'),
('enable_error_reporting', 'Send error reports to monitoring service', true, 'global'),

-- Marketing & Engagement Flags
('show_pricing_on_landing', 'Display pricing information on landing page', true, 'global'),
('enable_newsletter_popup', 'Show newsletter signup popup to visitors', true, 'global'),
('enable_chat_support', 'Enable live chat support widget', false, 'global'),
('enable_referral_program', 'Enable user referral program features', false, 'tier'),

-- Data & Intelligence Flags
('enable_real_time_data', 'Enable real-time data updates (when available)', true, 'tier'),
('enable_historical_data', 'Allow access to historical data series', true, 'tier'),
('enable_data_export', 'Allow data export in CSV/Excel formats', true, 'tier'),
('enable_custom_dashboards', 'Allow users to create custom dashboards', false, 'tier')
ON CONFLICT (flag_key) DO NOTHING;


-- ============================================
-- Create Storage Bucket (if using Supabase CLI)
-- Run this in Supabase Dashboard → Storage → New Bucket
-- ============================================
-- Bucket Name: marketing-assets
-- Public: Yes
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
-- Max file size: 5MB


-- ============================================
-- Done
-- ============================================

SELECT 
  'Seed complete. Check counts:' as message,
  (SELECT COUNT(*) FROM souvera_hero_slides) as hero_slides,
  (SELECT COUNT(*) FROM souvera_flash_banners) as flash_banners,
  (SELECT COUNT(*) FROM souvera_pricing_display) as pricing_plans,
  (SELECT COUNT(*) FROM souvera_trust_logos) as trust_logos,
  (SELECT COUNT(*) FROM souvera_feature_flags) as feature_flags;
