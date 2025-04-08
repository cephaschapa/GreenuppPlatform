CREATE TYPE "public"."crop_status" AS ENUM('planning', 'planted', 'growing', 'harvesting', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "crop_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"crop_id" integer NOT NULL,
	"activity_type" text NOT NULL,
	"activity_date" date NOT NULL,
	"description" text NOT NULL,
	"cost" numeric(10, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crops" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"variety" text,
	"status" text DEFAULT 'planning' NOT NULL,
	"field_id" integer,
	"planting_date" date,
	"expected_harvest_date" date,
	"actual_harvest_date" date,
	"expected_yield" numeric(10, 2),
	"actual_yield" numeric(10, 2),
	"yield_unit" text DEFAULT 'kg',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fields" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"location" text,
	"size" numeric(10, 2),
	"size_unit" text DEFAULT 'hectares',
	"soil_type" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "crop_activities" ADD CONSTRAINT "crop_activities_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "public"."crops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crops" ADD CONSTRAINT "crops_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crops" ADD CONSTRAINT "crops_field_id_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fields" ADD CONSTRAINT "fields_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;