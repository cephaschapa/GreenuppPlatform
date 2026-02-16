-- One-off: apply farmer onboarding schema (farmer_profiles columns + farms table + fields.farm_id)
-- Use when migration 0017 hasn't been run (e.g. production). Run against your DB:
--   PowerShell: psql $env:DATABASE_URL -f scripts/add-farmer-onboarding-columns.sql
--   Bash:       psql "$DATABASE_URL" -f scripts/add-farmer-onboarding-columns.sql

-- 1) farmer_profiles (Zambia-first onboarding)
ALTER TABLE "farmer_profiles" ADD COLUMN IF NOT EXISTS "province" text;
ALTER TABLE "farmer_profiles" ADD COLUMN IF NOT EXISTS "farmer_type" text;
ALTER TABLE "farmer_profiles" ADD COLUMN IF NOT EXISTS "years_farming" integer;
ALTER TABLE "farmer_profiles" ADD COLUMN IF NOT EXISTS "main_goal" text;
ALTER TABLE "farmer_profiles" ADD COLUMN IF NOT EXISTS "cooperative_member" boolean DEFAULT false;

-- 2) farms table (required for POST /api/user/onboarding/farm)
CREATE TABLE IF NOT EXISTS "farms" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id"),
  "farm_name" text DEFAULT 'My Farm' NOT NULL,
  "farm_location_text" text NOT NULL,
  "farm_location_source" text NOT NULL,
  "farm_location_id" integer,
  "lat" numeric(10, 7),
  "lng" numeric(10, 7),
  "farm_size_ha" numeric(8, 2) NOT NULL,
  "irrigation_type" text,
  "water_source_notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- 3) fields.farm_id (FK to farms)
ALTER TABLE "fields" ADD COLUMN IF NOT EXISTS "farm_id" integer REFERENCES "farms"("id");
