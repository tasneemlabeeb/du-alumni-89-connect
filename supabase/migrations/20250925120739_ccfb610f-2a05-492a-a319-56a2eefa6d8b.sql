-- First, let's see existing users to get the user_id
-- Then update their role to admin

-- This will show you the users and their current roles
-- Run this first to see which user_id you want to promote:
-- SELECT p.email, p.full_name, p.user_id, ur.role 
-- FROM profiles p 
-- JOIN user_roles ur ON p.user_id = ur.user_id;

-- Example: Update user role to admin (replace the user_id with your actual user_id)
-- UPDATE user_roles 
-- SET role = 'admin' 
-- WHERE user_id = 'your-user-id-here';

-- For easier testing, let's create a function to promote the first user to admin
CREATE OR REPLACE FUNCTION promote_first_user_to_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    first_user_id uuid;
BEGIN
    -- Get the first user
    SELECT user_id INTO first_user_id 
    FROM profiles 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
        -- Update their role to admin
        UPDATE user_roles 
        SET role = 'admin' 
        WHERE user_id = first_user_id;
        
        -- Also ensure they're approved
        UPDATE members 
        SET status = 'approved', approved_at = now() 
        WHERE user_id = first_user_id;
    END IF;
END;
$$;