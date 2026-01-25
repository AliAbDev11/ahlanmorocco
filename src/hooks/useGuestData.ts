import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js"; 

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export interface GuestData {
  id: string;
  full_name: string;
  room_number: string;
  phone_number?: string;
  email?: string;
}

export const useGuestData = (): GuestData | null => {
  const [guestData, setGuestData] = useState<GuestData | null>(null);

  useEffect(() => {
    const fetchGuestProfile = async () => {
      let userId = null;
      let userEmail = null;
      
      const allKeys = { ...localStorage, ...sessionStorage };
      
      // 1. Find the User ID in storage
      for (const key of Object.keys(allKeys)) {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          try {
            const item = JSON.parse(allKeys[key] || '{}');
            const user = item.user || item;
            if (user.id) {
              userId = user.id;
              userEmail = user.email;
              break;
            }
          } catch (e) { 
            // Silent catch for parsing errors
          }
        }
      }

      // 2. Fetch real data from Supabase
      if (userId) {
        try {
          const { data, error } = await supabase
            .from('guests')
            .select('*')
            .eq('id', userId)
            .single();

          if (!error && data) {
            setGuestData({
              id: data.id,
              full_name: data.full_name || "Guest", 
              room_number: data.room_number || "Unknown",
              phone_number: data.phone_number,
              email: userEmail
            });
          } else {
            // Fallback if DB fetch fails but we have an ID
            setGuestData({
              id: userId,
              full_name: userEmail || "Guest",
              room_number: "Unknown",
              email: userEmail
            });
          }
        } catch (err) {
          // Silent catch for network errors
        }
      }
    };

    fetchGuestProfile();
  }, []);

  return guestData;
};