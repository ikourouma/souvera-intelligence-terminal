-- =========================================================
-- Unified entity registry (Africa + Caribbean, territories first-class)
-- =========================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_entity_region') THEN
    CREATE TYPE souvera_entity_region AS ENUM ('africa', 'caribbean');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_entity_type') THEN
    CREATE TYPE souvera_entity_type AS ENUM ('sovereign', 'territory');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'souvera_entity_coverage_status') THEN
    CREATE TYPE souvera_entity_coverage_status AS ENUM ('active', 'excluded');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.souvera_entities (
  entity_key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  iso2 TEXT,
  iso3 TEXT,
  region souvera_entity_region NOT NULL,
  entity_type souvera_entity_type NOT NULL DEFAULT 'sovereign',
  sovereign_parent_entity_key TEXT REFERENCES public.souvera_entities (entity_key) ON DELETE SET NULL,
  coverage_status souvera_entity_coverage_status NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_souvera_entities_region
  ON public.souvera_entities (region, coverage_status);

CREATE INDEX IF NOT EXISTS idx_souvera_entities_iso3
  ON public.souvera_entities (iso3) WHERE iso3 IS NOT NULL;

DROP TRIGGER IF EXISTS trg_souvera_entities_updated_at ON public.souvera_entities;
CREATE TRIGGER trg_souvera_entities_updated_at
BEFORE UPDATE ON public.souvera_entities
FOR EACH ROW EXECUTE FUNCTION public.souvera_set_updated_at();

ALTER TABLE public.souvera_entities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS souvera_entities_read ON public.souvera_entities;
CREATE POLICY souvera_entities_read ON public.souvera_entities
  FOR SELECT USING (true);

-- Policy publish statuses for CARICOM membership granularity
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'souvera_policy_publish_status' AND e.enumlabel = 'associate_member'
  ) THEN
    ALTER TYPE souvera_policy_publish_status ADD VALUE 'associate_member';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'souvera_policy_publish_status' AND e.enumlabel = 'not_a_member'
  ) THEN
    ALTER TYPE souvera_policy_publish_status ADD VALUE 'not_a_member';
  END IF;
END $$;
