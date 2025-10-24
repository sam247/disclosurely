-- Comprehensive cleanup script for test data
-- This script removes all test invitations, profiles, and user roles

-- 1. Delete all invitations (for fresh testing)
DELETE FROM user_invitations;

-- 2. Deactivate all user roles for test emails
UPDATE user_roles 
SET is_active = false 
WHERE user_id IN (
  SELECT id FROM profiles 
  WHERE email IN ('sampettiford@hotmail.com', 'betterrankinganalytics@gmail.com')
);

-- 3. Deactivate profiles for test emails
UPDATE profiles 
SET is_active = false 
WHERE email IN ('sampettiford@hotmail.com', 'betterrankinganalytics@gmail.com');

-- 4. Show current state
SELECT 
  'user_invitations' as table_name,
  COUNT(*) as count
FROM user_invitations
UNION ALL
SELECT 
  'profiles (test emails)' as table_name,
  COUNT(*) as count
FROM profiles 
WHERE email IN ('sampettiford@hotmail.com', 'betterrankinganalytics@gmail.com')
UNION ALL
SELECT 
  'user_roles (test emails)' as table_name,
  COUNT(*) as count
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.id
WHERE p.email IN ('sampettiford@hotmail.com', 'betterrankinganalytics@gmail.com');
