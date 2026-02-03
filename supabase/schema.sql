-- PassQR Pay - Stored Value Pass System
-- Run this on your Supabase SQL editor

-- Merchants (store owners)
CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  stripe_account_id TEXT, -- Connected Stripe account for payouts
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stored Value Passes (gift cards / prepaid cards)
CREATE TABLE IF NOT EXISTS stored_value_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  
  -- Pass holder info
  holder_name TEXT,
  holder_email TEXT,
  holder_phone TEXT,
  
  -- Balance (in cents to avoid floating point issues)
  balance_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  
  -- Crypto secret for signing QR codes
  secret_key TEXT NOT NULL,
  
  -- Pass metadata
  pass_design JSONB DEFAULT '{}', -- Colors, logo, etc.
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Replay protection
  last_qr_timestamp INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions (top-ups and debits)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pass_id UUID NOT NULL REFERENCES stored_value_passes(id) ON DELETE CASCADE,
  
  -- Transaction type: 'topup' or 'debit'
  type TEXT NOT NULL CHECK (type IN ('topup', 'debit', 'refund')),
  
  -- Amount in cents (positive for topup, positive for debit amount)
  amount_cents INTEGER NOT NULL,
  
  -- Balance after transaction
  balance_after_cents INTEGER NOT NULL,
  
  -- Metadata
  description TEXT,
  stripe_payment_id TEXT, -- For top-ups
  pos_device_id UUID, -- For debits
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- POS Devices (merchant scanner devices)
CREATE TABLE IF NOT EXISTS pos_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  
  device_name TEXT NOT NULL,
  device_token TEXT UNIQUE NOT NULL, -- Auth token for API calls
  
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_passes_merchant ON stored_value_passes(merchant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_pass ON transactions(pass_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pos_devices_merchant ON pos_devices(merchant_id);
CREATE INDEX IF NOT EXISTS idx_pos_devices_token ON pos_devices(device_token);

-- Function to update balance atomically
CREATE OR REPLACE FUNCTION debit_pass(
  p_pass_id UUID,
  p_amount_cents INTEGER,
  p_pos_device_id UUID,
  p_description TEXT DEFAULT NULL
) RETURNS TABLE (
  success BOOLEAN,
  new_balance INTEGER,
  error TEXT
) AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Lock the row and get current balance
  SELECT balance_cents INTO v_current_balance
  FROM stored_value_passes
  WHERE id = p_pass_id AND is_active = TRUE
  FOR UPDATE;
  
  IF v_current_balance IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, 'Pass not found or inactive'::TEXT;
    RETURN;
  END IF;
  
  IF v_current_balance < p_amount_cents THEN
    RETURN QUERY SELECT FALSE, v_current_balance, 'Insufficient balance'::TEXT;
    RETURN;
  END IF;
  
  v_new_balance := v_current_balance - p_amount_cents;
  
  -- Update balance
  UPDATE stored_value_passes
  SET balance_cents = v_new_balance, updated_at = NOW()
  WHERE id = p_pass_id;
  
  -- Record transaction
  INSERT INTO transactions (pass_id, type, amount_cents, balance_after_cents, pos_device_id, description)
  VALUES (p_pass_id, 'debit', p_amount_cents, v_new_balance, p_pos_device_id, p_description);
  
  RETURN QUERY SELECT TRUE, v_new_balance, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to top up balance
CREATE OR REPLACE FUNCTION topup_pass(
  p_pass_id UUID,
  p_amount_cents INTEGER,
  p_stripe_payment_id TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
) RETURNS TABLE (
  success BOOLEAN,
  new_balance INTEGER,
  error TEXT
) AS $$
DECLARE
  v_new_balance INTEGER;
BEGIN
  -- Update balance and get new value
  UPDATE stored_value_passes
  SET balance_cents = balance_cents + p_amount_cents, updated_at = NOW()
  WHERE id = p_pass_id AND is_active = TRUE
  RETURNING balance_cents INTO v_new_balance;
  
  IF v_new_balance IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, 'Pass not found or inactive'::TEXT;
    RETURN;
  END IF;
  
  -- Record transaction
  INSERT INTO transactions (pass_id, type, amount_cents, balance_after_cents, stripe_payment_id, description)
  VALUES (p_pass_id, 'topup', p_amount_cents, v_new_balance, p_stripe_payment_id, p_description);
  
  RETURN QUERY SELECT TRUE, v_new_balance, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies (enable row-level security)
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE stored_value_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_devices ENABLE ROW LEVEL SECURITY;
