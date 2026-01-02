-- Create user roles enum and table for proper authorization
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'manager');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is any staff role (admin, staff, or manager)
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'staff', 'manager')
  )
$$;

-- RLS policies for staff to manage guests
CREATE POLICY "Staff can view all guests"
ON public.guests
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()) OR auth.uid() = id);

CREATE POLICY "Staff can insert guests"
ON public.guests
FOR INSERT
TO authenticated
WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update guests"
ON public.guests
FOR UPDATE
TO authenticated
USING (public.is_staff(auth.uid()) OR auth.uid() = id);

CREATE POLICY "Staff can delete guests"
ON public.guests
FOR DELETE
TO authenticated
USING (public.is_staff(auth.uid()));

-- RLS policies for rooms
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rooms"
ON public.rooms
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Staff can manage rooms"
ON public.rooms
FOR ALL
TO authenticated
USING (public.is_staff(auth.uid()));

-- RLS policies for orders (staff access)
CREATE POLICY "Staff can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()) OR auth.uid() = guest_id);

CREATE POLICY "Staff can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (public.is_staff(auth.uid()) OR auth.uid() = guest_id);

-- RLS policies for service_requests (staff access)
CREATE POLICY "Staff can view all service requests"
ON public.service_requests
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()) OR auth.uid() = guest_id);

CREATE POLICY "Staff can update service requests"
ON public.service_requests
FOR UPDATE
TO authenticated
USING (public.is_staff(auth.uid()) OR auth.uid() = guest_id);

-- RLS policies for reclamations (staff access)
CREATE POLICY "Staff can view all reclamations"
ON public.reclamations
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()) OR auth.uid() = guest_id);

CREATE POLICY "Staff can update reclamations"
ON public.reclamations
FOR UPDATE
TO authenticated
USING (public.is_staff(auth.uid()) OR auth.uid() = guest_id);

-- RLS policies for guest_access_tokens
ALTER TABLE public.guest_access_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage guest tokens"
ON public.guest_access_tokens
FOR ALL
TO authenticated
USING (public.is_staff(auth.uid()));

-- RLS policies for staff table
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view staff members"
ON public.staff
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

-- RLS for activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view activity logs"
ON public.activity_logs
FOR SELECT
TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can create activity logs"
ON public.activity_logs
FOR INSERT
TO authenticated
WITH CHECK (public.is_staff(auth.uid()));

-- Policy for user_roles (only admins can manage roles)
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));