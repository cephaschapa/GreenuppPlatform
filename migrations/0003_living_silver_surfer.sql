ALTER TABLE "device_sessions" ADD COLUMN "latitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "device_sessions" ADD COLUMN "longitude" numeric(10, 7);--> statement-breakpoint
ALTER TABLE "device_sessions" ADD COLUMN "geo_path" text;--> statement-breakpoint
ALTER TABLE "device_sessions" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "device_sessions" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "device_sessions" ADD COLUMN "state" text;