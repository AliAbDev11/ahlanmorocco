-- Allow authenticated users to check if they have a staff record by email
CREATE POLICY "Users can check staff status by email"
ON public.staff
FOR SELECT
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));