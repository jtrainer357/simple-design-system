-- ============================================================================
-- Migration: Seed Demo User
-- Creates a demo user for local development and testing
-- ============================================================================

-- Insert demo user (password: demo123)
INSERT INTO users (
  id,
  email,
  password_hash,
  name,
  avatar_url,
  mfa_enabled,
  timezone,
  is_active,
  created_at,
  updated_at
) VALUES (
  '11111111-0000-0000-0000-000000000001',
  'jtrainer@gmail.com',
  'd3ad9315b7be5dd53b31a273b3b3aba5defe700808305aa16a3062b76658a791', -- demo123
  'Jay Trainer',
  NULL,
  false,
  'America/Los_Angeles',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  is_active = true,
  updated_at = NOW();

-- Insert a second demo user for testing
INSERT INTO users (
  id,
  email,
  password_hash,
  name,
  avatar_url,
  mfa_enabled,
  timezone,
  is_active,
  created_at,
  updated_at
) VALUES (
  '11111111-0000-0000-0000-000000000002',
  'demo@tebra.com',
  'd3ad9315b7be5dd53b31a273b3b3aba5defe700808305aa16a3062b76658a791', -- demo123
  'Demo Provider',
  NULL,
  false,
  'America/Los_Angeles',
  true,
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  is_active = true,
  updated_at = NOW();

-- Link demo users to the demo practice
INSERT INTO practice_users (
  id,
  practice_id,
  user_id,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  '22222222-0000-0000-0000-000000000001',
  '550e8400-e29b-41d4-a716-446655440000', -- Demo practice ID
  '11111111-0000-0000-0000-000000000001', -- Jay Trainer
  'owner',
  true,
  NOW(),
  NOW()
) ON CONFLICT (practice_id, user_id) DO UPDATE SET
  role = 'owner',
  is_active = true,
  updated_at = NOW();

INSERT INTO practice_users (
  id,
  practice_id,
  user_id,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  '22222222-0000-0000-0000-000000000002',
  '550e8400-e29b-41d4-a716-446655440000', -- Demo practice ID
  '11111111-0000-0000-0000-000000000002', -- Demo Provider
  'provider',
  true,
  NOW(),
  NOW()
) ON CONFLICT (practice_id, user_id) DO UPDATE SET
  role = 'provider',
  is_active = true,
  updated_at = NOW();

DO $$
BEGIN
    RAISE NOTICE 'Demo users created:';
    RAISE NOTICE '  - jtrainer@gmail.com (password: demo123, role: owner)';
    RAISE NOTICE '  - demo@tebra.com (password: demo123, role: provider)';
END $$;
