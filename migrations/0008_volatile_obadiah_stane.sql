ALTER TABLE "marketplace_listings" ADD COLUMN "blockchain_id" text;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "blockchain_tx_hash" text;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "blockchain_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "greenupp_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "greenupp_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "greenupp_verification_level" text DEFAULT 'basic';--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "farm_name" text;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "farm_location" text;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "farm_size" text;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "farm_type" text;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "farm_established_year" integer;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "farm_certifications" text[];--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "farm_compliance_status" text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "farm_audit_date" timestamp;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "quality_score" numeric(3, 2);--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "quality_tested" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "quality_test_date" timestamp;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "quality_test_results" jsonb;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "organic_certified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "organic_certification_id" text;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "fair_trade_certified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "fair_trade_certification_id" text;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "sustainability_score" numeric(3, 2);--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "carbon_footprint" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "water_usage" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "pesticide_free" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "gmo_free" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "local_sourced" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "harvest_date" date;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "expiry_date" date;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "storage_conditions" text;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "transport_method" text;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "packaging_type" text;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "packaging_material" text;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "packaging_recyclable" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "seller_rating" numeric(3, 2);--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "seller_review_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "seller_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "seller_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "trust_score" numeric(3, 2);--> statement-breakpoint
ALTER TABLE "marketplace_listings" ADD COLUMN "transparency_level" text DEFAULT 'basic';