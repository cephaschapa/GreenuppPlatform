-- Add locationId column to fields table to link with locations table
DO $$ BEGIN ALTER TABLE "fields" ADD COLUMN "location_id" integer; EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Add foreign key constraint
DO $$ BEGIN ALTER TABLE "fields" ADD CONSTRAINT "fields_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$; 