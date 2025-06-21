-- Create plant_analyses table
CREATE TABLE IF NOT EXISTS "plant_analyses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"image_data" text NOT NULL,
	"plant_type" text,
	"field_id" integer,
	"crop_id" integer,
	"analysis_date" timestamp DEFAULT now() NOT NULL,
	"disease_detected" text,
	"disease_probability" numeric(5, 2),
	"disease_description" text,
	"health_status" text NOT NULL,
	"health_score" integer NOT NULL,
	"nutrient_deficiencies" text,
	"nutrient_excess" text,
	"recommendations" text,
	"additional_observations" text,
	"notes" text,
	"treatment_plan_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create treatment_plans table
CREATE TABLE IF NOT EXISTS "treatment_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"analysis_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"disease_type" text NOT NULL,
	"severity" text NOT NULL,
	"estimated_duration" integer,
	"status" text DEFAULT 'active' NOT NULL,
	"start_date" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create treatment_steps table
CREATE TABLE IF NOT EXISTS "treatment_steps" (
	"id" serial PRIMARY KEY NOT NULL,
	"treatment_plan_id" integer NOT NULL,
	"step_number" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"treatment_type" text NOT NULL,
	"product_name" text,
	"active_ingredient" text,
	"dosage" text,
	"application_method" text,
	"frequency" text,
	"duration" integer,
	"safety_notes" text,
	"cost" numeric(10, 2),
	"cost_unit" text,
	"is_completed" boolean DEFAULT false,
	"completed_date" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create treatment_progress table
CREATE TABLE IF NOT EXISTS "treatment_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"treatment_step_id" integer NOT NULL,
	"application_date" timestamp DEFAULT now() NOT NULL,
	"applied_dosage" text,
	"weather_conditions" text,
	"observations" text,
	"effectiveness" integer,
	"photos" text[],
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create treatment_products table
CREATE TABLE IF NOT EXISTS "treatment_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"active_ingredient" text,
	"product_type" text NOT NULL,
	"target_diseases" text[],
	"target_crops" text[],
	"application_rate" text,
	"safety_class" text,
	"re_entry_interval" integer,
	"pre_harvest_interval" integer,
	"organic" boolean DEFAULT false,
	"description" text,
	"manufacturer" text,
	"price" numeric(10, 2),
	"price_unit" text,
	"availability" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
ALTER TABLE "plant_analyses" ADD CONSTRAINT "plant_analyses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "plant_analyses" ADD CONSTRAINT "plant_analyses_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "plant_analyses" ADD CONSTRAINT "plant_analyses_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "treatment_plans" ADD CONSTRAINT "treatment_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "treatment_plans" ADD CONSTRAINT "treatment_plans_analysis_id_plant_analyses_id_fk" FOREIGN KEY ("analysis_id") REFERENCES "public"."plant_analyses"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "treatment_steps" ADD CONSTRAINT "treatment_steps_treatment_plan_id_treatment_plans_id_fk" FOREIGN KEY ("treatment_plan_id") REFERENCES "public"."treatment_plans"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "treatment_progress" ADD CONSTRAINT "treatment_progress_treatment_step_id_treatment_steps_id_fk" FOREIGN KEY ("treatment_step_id") REFERENCES "public"."treatment_steps"("id") ON DELETE no action ON UPDATE no action; 