-- Fix the search path security issue
CREATE OR REPLACE FUNCTION promote_first_user_to_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    first_user_id uuid;
BEGIN
    -- Get the first user
    SELECT user_id INTO first_user_id 
    FROM public.profiles 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
        -- Update their role to admin
        UPDATE public.user_roles 
        SET role = 'admin' 
        WHERE user_id = first_user_id;
        
        -- Also ensure they're approved
        UPDATE public.members 
        SET status = 'approved', approved_at = now() 
        WHERE user_id = first_user_id;
    END IF;
END;
$$;