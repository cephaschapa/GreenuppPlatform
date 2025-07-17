-- Add source field to marketplace_listings table
ALTER TABLE "marketplace_listings" ADD COLUMN "source" text NOT NULL DEFAULT 'other'; 