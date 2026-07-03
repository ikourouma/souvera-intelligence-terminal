-- AGOA trade flows: default to NOT eligible (vault reconciliation sets true explicitly)
ALTER TABLE public.souvera_agoa_trade_flows
  ALTER COLUMN agoa_eligible SET DEFAULT FALSE;

ALTER TABLE public.souvera_agoa_trade_flows
  ALTER COLUMN agoa_status SET DEFAULT 'suspended';
