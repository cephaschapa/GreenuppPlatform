ALTER TABLE "users" ADD COLUMN "failed_login_attempts" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_locked_until" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_failed_login_at" timestamp;