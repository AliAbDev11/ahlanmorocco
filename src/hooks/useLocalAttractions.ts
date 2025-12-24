import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type LocalAttraction = Tables<"local_attractions">;

export const useLocalAttractions = () => {
  const [attractions, setAttractions] = useState<LocalAttraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("local_attractions")
          .select("*");

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setAttractions(data || []);
        }
      } catch (err) {
        setError("Failed to fetch local attractions");
      } finally {
        setLoading(false);
      }
    };

    fetchAttractions();
  }, []);

  return { attractions, loading, error };
};
