-- Quick check: Does Nigeria exist in souvera_countries?
SELECT iso3, name, region FROM souvera_countries WHERE iso3 = 'NGA';

-- If not found, let's see what countries we DO have:
SELECT iso3, name, region FROM souvera_countries ORDER BY name LIMIT 10;
