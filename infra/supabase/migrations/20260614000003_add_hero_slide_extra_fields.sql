-- ===========================================
-- SOUVERA INTELLIGENCE TERMINAL
-- Add Extra Hero Slide Fields + Trust Logo Abbreviation Constraint
-- Owner: Afronovation, Inc.
-- Created: June 14, 2026
-- ===========================================

-- Add tertiary CTA fields to hero_slides
ALTER TABLE souvera_hero_slides 
  ADD COLUMN IF NOT EXISTS cta_tertiary_label text,
  ADD COLUMN IF NOT EXISTS cta_tertiary_url text;

-- Add third stat fields to hero_slides
ALTER TABLE souvera_hero_slides 
  ADD COLUMN IF NOT EXISTS stat_3_value text,
  ADD COLUMN IF NOT EXISTS stat_3_label text;

-- Add abbreviation length constraint to trust_logos (max 5 characters)
ALTER TABLE souvera_trust_logos 
  DROP CONSTRAINT IF EXISTS trust_logos_abbreviation_max_length;

ALTER TABLE souvera_trust_logos 
  ADD CONSTRAINT trust_logos_abbreviation_max_length 
  CHECK (LENGTH(abbreviation) <= 5);

-- Add show_price independent toggle to pricing_display
ALTER TABLE souvera_pricing_display
  ADD COLUMN IF NOT EXISTS show_price boolean DEFAULT true;

-- Success
SELECT 'Hero slide extra fields and trust logo constraint added successfully' as status;
