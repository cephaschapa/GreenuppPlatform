-- Add trust and transparency features to marketplace listings
-- This migration enhances marketplace listings with blockchain verification,
-- Greenupp verification, farm details, compliance, and quality assurance features

-- Add new columns to marketplace_listings table
ALTER TABLE marketplace_listings 
ADD COLUMN IF NOT EXISTS blockchain_id text,
ADD COLUMN IF NOT EXISTS blockchain_tx_hash text,
ADD COLUMN IF NOT EXISTS blockchain_verified_at timestamp,
ADD COLUMN IF NOT EXISTS greenupp_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS greenupp_verified_at timestamp,
ADD COLUMN IF NOT EXISTS greenupp_verification_level text DEFAULT 'basic', -- basic, premium, certified
ADD COLUMN IF NOT EXISTS farm_name text,
ADD COLUMN IF NOT EXISTS farm_location text,
ADD COLUMN IF NOT EXISTS farm_size text,
ADD COLUMN IF NOT EXISTS farm_type text,
ADD COLUMN IF NOT EXISTS farm_established_year integer,
ADD COLUMN IF NOT EXISTS farm_certifications text[], -- Array of farm certifications
ADD COLUMN IF NOT EXISTS farm_compliance_status text DEFAULT 'pending', -- pending, compliant, non_compliant
ADD COLUMN IF NOT EXISTS farm_audit_date timestamp,
ADD COLUMN IF NOT EXISTS quality_score decimal(3,2), -- 0.00 to 5.00 quality rating
ADD COLUMN IF NOT EXISTS quality_tested boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS quality_test_date timestamp,
ADD COLUMN IF NOT EXISTS quality_test_results jsonb, -- Detailed test results
ADD COLUMN IF NOT EXISTS organic_certified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS organic_certification_id text,
ADD COLUMN IF NOT EXISTS fair_trade_certified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS fair_trade_certification_id text,
ADD COLUMN IF NOT EXISTS sustainability_score decimal(3,2), -- 0.00 to 5.00 sustainability rating
ADD COLUMN IF NOT EXISTS carbon_footprint decimal(10,2), -- CO2 equivalent in kg
ADD COLUMN IF NOT EXISTS water_usage decimal(10,2), -- Water usage in liters
ADD COLUMN IF NOT EXISTS pesticide_free boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS gmo_free boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS local_sourced boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS harvest_date date,
ADD COLUMN IF NOT EXISTS expiry_date date,
ADD COLUMN IF NOT EXISTS storage_conditions text,
ADD COLUMN IF NOT EXISTS transport_method text,
ADD COLUMN IF NOT EXISTS packaging_type text,
ADD COLUMN IF NOT EXISTS packaging_material text,
ADD COLUMN IF NOT EXISTS packaging_recyclable boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS seller_rating decimal(3,2), -- Average seller rating
ADD COLUMN IF NOT EXISTS seller_review_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS seller_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS seller_verified_at timestamp,
ADD COLUMN IF NOT EXISTS trust_score decimal(3,2), -- Overall trust score 0.00 to 5.00
ADD COLUMN IF NOT EXISTS transparency_level text DEFAULT 'basic'; -- basic, enhanced, premium

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_blockchain_verified ON marketplace_listings(blockchain_verified);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_greenupp_verified ON marketplace_listings(greenupp_verified);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_organic_certified ON marketplace_listings(organic_certified);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_quality_score ON marketplace_listings(quality_score);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_trust_score ON marketplace_listings(trust_score);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_sustainability_score ON marketplace_listings(sustainability_score);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_farm_compliance_status ON marketplace_listings(farm_compliance_status);

-- Add comments for documentation
COMMENT ON COLUMN marketplace_listings.blockchain_id IS 'Unique blockchain identifier for this listing';
COMMENT ON COLUMN marketplace_listings.blockchain_tx_hash IS 'Blockchain transaction hash for verification';
COMMENT ON COLUMN marketplace_listings.blockchain_verified_at IS 'Timestamp when blockchain verification was completed';
COMMENT ON COLUMN marketplace_listings.greenupp_verified IS 'Whether this listing has been verified by Greenupp platform';
COMMENT ON COLUMN marketplace_listings.greenupp_verification_level IS 'Level of Greenupp verification: basic, premium, certified';
COMMENT ON COLUMN marketplace_listings.farm_name IS 'Name of the farm producing this product';
COMMENT ON COLUMN marketplace_listings.farm_location IS 'Location of the farm';
COMMENT ON COLUMN marketplace_listings.farm_size IS 'Size of the farm';
COMMENT ON COLUMN marketplace_listings.farm_type IS 'Type of farm (organic, conventional, etc.)';
COMMENT ON COLUMN marketplace_listings.farm_established_year IS 'Year the farm was established';
COMMENT ON COLUMN marketplace_listings.farm_certifications IS 'Array of farm certifications';
COMMENT ON COLUMN marketplace_listings.farm_compliance_status IS 'Compliance status: pending, compliant, non_compliant';
COMMENT ON COLUMN marketplace_listings.quality_score IS 'Quality rating from 0.00 to 5.00';
COMMENT ON COLUMN marketplace_listings.quality_tested IS 'Whether the product has been quality tested';
COMMENT ON COLUMN marketplace_listings.quality_test_results IS 'Detailed quality test results as JSON';
COMMENT ON COLUMN marketplace_listings.organic_certified IS 'Whether the product is organic certified';
COMMENT ON COLUMN marketplace_listings.fair_trade_certified IS 'Whether the product is fair trade certified';
COMMENT ON COLUMN marketplace_listings.sustainability_score IS 'Sustainability rating from 0.00 to 5.00';
COMMENT ON COLUMN marketplace_listings.carbon_footprint IS 'Carbon footprint in CO2 equivalent kg';
COMMENT ON COLUMN marketplace_listings.water_usage IS 'Water usage in liters';
COMMENT ON COLUMN marketplace_listings.pesticide_free IS 'Whether the product is pesticide free';
COMMENT ON COLUMN marketplace_listings.gmo_free IS 'Whether the product is GMO free';
COMMENT ON COLUMN marketplace_listings.local_sourced IS 'Whether the product is locally sourced';
COMMENT ON COLUMN marketplace_listings.harvest_date IS 'Date when the product was harvested';
COMMENT ON COLUMN marketplace_listings.expiry_date IS 'Expiry date of the product';
COMMENT ON COLUMN marketplace_listings.storage_conditions IS 'Storage conditions for the product';
COMMENT ON COLUMN marketplace_listings.transport_method IS 'Method of transport used';
COMMENT ON COLUMN marketplace_listings.packaging_type IS 'Type of packaging used';
COMMENT ON COLUMN marketplace_listings.packaging_material IS 'Material used for packaging';
COMMENT ON COLUMN marketplace_listings.packaging_recyclable IS 'Whether the packaging is recyclable';
COMMENT ON COLUMN marketplace_listings.seller_rating IS 'Average rating of the seller';
COMMENT ON COLUMN marketplace_listings.seller_review_count IS 'Number of reviews for the seller';
COMMENT ON COLUMN marketplace_listings.seller_verified IS 'Whether the seller is verified';
COMMENT ON COLUMN marketplace_listings.trust_score IS 'Overall trust score from 0.00 to 5.00';
COMMENT ON COLUMN marketplace_listings.transparency_level IS 'Level of transparency: basic, enhanced, premium'; 