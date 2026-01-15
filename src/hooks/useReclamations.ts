import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { notifyComplaintCreated } from "@/lib/notificationTriggers";

type Reclamation = Tables<"reclamations">;

interface CreateReclamationParams {
  category: string;
  description: string;
  urgency?: string;
}

export const useReclamations = () => {
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReclamations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("reclamations")
        .select("*")
        .eq("guest_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setReclamations(data || []);
      }
    } catch (err) {
      setError("Failed to fetch reclamations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReclamations();
  }, []);

  const createReclamation = async (params: CreateReclamationParams) => {
    setSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to submit a complaint");
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
      const urgency = params.urgency || "medium";

      const { data, error: insertError } = await supabase
        .from("reclamations")
        .insert({
          guest_id: user.id,
          room_number: roomNumber,
          category: params.category,
          description: params.description,
          urgency: urgency,
          status: "open",
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Trigger notifications for staff and managers
      console.log("Complaint created, sending notifications...");
      await notifyComplaintCreated(
        data.id,
        user.id,
        roomNumber,
        params.category,
        urgency
      );
      console.log("Complaint notifications sent successfully");

      // Refresh the list
      await fetchReclamations();

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create reclamation";
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setSubmitting(false);
    }
  };

  return { reclamations, loading, submitting, error, createReclamation, refetch: fetchReclamations };
};
