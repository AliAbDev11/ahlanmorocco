-- Update the staff record to link it to the auth user by matching email
UPDATE public.staff 
SET user_id = '9d381690-9080-4144-a369-0c1c09616b0e'
WHERE email = 'john.staff@ahlan.hotel';

-- Also add a policy for staff to check by email during initial login
CREATE OR REPLACE FUNCTION public.get_staff_by_email(staff_email text)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  full_name text,
  email text,
  role text,
  department text,
  phone_number text,
  is_active boolean,
  created_at timestamp without time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id, s.user_id, s.full_name, s.email, s.role, s.department, s.phone_number, s.is_active, s.created_at
  FROM public.staff s
  WHERE s.email = staff_email AND s.is_active = true
  LIMIT 1;
$$;