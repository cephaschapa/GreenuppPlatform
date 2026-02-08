-- Micro feedback for decisions: helpful / not helpful + optional reason
-- Run once; safe to re-run only if columns are missing.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'decisions' AND column_name = 'feedback_helpful'
  ) THEN
    ALTER TABLE decisions ADD COLUMN feedback_helpful BOOLEAN;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'decisions' AND column_name = 'feedback_reason'
  ) THEN
    ALTER TABLE decisions ADD COLUMN feedback_reason TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'decisions' AND column_name = 'feedback_at'
  ) THEN
    ALTER TABLE decisions ADD COLUMN feedback_at TIMESTAMPTZ;
  END IF;
END $$;
