-- ============================================
-- Supabase Database Schema for TrustScore App
-- ============================================
-- Run this in your Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste and Run
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
-- Stores user profile information linked to Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  trust_score INTEGER,
  score_breakdown JSONB,
  score_last_updated TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- 2. SCORE HISTORY TABLE
-- ============================================
-- Tracks historical trust score changes
CREATE TABLE IF NOT EXISTS public.score_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  breakdown JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.score_history ENABLE ROW LEVEL SECURITY;

-- Policies for score_history table
-- Users can view their own score history
CREATE POLICY "Users can view own score history"
  ON public.score_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own score history
CREATE POLICY "Users can insert own score history"
  ON public.score_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_score_history_user_id 
  ON public.score_history(user_id);

CREATE INDEX IF NOT EXISTS idx_score_history_created_at 
  ON public.score_history(created_at DESC);

-- ============================================
-- 3. LOANS TABLE
-- ============================================
-- Stores loan information for users
CREATE TABLE IF NOT EXISTS public.loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  principal_amount DECIMAL(12, 2) NOT NULL,
  tenure_months INTEGER NOT NULL,
  emi_amount DECIMAL(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'completed', 'defaulted', 'cancelled'))
);

-- Enable Row Level Security
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- Policies for loans table
-- Users can view their own loans
CREATE POLICY "Users can view own loans"
  ON public.loans
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own loans
CREATE POLICY "Users can insert own loans"
  ON public.loans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own loans
CREATE POLICY "Users can update own loans"
  ON public.loans
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_loans_user_id 
  ON public.loans(user_id);

CREATE INDEX IF NOT EXISTS idx_loans_status 
  ON public.loans(status);

-- ============================================
-- 4. TRIGGER TO AUTO-UPDATE updated_at
-- ============================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for loans table
DROP TRIGGER IF EXISTS update_loans_updated_at ON public.loans;
CREATE TRIGGER update_loans_updated_at
  BEFORE UPDATE ON public.loans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. FUNCTION TO AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
-- This function automatically creates a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at)
  VALUES (NEW.id, NEW.email, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 6. USER DATA TABLES (FOR TRUST SCORE CALCULATION)
-- ============================================

-- Utility Bills Data
CREATE TABLE IF NOT EXISTS public.utility_bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bill_type TEXT NOT NULL, -- 'electricity', 'water', 'gas'
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'paid', 'late', 'missed'
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_bill_type CHECK (bill_type IN ('electricity', 'water', 'gas')),
  CONSTRAINT valid_bill_status CHECK (status IN ('pending', 'paid', 'late', 'missed'))
);

ALTER TABLE public.utility_bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own utility bills"
  ON public.utility_bills FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own utility bills"
  ON public.utility_bills FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_utility_bills_user_id ON public.utility_bills(user_id);
CREATE INDEX IF NOT EXISTS idx_utility_bills_status ON public.utility_bills(status);

-- UPI Transactions Data
CREATE TABLE IF NOT EXISTS public.upi_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL, -- 'credit', 'debit'
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT, -- 'food', 'transport', 'bills', 'shopping', 'transfer', etc.
  transaction_date TIMESTAMPTZ NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_transaction_type CHECK (transaction_type IN ('credit', 'debit'))
);

ALTER TABLE public.upi_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.upi_transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.upi_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_upi_transactions_user_id ON public.upi_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_upi_transactions_date ON public.upi_transactions(transaction_date DESC);

-- Location Stability Data
CREATE TABLE IF NOT EXISTS public.location_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  months_at_location INTEGER NOT NULL DEFAULT 0,
  stability_score DECIMAL(3, 2), -- 0.00 to 1.00
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.location_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own location data"
  ON public.location_data FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own location data"
  ON public.location_data FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own location data"
  ON public.location_data FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_location_data_user_id ON public.location_data(user_id);

-- Social Trust Data (optional)
CREATE TABLE IF NOT EXISTS public.social_trust (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  network_strength TEXT, -- 'low', 'medium', 'high'
  referrals_count INTEGER DEFAULT 0,
  trust_connections INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_network_strength CHECK (network_strength IN ('low', 'medium', 'high'))
);

ALTER TABLE public.social_trust ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own social trust"
  ON public.social_trust FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social trust"
  ON public.social_trust FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social trust"
  ON public.social_trust FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_social_trust_user_id ON public.social_trust(user_id);

-- ============================================
-- 7. TRUST SCORE CALCULATION LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS public.trust_score_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  trust_score INTEGER NOT NULL,
  utility_score DECIMAL(3, 2),
  upi_score DECIMAL(3, 2),
  location_score DECIMAL(3, 2),
  social_score DECIMAL(3, 2),
  explanations JSONB,
  features_used JSONB, -- Store the deterministic features
  gemini_used BOOLEAN DEFAULT true,
  fallback_used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trust_score_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calculations"
  ON public.trust_score_calculations FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_trust_calculations_user_id ON public.trust_score_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_calculations_date ON public.trust_score_calculations(created_at DESC);

-- ============================================
-- 8. UPDATE PROFILES TABLE FOR LOAN ELIGIBILITY
-- ============================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS loan_eligibility_min DECIMAL(12, 2);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS loan_eligibility_max DECIMAL(12, 2);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interest_rate DECIMAL(5, 2);

-- ============================================
-- DONE!
-- ============================================
-- Your database schema is now ready with:
-- - User profiles with trust scores
-- - Utility bills tracking
-- - UPI transaction history
-- - Location stability data
-- - Social trust metrics
-- - Trust score calculation logs
-- - Loan eligibility tracking
-- ============================================
