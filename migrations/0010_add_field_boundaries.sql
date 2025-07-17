-- Add field boundary columns to fields table
ALTER TABLE "fields" ADD COLUMN "boundary" jsonb;
ALTER TABLE "fields" ADD COLUMN "calculated_area" numeric(12, 2);
ALTER TABLE "fields" ADD COLUMN "center_lat" numeric(10, 7);
ALTER TABLE "fields" ADD COLUMN "center_lng" numeric(10, 7);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "fields_boundary_idx" ON "fields" USING GIN ("boundary");
CREATE INDEX IF NOT EXISTS "fields_center_location_idx" ON "fields" ("center_lat", "center_lng");

-- Add comment for boundary column
COMMENT ON COLUMN "fields"."boundary" IS 'GeoJSON polygon representing field boundary';
COMMENT ON COLUMN "fields"."calculated_area" IS 'Field area in square meters calculated from boundary';
COMMENT ON COLUMN "fields"."center_lat" IS 'Center latitude calculated from boundary';
COMMENT ON COLUMN "fields"."center_lng" IS 'Center longitude calculated from boundary'; 