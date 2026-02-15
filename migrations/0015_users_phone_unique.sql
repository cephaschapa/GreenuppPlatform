-- Add unique constraint on users.phone (cell number)
-- Run manually if db:migrate fails: psql $DATABASE_URL -f platform/migrations/0015_users_phone_unique.sql
ALTER TABLE "users" ADD CONSTRAINT "users_phone_unique" UNIQUE("phone");
