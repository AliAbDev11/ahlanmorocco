-- Allow public/anonymous access to validate tokens (unauthenticated users scanning QR codes)
CREATE POLICY "Allow public token validation"
ON guest_access_tokens
FOR SELECT
TO anon
USING (is_active = true);

-- Allow public to update last_used_at for active tokens
CREATE POLICY "Allow public token usage update"
ON guest_access_tokens
FOR UPDATE
TO anon
USING (is_active = true)
WITH CHECK (is_active = true);

-- Allow public to read guest data via token validation
CREATE POLICY "Allow public guest access via token"
ON guests
FOR SELECT
TO anon
USING (
  id IN (
    SELECT guest_id FROM guest_access_tokens 
    WHERE is_active = true
  )
);