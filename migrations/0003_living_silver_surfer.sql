DO $$ BEGIN ALTER TABLE "device_sessions" ADD COLUMN "latitude" numeric(10, 7); EXCEPTION WHEN duplicate_column THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "device_sessions" ADD COLUMN "longitude" numeric(10, 7); EXCEPTION WHEN duplicate_column THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "device_sessions" ADD COLUMN "geo_path" text; EXCEPTION WHEN duplicate_column THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "device_sessions" ADD COLUMN "country" text; EXCEPTION WHEN duplicate_column THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "device_sessions" ADD COLUMN "city" text; EXCEPTION WHEN duplicate_column THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "device_sessions" ADD COLUMN "state" text; EXCEPTION WHEN duplicate_column THEN NULL; END $$;