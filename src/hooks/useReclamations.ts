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

export const useReclamations = () => {
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReclamations = async () => {
    try {
      const guestInfo = await getCurrentGuestInfo();

      if (!guestInfo) {
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("reclamations")
        .select("*")
        .eq("guest_id", guestInfo.guestId)
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
      const guestInfo = await getCurrentGuestInfo();

      if (!guestInfo) {
        throw new Error("You must be logged in to submit a complaint");
      }

      const urgency = params.urgency || "medium";

      const { data, error: insertError } = await supabase
        .from("reclamations")
        .insert({
          guest_id: guestInfo.guestId,
          room_number: guestInfo.roomNumber,
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
        guestInfo.guestId,
        guestInfo.roomNumber,
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
