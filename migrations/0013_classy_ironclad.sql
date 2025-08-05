CREATE TABLE "pest_disease_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"scientific_name" text,
	"category" text NOT NULL,
	"risk_level" text NOT NULL,
	"affected_crops" text[] NOT NULL,
	"symptoms" text[] NOT NULL,
	"treatment_recommendations" text[] NOT NULL,
	"prevention_measures" text[] NOT NULL,
	"image_urls" text[] DEFAULT '{}',
	"is_quarantinable" boolean DEFAULT false,
	"spread_rate" text NOT NULL,
	"economic_impact" text NOT NULL,
	"seasonality" text[] DEFAULT '{}',
	"geographic_risk" text[] DEFAULT '{}',
	"alert_threshold" integer DEFAULT 3,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pest_outbreaks" (
	"id" serial PRIMARY KEY NOT NULL,
	"pest_disease_id" integer NOT NULL,
	"location_area" text NOT NULL,
	"severity" text NOT NULL,
	"status" text NOT NULL,
	"first_reported_at" timestamp NOT NULL,
	"last_updated_at" timestamp NOT NULL,
	"affected_farms" integer DEFAULT 0,
	"estimated_losses" numeric(12, 2),
	"containment_measures" text[] DEFAULT '{}',
	"admin_notes" text,
	"alert_level" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pest_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"plant_analysis_id" integer,
	"pest_disease_id" integer NOT NULL,
	"location" text NOT NULL,
	"coordinates" jsonb,
	"severity" text NOT NULL,
	"confidence" integer NOT NULL,
	"affected_area" numeric(8, 2),
	"crop_type" text NOT NULL,
	"growth_stage" text NOT NULL,
	"weather_conditions" text,
	"images" text[] DEFAULT '{}',
	"symptoms" text[] DEFAULT '{}',
	"farmer_notes" text,
	"verified_by_expert" boolean DEFAULT false,
	"expert_notes" text,
	"treatment_applied" text[] DEFAULT '{}',
	"follow_up_required" boolean DEFAULT false,
	"reported_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "risk_assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"pest_disease_id" integer NOT NULL,
	"location" text NOT NULL,
	"risk_score" integer NOT NULL,
	"factors" jsonb NOT NULL,
	"recommendations" text[] NOT NULL,
	"alert_triggered" boolean DEFAULT false,
	"assessment_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pest_outbreaks" ADD CONSTRAINT "pest_outbreaks_pest_disease_id_pest_disease_types_id_fk" FOREIGN KEY ("pest_disease_id") REFERENCES "public"."pest_disease_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pest_reports" ADD CONSTRAINT "pest_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pest_reports" ADD CONSTRAINT "pest_reports_plant_analysis_id_plant_analyses_id_fk" FOREIGN KEY ("plant_analysis_id") REFERENCES "public"."plant_analyses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pest_reports" ADD CONSTRAINT "pest_reports_pest_disease_id_pest_disease_types_id_fk" FOREIGN KEY ("pest_disease_id") REFERENCES "public"."pest_disease_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_pest_disease_id_pest_disease_types_id_fk" FOREIGN KEY ("pest_disease_id") REFERENCES "public"."pest_disease_types"("id") ON DELETE no action ON UPDATE no action;