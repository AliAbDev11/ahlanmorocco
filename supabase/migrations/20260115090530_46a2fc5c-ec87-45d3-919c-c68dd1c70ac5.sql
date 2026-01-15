-- Add is_active column to local_attractions table for managers to activate/deactivate
ALTER TABLE local_attractions 
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add RLS policies for staff/managers to manage local_attractions
CREATE POLICY "Staff can manage local attractions" 
ON local_attractions 
FOR ALL 
USING (is_staff(auth.uid()))
WITH CHECK (is_staff(auth.uid()));