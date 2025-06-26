-- Add FCM token and push notification columns to users table
ALTER TABLE users
  ADD COLUMN fcm_token TEXT,
  ADD COLUMN fcm_token_updated_at TIMESTAMP,
  ADD COLUMN push_notifications_enabled BOOLEAN DEFAULT TRUE; 