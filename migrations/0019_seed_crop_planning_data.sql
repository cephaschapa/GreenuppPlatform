-- Seed crop planning reference data (Zambia)
-- Run after 0018_crop_planning_seed_variety_yield_simulation.sql

-- crop_ref: Maize
INSERT INTO crop_ref (name, category, default_water_requirement_mm, default_gdd_range)
SELECT 'Maize', 'cereal', 500, '{"min": 1200, "max": 1800}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM crop_ref WHERE name = 'Maize');

-- seed_companies
INSERT INTO seed_companies (name, country, website)
SELECT 'SeedCo Zambia', 'ZM', 'https://www.seedco.co.zm'
WHERE NOT EXISTS (SELECT 1 FROM seed_companies WHERE name = 'SeedCo Zambia');
INSERT INTO seed_companies (name, country, website)
SELECT 'Pioneer (Corteva)', 'ZM', 'https://www.corteva.com'
WHERE NOT EXISTS (SELECT 1 FROM seed_companies WHERE name = 'Pioneer (Corteva)');

-- seed_varieties (get crop_id and company_id from existing rows)
INSERT INTO seed_varieties (
  crop_id, company_id, name, code, type, grain_color, maturity_class,
  days_to_maturity_min, days_to_maturity_max, yield_potential_t_ha_min, yield_potential_t_ha_max,
  traits, recommended_regions, recommended_planting_window, source_url, last_verified_at, is_active
)
SELECT
  c.id,
  (SELECT id FROM seed_companies WHERE name = 'SeedCo Zambia' LIMIT 1),
  'SC 719', 'SC719', 'hybrid', 'white', 'medium',
  125, 135, 6, 10,
  '{"drought_tolerant": true, "disease_tolerance": ["MSV", "GLS"]}'::jsonb,
  ARRAY['I','II','III'],
  '{"start_month": 10, "end_month": 12, "notes": "Early to mid-season"}'::jsonb,
  'https://www.seedco.co.zm', '2025-01-01'::date, true
FROM crop_ref c WHERE c.name = 'Maize' AND NOT EXISTS (SELECT 1 FROM seed_varieties WHERE code = 'SC719') LIMIT 1;

INSERT INTO seed_varieties (
  crop_id, company_id, name, code, type, grain_color, maturity_class,
  days_to_maturity_min, days_to_maturity_max, yield_potential_t_ha_min, yield_potential_t_ha_max,
  traits, recommended_regions, recommended_planting_window, source_url, last_verified_at, is_active
)
SELECT c.id, (SELECT id FROM seed_companies WHERE name = 'SeedCo Zambia' LIMIT 1),
  'SC 637', 'SC637', 'hybrid', 'white', 'early', 115, 125, 5.5, 9,
  '{"drought_tolerant": true}'::jsonb, ARRAY['I','II'],
  '{"start_month": 11, "end_month": 12}'::jsonb, 'https://www.seedco.co.zm', '2025-01-01'::date, true
FROM crop_ref c WHERE c.name = 'Maize' AND NOT EXISTS (SELECT 1 FROM seed_varieties WHERE code = 'SC637') LIMIT 1;

INSERT INTO seed_varieties (
  crop_id, company_id, name, code, type, grain_color, maturity_class,
  days_to_maturity_min, days_to_maturity_max, yield_potential_t_ha_min, yield_potential_t_ha_max,
  traits, recommended_regions, recommended_planting_window, source_url, last_verified_at, is_active
)
SELECT c.id, (SELECT id FROM seed_companies WHERE name = 'SeedCo Zambia' LIMIT 1),
  'SC 513', 'SC513', 'hybrid', 'white', 'late', 135, 150, 7, 11,
  '{"drought_tolerant": false}'::jsonb, ARRAY['II','III'],
  '{"start_month": 10, "end_month": 11}'::jsonb, 'https://www.seedco.co.zm', '2025-01-01'::date, true
FROM crop_ref c WHERE c.name = 'Maize' AND NOT EXISTS (SELECT 1 FROM seed_varieties WHERE code = 'SC513') LIMIT 1;

INSERT INTO seed_varieties (
  crop_id, company_id, name, code, type, grain_color, maturity_class,
  days_to_maturity_min, days_to_maturity_max, yield_potential_t_ha_min, yield_potential_t_ha_max,
  traits, recommended_regions, recommended_planting_window, source_url, last_verified_at, is_active
)
SELECT c.id, (SELECT id FROM seed_companies WHERE name = 'Pioneer (Corteva)' LIMIT 1),
  'Pioneer P30B19', 'P30B19', 'hybrid', 'white', 'early', 110, 120, 5, 8.5,
  '{"drought_tolerant": true}'::jsonb, ARRAY['I','II','III'],
  '{"start_month": 10, "end_month": 12}'::jsonb, 'https://www.corteva.com', '2025-01-01'::date, true
FROM crop_ref c WHERE c.name = 'Maize' AND NOT EXISTS (SELECT 1 FROM seed_varieties WHERE code = 'P30B19') LIMIT 1;

INSERT INTO seed_varieties (
  crop_id, company_id, name, code, type, grain_color, maturity_class,
  days_to_maturity_min, days_to_maturity_max, yield_potential_t_ha_min, yield_potential_t_ha_max,
  traits, recommended_regions, recommended_planting_window, source_url, last_verified_at, is_active
)
SELECT c.id, (SELECT id FROM seed_companies WHERE name = 'Pioneer (Corteva)' LIMIT 1),
  'Pioneer P30G19', 'P30G19', 'hybrid', 'white', 'medium', 120, 130, 6, 10,
  '{"drought_tolerant": true}'::jsonb, ARRAY['II','III'],
  '{"start_month": 10, "end_month": 11}'::jsonb, 'https://www.corteva.com', '2025-01-01'::date, true
FROM crop_ref c WHERE c.name = 'Maize' AND NOT EXISTS (SELECT 1 FROM seed_varieties WHERE code = 'P30G19') LIMIT 1;

-- seasons
INSERT INTO seasons (name, start_date, end_date)
SELECT '2025/26', '2025-10-01'::date, '2026-04-30'::date
WHERE NOT EXISTS (SELECT 1 FROM seasons WHERE name = '2025/26');
INSERT INTO seasons (name, start_date, end_date)
SELECT '2026/27', '2026-10-01'::date, '2027-04-30'::date
WHERE NOT EXISTS (SELECT 1 FROM seasons WHERE name = '2026/27');

-- agro_ecological_regions (Zambia)
INSERT INTO agro_ecological_regions (province, district, region)
SELECT 'Lusaka', NULL, 'II' WHERE NOT EXISTS (SELECT 1 FROM agro_ecological_regions WHERE province = 'Lusaka');
INSERT INTO agro_ecological_regions (province, district, region)
SELECT 'Copperbelt', NULL, 'III' WHERE NOT EXISTS (SELECT 1 FROM agro_ecological_regions WHERE province = 'Copperbelt');
INSERT INTO agro_ecological_regions (province, district, region)
SELECT 'Central', NULL, 'II' WHERE NOT EXISTS (SELECT 1 FROM agro_ecological_regions WHERE province = 'Central');
INSERT INTO agro_ecological_regions (province, district, region)
SELECT 'Eastern', NULL, 'I' WHERE NOT EXISTS (SELECT 1 FROM agro_ecological_regions WHERE province = 'Eastern');
INSERT INTO agro_ecological_regions (province, district, region)
SELECT 'Southern', NULL, 'I' WHERE NOT EXISTS (SELECT 1 FROM agro_ecological_regions WHERE province = 'Southern');
INSERT INTO agro_ecological_regions (province, district, region)
SELECT 'Northern', NULL, 'III' WHERE NOT EXISTS (SELECT 1 FROM agro_ecological_regions WHERE province = 'Northern');
INSERT INTO agro_ecological_regions (province, district, region)
SELECT 'Luapula', NULL, 'III' WHERE NOT EXISTS (SELECT 1 FROM agro_ecological_regions WHERE province = 'Luapula');
INSERT INTO agro_ecological_regions (province, district, region)
SELECT 'North-Western', NULL, 'III' WHERE NOT EXISTS (SELECT 1 FROM agro_ecological_regions WHERE province = 'North-Western');
INSERT INTO agro_ecological_regions (province, district, region)
SELECT 'Western', NULL, 'II' WHERE NOT EXISTS (SELECT 1 FROM agro_ecological_regions WHERE province = 'Western');
INSERT INTO agro_ecological_regions (province, district, region)
SELECT 'Muchinga', NULL, 'III' WHERE NOT EXISTS (SELECT 1 FROM agro_ecological_regions WHERE province = 'Muchinga');
