-- Add image_url to treatment_products for product images in UI
ALTER TABLE "treatment_products" ADD COLUMN IF NOT EXISTS "image_url" text;
