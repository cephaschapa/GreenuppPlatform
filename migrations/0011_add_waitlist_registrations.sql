-- Migration: Add waitlist registrations table for testing program
-- Created: 2024-01-24

CREATE TABLE "waitlist_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"phone" text,
	"organization" text,
	"user_type" text NOT NULL,
	"location" text NOT NULL,
	"farm_size" text,
	"primary_crops" text,
	"experience" text NOT NULL,
	"interests" text[] NOT NULL,
	"additional_info" text,
	"agree_to_terms" boolean DEFAULT false NOT NULL,
	"subscribe_updates" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"registration_date" timestamp DEFAULT now() NOT NULL,
	"invited_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX "idx_waitlist_email" ON "waitlist_registrations" ("email");
CREATE INDEX "idx_waitlist_status" ON "waitlist_registrations" ("status");
CREATE INDEX "idx_waitlist_user_type" ON "waitlist_registrations" ("user_type");
CREATE INDEX "idx_waitlist_registration_date" ON "waitlist_registrations" ("registration_date");

-- Add comments for documentation
COMMENT ON TABLE "waitlist_registrations" IS 'Testing program waitlist registrations';
COMMENT ON COLUMN "waitlist_registrations"."user_type" IS 'farmer, buyer, supplier, distributor, other';
COMMENT ON COLUMN "waitlist_registrations"."experience" IS 'beginner, intermediate, advanced, expert';
COMMENT ON COLUMN "waitlist_registrations"."status" IS 'pending, invited, accepted, rejected'; 