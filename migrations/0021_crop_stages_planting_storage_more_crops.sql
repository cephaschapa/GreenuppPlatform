-- Crop stage management: Planting and Post-harvest/Storage stages, plus stages for more crop types.
-- Run after 0020_add_more_reference_crops.sql so crop_ref names exist.

-- Maize: add Planting (day 0) and Post-harvest / Storage (after maturity)
INSERT INTO crop_growth_stages (crop_name, stage_name, stage_order, days_from_planting_min, days_from_planting_max, description, visual_indicators, care_actions, common_issues, notification_message)
SELECT 'Maize', 'Planting', 0, 0, 0, 'Seedbed preparation and planting', ARRAY['Land prepared', 'Seeds in soil', 'Correct spacing'], ARRAY['Prepare land', 'Use certified seed', 'Plant at onset of rains', 'Correct depth 3-5 cm'], ARRAY['Late planting', 'Poor seed quality', 'Wrong spacing'], 'Time to plant maize - ensure good seedbed and spacing'
WHERE NOT EXISTS (SELECT 1 FROM crop_growth_stages WHERE crop_name = 'Maize' AND stage_name = 'Planting');

INSERT INTO crop_growth_stages (crop_name, stage_name, stage_order, days_from_planting_min, days_from_planting_max, description, visual_indicators, care_actions, common_issues, notification_message)
SELECT 'Maize', 'Post-harvest / Storage', 7, 141, 365, 'Grain drying, shelling, and storage', ARRAY['Cobs dried', 'Grain shelled', 'Stored in dry place'], ARRAY['Dry to 13% moisture', 'Store in airtight bags or cribs', 'Treat against weevils', 'Keep storage dry and ventilated'], ARRAY['Weevils', 'Mould', 'Moisture damage'], 'Maize harvested - dry and store properly to avoid losses'
WHERE NOT EXISTS (SELECT 1 FROM crop_growth_stages WHERE crop_name = 'Maize' AND stage_name = 'Post-harvest / Storage');

-- Tomato: add Planting and Post-harvest / Storage
INSERT INTO crop_growth_stages (crop_name, stage_name, stage_order, days_from_planting_min, days_from_planting_max, description, visual_indicators, care_actions, common_issues, notification_message)
SELECT 'Tomato', 'Planting', 0, 0, 0, 'Nursery or direct planting', ARRAY['Seedlings or seeds in place', 'Spacing correct'], ARRAY['Prepare nursery or bed', 'Transplant at 3-4 true leaves', 'Stake or support plants'], ARRAY['Damping off', 'Transplant shock'], 'Plant or transplant tomatoes - ensure good establishment'
WHERE NOT EXISTS (SELECT 1 FROM crop_growth_stages WHERE crop_name = 'Tomato' AND stage_name = 'Planting');

INSERT INTO crop_growth_stages (crop_name, stage_name, stage_order, days_from_planting_min, days_from_planting_max, description, visual_indicators, care_actions, common_issues, notification_message)
SELECT 'Tomato', 'Post-harvest / Storage', 6, 86, 120, 'Harvest and short-term storage', ARRAY['Fruits harvested', 'Sorted and packed'], ARRAY['Harvest at breaker stage for transport', 'Store cool and dry', 'Use within 1-2 weeks or process'], ARRAY['Bruising', 'Ripening too fast'], 'Tomatoes harvested - store or sell promptly'
WHERE NOT EXISTS (SELECT 1 FROM crop_growth_stages WHERE crop_name = 'Tomato' AND stage_name = 'Post-harvest / Storage');

-- Wheat: full lifecycle (typical ~120 days to maturity; variety-dependent)
INSERT INTO crop_growth_stages (crop_name, stage_name, stage_order, days_from_planting_min, days_from_planting_max, description, visual_indicators, care_actions, common_issues, notification_message)
SELECT 'Wheat', 'Planting', 0, 0, 0, 'Land preparation and sowing', ARRAY['Seedbed ready', 'Seeds drilled or broadcast'], ARRAY['Prepare fine seedbed', 'Plant at recommended rate', 'Correct depth 2-4 cm'], ARRAY['Late planting', 'Poor emergence'], 'Time to plant wheat'
WHERE NOT EXISTS (SELECT 1 FROM crop_growth_stages WHERE crop_name = 'Wheat' AND stage_name = 'Planting');

INSERT INTO crop_growth_stages (crop_name, stage_name, stage_order, days_from_planting_min, days_from_planting_max, description, visual_indicators, care_actions, common_issues, notification_message)
SELECT 'Wheat', 'Germination', 1, 0, 14, 'Emergence and early growth', ARRAY['Coleoptile visible', 'First leaves'], ARRAY['Keep soil moist', 'Control weeds'], ARRAY['Poor stand', 'Bird damage'], 'Wheat germinating - check stand'
WHERE NOT EXISTS (SELECT 1 FROM crop_growth_stages WHERE crop_name = 'Wheat' AND stage_name = 'Germination');

INSERT INTO crop_growth_stages (crop_name, stage_name, stage_order, days_from_planting_min, days_from_planting_max, description, visual_indicators, care_actions, common_issues, notification_message)
SELECT 'Wheat', 'Tillering', 2, 14, 45, 'Tillers and vegetative growth', ARRAY['Multiple tillers', 'Leaves expanding'], ARRAY['Apply nitrogen', 'Weed control', 'Monitor for rust'], ARRAY['Rust', 'Aphids'], 'Wheat tillering - fertilize and scout'
WHERE NOT EXISTS (SELECT 1 FROM crop_growth_stages WHERE crop_name = 'Wheat' AND stage_name = 'Tillering');

INSERT INTO crop_growth_stages (crop_name, stage_name, stage_order, days_from_planting_min, days_from_planting_max, description, visual_indicators, care_actions, common_issues, notification_message)
SELECT 'Wheat', 'Stem Elongation', 3, 45, 75, 'Stem extension and jointing', ARRAY['Stems elongating', 'Flag leaf emerging'], ARRAY['Adequate water', 'Fungicide if needed'], ARRAY['Lodging', 'Disease'], 'Wheat stem elongation - critical for yield'
WHERE NOT EXISTS (SELECT 1 FROM crop_growth_stages WHERE crop_name = 'Wheat' AND stage_name = 'Stem Elongation');

INSERT INTO crop_growth_stages (crop_name, stage_name, stage_order, days_from_planting_min, days_from_planting_max, description, visual_indicators, care_actions, common_issues, notification_message)
SELECT 'Wheat', 'Heading / Flowering', 4, 75, 95, 'Head emergence and flowering', ARRAY['Heads emerging', 'Anthers visible'], ARRAY['Protect from moisture stress', 'Monitor diseases'], ARRAY['Head blight', 'Poor grain set'], 'Wheat heading - ensure good moisture'
WHERE NOT EXISTS (SELECT 1 FROM crop_growth_stages WHERE crop_name = 'Wheat' AND stage_name = 'Heading / Flowering');

INSERT INTO crop_growth_stages (crop_name, stage_name, stage_order, days_from_planting_min, days_from_planting_max, description, visual_indicators, care_actions, common_issues, notification_message)
SELECT 'Wheat', 'Grain Fill', 5, 95, 115, 'Grain development', ARRAY['Kernels filling', 'Leaves still green'], ARRAY['Maintain water', 'Monitor for lodging'], ARRAY['Early senescence', 'Lodging'], 'Wheat filling grain - monitor'
WHERE NOT EXISTS (SELECT 1 FROM crop_growth_stages WHERE crop_name = 'Wheat' AND stage_name = 'Grain Fill');

INSERT INTO crop_growth_stages (crop_name, stage_name, stage_order, days_from_planting_min, days_from_planting_max, description, visual_indicators, care_actions, common_issues, notification_message)
SELECT 'Wheat', 'Maturity', 6, 115, 140, 'Ripening and harvest readiness', ARRAY['Leaves drying', 'Grain hard'], ARRAY['Plan harvest', 'Dry to safe moisture'], ARRAY['Shattering', 'Rain at harvest'], 'Wheat maturing - prepare for harvest'
WHERE NOT EXISTS (SELECT 1 FROM crop_growth_stages WHERE crop_name = 'Wheat' AND stage_name = 'Maturity');

INSERT INTO crop_growth_stages (crop_name, stage_name, stage_order, days_from_planting_min, days_from_planting_max, description, visual_indicators, care_actions, common_issues, notification_message)
SELECT 'Wheat', 'Post-harvest / Storage', 7, 141, 365, 'Grain drying and storage', ARRAY['Grain threshed', 'Stored'], ARRAY['Dry to 12-13% moisture', 'Store in dry, rodent-proof place', 'Treat against insects'], ARRAY['Weevils', 'Mould'], 'Wheat harvested - dry and store properly'
WHERE NOT EXISTS (SELECT 1 FROM crop_growth_stages WHERE crop_name = 'Wheat' AND stage_name = 'Post-harvest / Storage');

-- Soybean: full lifecycle (~100-120 days typical)
INSERT INTO crop_growth_stages (crop_name, stage_name, stage_order, days_from_planting_min, days_from_planting_max, description, visual_indicators, care_actions, common_issues, notification_message)
SELECT 'Soybean', 'Planting', 0, 0, 0, 'Land preparation and sowing', ARRAY['Seedbed ready', 'Inoculated seed'], ARRAY['Inoculate seed with rhizobium', 'Plant at 2-4 cm depth', 'Good seed-soil contact'], ARRAY['Poor inoculation', 'Crusting'], 'Time to plant soybean - inoculate seed'
WHERE NOT EXISTS (SELECT 1 FROM crop_growth_stages WHERE crop_name = 'Soybean' AND stage_name = 'Planting');

INSERT INTO crop_growth_stages (crop_name, stage_name, stage_order, days_from_planting_min, days_from_planting_max, description, visual_indicators, care_actions, common_issues, notification_message)
SELECT 'Soybean', 'Germination', 1, 0, 10, 'Emergence', ARRAY['Cotyledons above ground', 'First trifoliate'], ARRAY['Keep moist', 'Control weeds'], ARRAY['Damping off', 'Birds'], 'Soybean emerging'
WHERE NOT EXISTS (SELECT 1 FROM crop_growth_stages WHERE crop_name = 'Soybean' AND stage_name = 'Germination');

INSERT INTO crop_growth_stages (crop_name, stage_name, stage_order, days_from_planting_min, days_from_planting_max, description, visual_indicators, care_actions, common_issues, notification_message)
SELECT 'Soybean', 'Vegetative', 2, 10, 45, 'Leaf and stem growth', ARRAY['Trifoliate leaves', 'Branches developing'], ARRAY['Weed control', 'Monitor for pests'], ARRAY['Aphids', 'Spider mites'], 'Soybean vegetative - weed and scout'
WHERE NOT EXISTS (SELECT 1 FROM crop_growth_stages WHERE crop_name = 'Soybean' AND stage_name = 'Vegetative');

INSERT INTO crop_growth_stages (crop_name, stage_name, stage_order, days_from_planting_min, days_from_planting_max, description, visual_indicators, care_actions, common_issues, notification_message)
SELECT 'Soybean', 'Flowering', 3, 45, 65, 'Flower formation', ARRAY['White/purple flowers', 'Pods beginning'], ARRAY['Adequate moisture', 'Avoid spraying during flowering'], ARRAY['Flower abortion', 'Pests'], 'Soybean flowering - critical for yield'
WHERE NOT EXISTS (SELECT 1 FROM crop_growth_stages WHERE crop_name = 'Soybean' AND stage_name = 'Flowering');

INSERT INTO crop_growth_stages (crop_name, stage_name, stage_order, days_from_planting_min, days_from_planting_max, description, visual_indicators, care_actions, common_issues, notification_message)
SELECT 'Soybean', 'Pod Fill', 4, 65, 95, 'Pod and seed development', ARRAY['Pods filling', 'Leaves yellowing'], ARRAY['Maintain moisture', 'Monitor for pod borers'], ARRAY['Pod shatter', 'Disease'], 'Soybean filling pods'
WHERE NOT EXISTS (SELECT 1 FROM crop_growth_stages WHERE crop_name = 'Soybean' AND stage_name = 'Pod Fill');

INSERT INTO crop_growth_stages (crop_name, stage_name, stage_order, days_from_planting_min, days_from_planting_max, description, visual_indicators, care_actions, common_issues, notification_message)
SELECT 'Soybean', 'Maturity', 5, 95, 120, 'Leaf drop and harvest', ARRAY['Leaves dropped', 'Pods brown', 'Seeds rattle'], ARRAY['Harvest when 95% pods brown', 'Combine or hand harvest'], ARRAY['Shattering', 'Moisture'], 'Soybean mature - harvest at right time'
WHERE NOT EXISTS (SELECT 1 FROM crop_growth_stages WHERE crop_name = 'Soybean' AND stage_name = 'Maturity');

INSERT INTO crop_growth_stages (crop_name, stage_name, stage_order, days_from_planting_min, days_from_planting_max, description, visual_indicators, care_actions, common_issues, notification_message)
SELECT 'Soybean', 'Post-harvest / Storage', 6, 121, 365, 'Drying and storage', ARRAY['Grain dried', 'Stored'], ARRAY['Dry to 13% moisture', 'Store in dry place', 'Protect from bruchids'], ARRAY['Bruchids', 'Mould'], 'Soybean harvested - dry and store'
WHERE NOT EXISTS (SELECT 1 FROM crop_growth_stages WHERE crop_name = 'Soybean' AND stage_name = 'Post-harvest / Storage');
