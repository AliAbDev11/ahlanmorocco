import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { notifyServiceRequestCreated } from "@/lib/notificationTriggers";

type ServiceRequest = Tables<"service_requests">;

interface CreateServiceRequestParams {
  serviceType: string;
  description?: string;
  requestedTime?: string;
}

interface GuestSession {
  guestId: string;
  fullName: string;
  roomNumber: string;
}

// Helper to get current user ID from either Supabase auth or localStorage guest session
const getCurrentGuestInfo = async (): Promise<{ guestId: string; roomNumber: string } | null> => {
  // First try Supabase auth
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    // Get room number from guests table
    const { data: guest } = await supabase
      .from("guests")
      .select("room_number")
      .eq("id", user.id)
      .maybeSingle();
    
    return {
      guestId: user.id,
      roomNumber: guest?.room_number || "Unknown"
    };
  }
  
  // Fall back to localStorage guest session (QR code login)
  const storedSession = localStorage.getItem("guestSession");
  if (storedSession) {
    try {
      const parsed: GuestSession = JSON.parse(storedSession);
      if (parsed.guestId) {
        return {
          guestId: parsed.guestId,
          roomNumber: parsed.roomNumber || "Unknown"
        };
      }
    } catch (e) {
      console.error("Error parsing guest session:", e);
    }
  }
  
  return null;
};

export const useServiceRequests = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const guestInfo = await getCurrentGuestInfo();

      if (!guestInfo) {
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("service_requests")
        .select("*")
        .eq("guest_id", guestInfo.guestId)
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setRequests(data || []);
      }
    } catch (err) {
      setError("Failed to fetch service requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const createRequest = async (params: CreateServiceRequestParams) => {
    setSubmitting(true);
    setError(null);

    try {
      const guestInfo = await getCurrentGuestInfo();

      if (!guestInfo) {
        throw new Error("You must be logged in to create a request");
      }

      const { data, error: insertError } = await supabase
        .from("service_requests")
        .insert({
          guest_id: guestInfo.guestId,
          room_number: guestInfo.roomNumber,
          service_type: params.serviceType,
          description: params.description,
          requested_time: params.requestedTime,
          status: "pending",
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Trigger notifications for staff and managers
      console.log("Service request created, sending notifications...");
      await notifyServiceRequestCreated(
        data.id,
        guestInfo.guestId,
        guestInfo.roomNumber,
        params.serviceType
      );
      console.log("Service request notifications sent successfully");

      // Refresh the list
      await fetchRequests();

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create request";
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setSubmitting(false);
    }
  };

  return { requests, loading, submitting, error, createRequest, refetch: fetchRequests };
};
