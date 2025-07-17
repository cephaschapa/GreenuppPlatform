-- Add locationId column to fields table to link with locations table
ALTER TABLE "fields" ADD COLUMN "location_id" integer;

-- Add foreign key constraint
ALTER TABLE "fields" ADD CONSTRAINT "fields_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE set null ON UPDATE no action; 