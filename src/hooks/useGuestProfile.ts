import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Guest = Tables<"guests">;

interface GuestSession {
  guestId: string;
  fullName: string;
  roomNumber: string;
  checkInDate?: string;
  checkOutDate?: string;
}

export const useGuestProfile = () => {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuestProfile = async () => {
      try {
        let guestId: string | null = null;

        // First try Supabase auth
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          guestId = user.id;
        } else {
          // Fall back to localStorage guest session (QR code login)
          const storedSession = localStorage.getItem("guestSession");
          if (storedSession) {
            try {
              const parsed: GuestSession = JSON.parse(storedSession);
              guestId = parsed.guestId;
            } catch (e) {
              console.error("Error parsing guest session:", e);
            }
          }
        }

        if (!guestId) {
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("guests")
          .select("*")
          .eq("id", guestId)
          .maybeSingle();

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setGuest(data);
        }
      } catch (err) {
        setError("Failed to fetch guest profile");
      } finally {
        setLoading(false);
      }
    };

    fetchGuestProfile();
  }, []);

  return { guest, loading, error };
};
