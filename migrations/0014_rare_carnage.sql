CREATE TABLE IF NOT EXISTS "crop_growth_stages" (
	"id" serial PRIMARY KEY NOT NULL,
	"crop_name" text NOT NULL,
	"stage_name" text NOT NULL,
	"stage_order" integer NOT NULL,
	"days_from_planting_min" integer NOT NULL,
	"days_from_planting_max" integer NOT NULL,
	"description" text,
	"visual_indicators" text[],
	"care_actions" text[],
	"common_issues" text[],
	"should_notify" boolean DEFAULT true,
	"notification_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crop_observations" (
	"id" serial PRIMARY KEY NOT NULL,
	"crop_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"field_id" integer,
	"observation_date" timestamp DEFAULT now() NOT NULL,
	"observation_type" text NOT NULL,
	"notes" text,
	"health_status" text,
	"health_score" integer,
	"height_cm" numeric(10, 2),
	"leaf_count" integer,
	"fruit_count" integer,
	"pest_detected" boolean DEFAULT false,
	"pest_type" text,
	"pest_severity" text,
	"disease_detected" boolean DEFAULT false,
	"disease_type" text,
	"disease_severity" text,
	"action_taken" text,
	"water_amount_liters" numeric(10, 2),
	"fertilizer_applied" boolean DEFAULT false,
	"fertilizer_type" text,
	"fertilizer_amount" text,
	"photos" text[],
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"temperature" numeric(5, 2),
	"weather_condition" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "crop_varieties" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"variety" text NOT NULL,
	"temp_min" numeric(5, 2) NOT NULL,
	"temp_optimal" numeric(5, 2) NOT NULL,
	"temp_max" numeric(5, 2) NOT NULL,
	"growing_days_min" integer NOT NULL,
	"growing_days_max" integer NOT NULL,
	"water_requirement" text NOT NULL,
	"soil_types" text[] NOT NULL,
	"soil_ph_min" numeric(3, 1) NOT NULL,
	"soil_ph_max" numeric(3, 1) NOT NULL,
	"planting_seasons" text[] NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"region" text,
	"expected_yield_min" numeric(8, 2),
	"expected_yield_max" numeric(8, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "decisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"scope_type" text NOT NULL,
	"field_id" integer,
	"crop_id" integer,
	"decision_type" text NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"priority" text NOT NULL,
	"confidence_level" text NOT NULL,
	"confidence_score" numeric(5, 2),
	"why_text" text NOT NULL,
	"why_payload" jsonb,
	"trigger_type" text NOT NULL,
	"trigger_ref_id" integer,
	"ruleset_version" text NOT NULL,
	"status" text DEFAULT 'generated' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"shown_at" timestamp,
	"acted_at" timestamp,
	"feedback_helpful" boolean,
	"feedback_reason" text,
	"feedback_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "analytics_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"session_id" text,
	"device_id" text,
	"event_name" text NOT NULL,
	"entity_type" text,
	"entity_id" integer,
	"properties" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "field_visits" (
	"id" serial PRIMARY KEY NOT NULL,
	"field_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"visit_date" timestamp DEFAULT now() NOT NULL,
	"duration_minutes" integer,
	"purpose" text,
	"notes" text,
	"overall_condition" text,
	"issues_found" text[],
	"actions_taken" text[],
	"temperature" numeric(5, 2),
	"weather_condition" text,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"photos" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "merchant_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"business_name" text NOT NULL,
	"business_type" text NOT NULL,
	"business_registration_number" text,
	"tax_id" text,
	"contact_phone" text NOT NULL,
	"contact_email" text NOT NULL,
	"business_address" text NOT NULL,
	"bank_name" text NOT NULL,
	"account_number" text NOT NULL,
	"account_holder_name" text NOT NULL,
	"branch_code" text,
	"mobile_money_provider" text,
	"mobile_money_number" text,
	"national_id_number" text NOT NULL,
	"verification_status" text DEFAULT 'pending' NOT NULL,
	"verification_notes" text,
	"monthly_earnings" numeric(10, 2) DEFAULT '0',
	"total_earnings" numeric(10, 2) DEFAULT '0',
	"pending_payouts" numeric(10, 2) DEFAULT '0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"approved_at" timestamp,
	"approved_by" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "onboarding_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"current_step" integer DEFAULT 1 NOT NULL,
	"onboarding_data" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "onboarding_progress_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"merchant_account_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'ZMW' NOT NULL,
	"method" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"transaction_id" text,
	"processing_fee" numeric(10, 2) DEFAULT '0',
	"net_amount" numeric(10, 2) NOT NULL,
	"scheduled_date" timestamp,
	"processed_date" timestamp,
	"failure_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "qr_scan_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_id" text NOT NULL,
	"crop_id" integer,
	"scanned_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"location_lat" real,
	"location_lon" real,
	"location_city" text,
	"location_country" text,
	"referrer" text,
	"scan_source" text DEFAULT 'web',
	"verification_result" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"preferences" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "weather_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"location_id" integer,
	"user_id" integer,
	"location_name" text NOT NULL,
	"lat" numeric(10, 7) NOT NULL,
	"lng" numeric(10, 7) NOT NULL,
	"source" text NOT NULL,
	"forecast_json" jsonb NOT NULL,
	"forecast_from" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "crops" ADD COLUMN IF NOT EXISTS "qr_scan_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "crops" ADD COLUMN IF NOT EXISTS "last_scanned_at" timestamp;--> statement-breakpoint
ALTER TABLE "crops" ADD COLUMN IF NOT EXISTS "first_scanned_at" timestamp;--> statement-breakpoint
ALTER TABLE "farmer_profiles" ADD COLUMN IF NOT EXISTS "farm_location_id" integer;--> statement-breakpoint
ALTER TABLE "farmer_profiles" ADD COLUMN IF NOT EXISTS "farm_location_source" text;--> statement-breakpoint
ALTER TABLE "farmer_profiles" ADD COLUMN IF NOT EXISTS "farm_location_confidence" text;--> statement-breakpoint
ALTER TABLE "farmer_profiles" ADD COLUMN IF NOT EXISTS "farm_location_resolved_at" timestamp;--> statement-breakpoint
ALTER TABLE "farmer_profiles" ADD COLUMN IF NOT EXISTS "farm_location_last_geocode_error" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarding_completed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarding_completed_at" timestamp;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "crop_observations" ADD CONSTRAINT "crop_observations_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "crop_observations" ADD CONSTRAINT "crop_observations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "crop_observations" ADD CONSTRAINT "crop_observations_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "decisions" ADD CONSTRAINT "decisions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "decisions" ADD CONSTRAINT "decisions_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "decisions" ADD CONSTRAINT "decisions_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "field_visits" ADD CONSTRAINT "field_visits_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "field_visits" ADD CONSTRAINT "field_visits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "merchant_accounts" ADD CONSTRAINT "merchant_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "merchant_accounts" ADD CONSTRAINT "merchant_accounts_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "onboarding_progress" ADD CONSTRAINT "onboarding_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "payouts" ADD CONSTRAINT "payouts_merchant_account_id_merchant_accounts_id_fk" FOREIGN KEY ("merchant_account_id") REFERENCES "public"."merchant_accounts"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "qr_scan_events" ADD CONSTRAINT "qr_scan_events_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "weather_snapshots" ADD CONSTRAINT "weather_snapshots_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "weather_snapshots" ADD CONSTRAINT "weather_snapshots_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint
DO $$ BEGIN ALTER TABLE "users" ADD CONSTRAINT "users_phone_unique" UNIQUE("phone"); EXCEPTION WHEN duplicate_object THEN NULL; END $$;