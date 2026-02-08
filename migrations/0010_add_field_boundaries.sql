-- Add field boundary columns to fields table
DO $$ BEGIN ALTER TABLE "fields" ADD COLUMN "boundary" jsonb; EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "fields" ADD COLUMN "calculated_area" numeric(12, 2); EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "fields" ADD COLUMN "center_lat" numeric(10, 7); EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE "fields" ADD COLUMN "center_lng" numeric(10, 7); EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "fields_boundary_idx" ON "fields" USING GIN ("boundary");
CREATE INDEX IF NOT EXISTS "fields_center_location_idx" ON "fields" ("center_lat", "center_lng");

-- Add comment for boundary column
COMMENT ON COLUMN "fields"."boundary" IS 'GeoJSON polygon representing field boundary';
COMMENT ON COLUMN "fields"."calculated_area" IS 'Field area in square meters calculated from boundary';
COMMENT ON COLUMN "fields"."center_lat" IS 'Center latitude calculated from boundary';
COMMENT ON COLUMN "fields"."center_lng" IS 'Center longitude calculated from boundary'; 