-- ============================================
-- CLEANUP SCRIPT - Remove Old Schema
-- ============================================
-- Run this FIRST in Supabase SQL Editor
-- Then run supabase-schema.sql
-- ============================================
-- Note: Errors like "does not exist" are OK - it means the table wasn't created yet
-- ============================================

-- Drop all tables first (CASCADE will remove triggers, policies, etc.)
DROP TABLE IF EXISTS public.trust_score_calculations CASCADE;
DROP TABLE IF EXISTS public.social_trust CASCADE;
DROP TABLE IF EXISTS public.location_data CASCADE;
DROP TABLE IF EXISTS public.upi_transactions CASCADE;
DROP TABLE IF EXISTS public.utility_bills CASCADE;
DROP TABLE IF EXISTS public.loans CASCADE;
DROP TABLE IF EXISTS public.score_history CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop functions (these might exist from old schema)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- ============================================
-- CLEANUP COMPLETE!
-- ============================================
-- Now run supabase-schema.sql to create fresh schema
-- ============================================
