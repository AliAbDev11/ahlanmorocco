import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type MenuItem = Tables<"menu_items">;

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("menu_items")
          .select("*")
          .eq("is_available", true);

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setMenuItems(data || []);
        }
      } catch (err) {
        setError("Failed to fetch menu items");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  return { menuItems, loading, error };
};
