import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Guest = Tables<"guests">;

export const useGuestProfile = () => {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGuestProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("guests")
          .select("*")
          .eq("id", user.id)
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
