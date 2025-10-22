-- Add scan tracking columns to crops table
-- This enables analytics on QR code scans for product verification

ALTER TABLE crops 
ADD COLUMN IF NOT EXISTS qr_scan_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_scanned_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS first_scanned_at TIMESTAMP;

-- Add index for performance on scan queries
CREATE INDEX IF NOT EXISTS idx_crops_scan_count ON crops(qr_scan_count DESC);
CREATE INDEX IF NOT EXISTS idx_crops_last_scanned ON crops(last_scanned_at DESC);

-- Create table for detailed scan events (for analytics)
CREATE TABLE IF NOT EXISTS qr_scan_events (
  id SERIAL PRIMARY KEY,
  batch_id TEXT NOT NULL,
  crop_id INTEGER REFERENCES crops(id) ON DELETE CASCADE,
  scanned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  location_lat DOUBLE PRECISION,
  location_lon DOUBLE PRECISION,
  location_city TEXT,
  location_country TEXT,
  referrer TEXT,
  scan_source TEXT DEFAULT 'web', -- 'web', 'mobile', 'app'
  verification_result BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_qr_scans_batch_id ON qr_scan_events(batch_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_crop_id ON qr_scan_events(crop_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_date ON qr_scan_events(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_qr_scans_location ON qr_scan_events(location_country, location_city);

-- Add comments for documentation
COMMENT ON COLUMN crops.qr_scan_count IS 'Total number of times this crop''s QR code has been scanned';
COMMENT ON COLUMN crops.last_scanned_at IS 'Timestamp of the most recent QR code scan';
COMMENT ON COLUMN crops.first_scanned_at IS 'Timestamp of the first QR code scan';
COMMENT ON TABLE qr_scan_events IS 'Detailed analytics for every QR code scan event';

