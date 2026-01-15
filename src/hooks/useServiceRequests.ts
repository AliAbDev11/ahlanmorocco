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

export const useServiceRequests = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("service_requests")
        .select("*")
        .eq("guest_id", user.id)
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
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to create a request");
      }

      // Get guest profile for room number
      const { data: guest, error: guestError } = await supabase
        .from("guests")
        .select("room_number")
        .eq("id", user.id)
        .maybeSingle();

      if (guestError) {
        throw new Error(guestError.message);
      }

      const roomNumber = guest?.room_number || "Unknown";

      const { data, error: insertError } = await supabase
        .from("service_requests")
        .insert({
          guest_id: user.id,
          room_number: roomNumber,
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
        user.id,
        roomNumber,
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
