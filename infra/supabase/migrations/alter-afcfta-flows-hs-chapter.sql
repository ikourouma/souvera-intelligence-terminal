-- Alter hs_chapter to allow longer values (e.g., '84-85', '01-24')
ALTER TABLE souvera_afcfta_trade_flows 
  ALTER COLUMN hs_chapter TYPE VARCHAR(10);
