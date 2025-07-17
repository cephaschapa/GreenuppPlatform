-- Add source field to marketplace_listings table
-- This is a safe migration that only adds a new column with a default value
ALTER TABLE "marketplace_listings" ADD COLUMN IF NOT EXISTS "source" text NOT NULL DEFAULT 'other'; 