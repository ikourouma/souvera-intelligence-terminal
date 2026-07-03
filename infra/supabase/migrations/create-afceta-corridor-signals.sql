-- AfCETA Corridor Opportunity Signals
-- Derived Africa ↔ Caribbean trade corridor intelligence (Tier C/A)

CREATE TABLE IF NOT EXISTS souvera_afceta_corridor_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_iso3 VARCHAR(3) NOT NULL,
  origin_name VARCHAR(100) NOT NULL,
  dest_iso3 VARCHAR(3) NOT NULL,
  dest_name VARCHAR(100) NOT NULL,
  direction VARCHAR(24) NOT NULL CHECK (direction IN ('africa_to_caribbean', 'caribbean_to_africa')),
  category_group VARCHAR(50) NOT NULL,
  category_label VARCHAR(100) NOT NULL,
  pillar_key VARCHAR(32) NOT NULL,
  origin_capacity_usd BIGINT DEFAULT 0,
  dest_demand_usd BIGINT DEFAULT 0,
  opportunity_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  caribbean_asset_class VARCHAR(24),
  top_products JSONB DEFAULT '[]'::jsonb,
  data_quality_tier CHAR(1) NOT NULL DEFAULT 'C' CHECK (data_quality_tier IN ('A', 'B', 'C')),
  methodology_note TEXT,
  data_year INTEGER NOT NULL DEFAULT 2023,
  source_notes TEXT,
  is_spotlight BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (origin_iso3, dest_iso3, direction, category_group, data_year)
);

CREATE INDEX IF NOT EXISTS idx_afceta_corridor_direction ON souvera_afceta_corridor_signals (direction, data_year);
CREATE INDEX IF NOT EXISTS idx_afceta_corridor_score ON souvera_afceta_corridor_signals (opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_afceta_corridor_spotlight ON souvera_afceta_corridor_signals (is_spotlight) WHERE is_spotlight = TRUE;

ALTER TABLE souvera_afceta_corridor_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read afceta corridor signals"
  ON souvera_afceta_corridor_signals FOR SELECT TO public USING (true);

CREATE POLICY "Service role full access afceta corridor"
  ON souvera_afceta_corridor_signals FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE souvera_afceta_corridor_signals IS
  'AfCETA corridor opportunity index — derived supply/demand matching. Not UN Comtrade bilateral customs totals.';
