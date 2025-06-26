ALTER TABLE "users" ADD COLUMN "fcm_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "fcm_token_updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "push_notifications_enabled" boolean DEFAULT true;