-- Allow staff to update their own record (including linking user_id) when matching by email
CREATE POLICY "Staff can link their account by email"
ON public.staff
FOR UPDATE
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()))
WITH CHECK (email = (SELECT email FROM auth.users WHERE id = auth.uid()));