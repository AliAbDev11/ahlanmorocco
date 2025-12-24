import { useState, useEffect } from "react";

export interface GuestData {
  id: string;
  full_name: string;
  room_number: string;
  username?: string;
}

export const useGuestData = (): GuestData | null => {
  const [guestData, setGuestData] = useState<GuestData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("hotelGuest");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Map the stored data to our GuestData interface
        setGuestData({
          id: parsed.id || `guest-${Date.now()}`,
          full_name: parsed.full_name || parsed.username || "Guest",
          room_number: parsed.room_number || parsed.room || "Unknown",
          username: parsed.username,
        });
      } catch (e) {
        console.error("Failed to parse guest data:", e);
      }
    }
  }, []);

  return guestData;
};
