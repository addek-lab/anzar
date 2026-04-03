-- ================================================================
-- DEMO: Set the first registered user as admin
-- Run this in Supabase SQL editor after creating your first account
-- Replace 'your@email.com' with the email you registered with
-- ================================================================

-- Option 1: Set by email (replace with actual email)
-- UPDATE profiles SET user_type = 'admin'
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your@email.com');

-- Option 2: Set ALL pending providers as verified (for quick demo)
-- UPDATE provider_profiles SET status = 'verified' WHERE status = 'pending';

-- Option 3: Set the most recently registered user as admin
-- UPDATE profiles SET user_type = 'admin'
-- WHERE id = (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1);
