-- Create notifications table for all user types
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('guest', 'staff', 'manager')),
  type TEXT NOT NULL CHECK (type IN ('order', 'service_request', 'complaint', 'system', 'assignment', 'reminder', 'alert')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_entity_type TEXT,
  related_entity_id UUID,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX idx_notifications_user ON public.notifications(user_id, user_type);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (
  (user_type = 'guest' AND user_id = auth.uid()) OR
  (user_type IN ('staff', 'manager') AND is_staff(auth.uid()))
);

-- Policy: Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (
  (user_type = 'guest' AND user_id = auth.uid()) OR
  (user_type IN ('staff', 'manager') AND is_staff(auth.uid()))
);

-- Policy: Staff/System can insert notifications
CREATE POLICY "Staff can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (is_staff(auth.uid()) OR user_type = 'guest');

-- Policy: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
USING (
  (user_type = 'guest' AND user_id = auth.uid()) OR
  (user_type IN ('staff', 'manager') AND is_staff(auth.uid()))
);

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_user_type TEXT,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_related_entity_type TEXT DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL,
  p_priority TEXT DEFAULT 'medium',
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id, user_type, type, title, message,
    related_entity_type, related_entity_id, priority, action_url
  ) VALUES (
    p_user_id, p_user_type, p_type, p_title, p_message,
    p_related_entity_type, p_related_entity_id, p_priority, p_action_url
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = true, read_at = now()
  WHERE id = p_notification_id;
  
  RETURN FOUND;
END;
$$;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(p_user_id UUID, p_user_type TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.notifications
  SET is_read = true, read_at = now()
  WHERE user_id = p_user_id 
    AND user_type = p_user_type 
    AND is_read = false;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;