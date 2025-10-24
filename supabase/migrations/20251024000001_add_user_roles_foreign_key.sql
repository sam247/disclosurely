-- Add missing foreign key relationship between user_roles and profiles
-- This fixes the PGRST200 error when querying profiles with user_roles joins

ALTER TABLE user_roles 
ADD CONSTRAINT fk_user_roles_user_id 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;
