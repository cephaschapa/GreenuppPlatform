-- Add merchant accounts and payouts tables for ecommerce functionality

-- Create merchant_accounts table
CREATE TABLE IF NOT EXISTS "merchant_accounts" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status" TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected, suspended
  "business_name" TEXT NOT NULL,
  "business_type" TEXT NOT NULL, -- individual, business, cooperative
  "business_registration_number" TEXT,
  "tax_id" TEXT,
  "contact_phone" TEXT NOT NULL,
  "contact_email" TEXT NOT NULL,
  "business_address" TEXT NOT NULL,
  "bank_name" TEXT NOT NULL,
  "account_number" TEXT NOT NULL,
  "account_holder_name" TEXT NOT NULL,
  "branch_code" TEXT,
  "mobile_money_provider" TEXT, -- mtn, airtel, zamtel
  "mobile_money_number" TEXT,
  "national_id_number" TEXT NOT NULL,
  "verification_status" TEXT NOT NULL DEFAULT 'pending', -- pending, verified, rejected
  "verification_notes" TEXT,
  "monthly_earnings" DECIMAL(10, 2) DEFAULT '0',
  "total_earnings" DECIMAL(10, 2) DEFAULT '0',
  "pending_payouts" DECIMAL(10, 2) DEFAULT '0',
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  "approved_at" TIMESTAMP,
  "approved_by" INTEGER REFERENCES "users"("id")
);

-- Create payouts table
CREATE TABLE IF NOT EXISTS "payouts" (
  "id" SERIAL PRIMARY KEY,
  "merchant_account_id" INTEGER NOT NULL REFERENCES "merchant_accounts"("id") ON DELETE CASCADE,
  "amount" DECIMAL(10, 2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'ZMW',
  "method" TEXT NOT NULL, -- bank_transfer, mobile_money
  "status" TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  "transaction_id" TEXT,
  "processing_fee" DECIMAL(10, 2) DEFAULT '0',
  "net_amount" DECIMAL(10, 2) NOT NULL,
  "scheduled_date" TIMESTAMP,
  "processed_date" TIMESTAMP,
  "failure_reason" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_merchant_accounts_user_id" ON "merchant_accounts"("user_id");
CREATE INDEX IF NOT EXISTS "idx_merchant_accounts_status" ON "merchant_accounts"("status");
CREATE INDEX IF NOT EXISTS "idx_merchant_accounts_verification_status" ON "merchant_accounts"("verification_status");

CREATE INDEX IF NOT EXISTS "idx_payouts_merchant_account_id" ON "payouts"("merchant_account_id");
CREATE INDEX IF NOT EXISTS "idx_payouts_status" ON "payouts"("status");
CREATE INDEX IF NOT EXISTS "idx_payouts_scheduled_date" ON "payouts"("scheduled_date");

-- Add unique constraint to ensure one merchant account per user
ALTER TABLE "merchant_accounts" ADD CONSTRAINT "unique_merchant_account_per_user" UNIQUE ("user_id");

