-- One-off: add image_url to treatment_products if missing (e.g. production missed migration 0016)
-- Run against your DB: psql $DATABASE_URL -f scripts/add-treatment-products-image-url.sql
ALTER TABLE "treatment_products" ADD COLUMN IF NOT EXISTS "image_url" text;
