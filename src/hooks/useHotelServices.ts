import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type HotelService = Tables<"hotel_services">;

export const useHotelServices = () => {
  const [services, setServices] = useState<HotelService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("hotel_services")
          .select("*")
          .eq("is_available", true);

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setServices(data || []);
        }
      } catch (err) {
        setError("Failed to fetch hotel services");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return { services, loading, error };
};
