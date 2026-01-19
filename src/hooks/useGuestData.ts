import { useState, useEffect } from "react";

export interface GuestData {
  id: string;
  full_name: string;
  room_number: string;
  phone_number?: string;
  username?: string;
}

export const useGuestData = (): GuestData => {
  // Initialize state using a function (lazy initialization).
  // This runs once when the component mounts and ensures we have data immediately.
  const [guestData, setGuestData] = useState<GuestData>(() => {
    // 1. Try to get "Real" Guest Session (QR Code)
    try {
      const guestSession = localStorage.getItem("guestSession");
      if (guestSession) {
        const parsed = JSON.parse(guestSession);
        if (parsed.guestId && parsed.fullName && parsed.roomNumber) {
          return {
            id: parsed.guestId,
            full_name: parsed.fullName,
            room_number: parsed.roomNumber,
            phone_number: parsed.phoneNumber || undefined,
          };
        }
      }
    } catch (e) {
      console.error("Failed to parse guestSession:", e);
    }

    // 2. Try to get existing "Anonymous" Guest from storage
    try {
      const stored = localStorage.getItem("hotelGuest");
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          id: parsed.id || `guest-${Date.now()}`,
          full_name: parsed.full_name || parsed.username || "Guest",
          room_number: parsed.room_number || parsed.room || "Unknown",
          phone_number: parsed.phone_number || undefined,
          username: parsed.username,
        };
      }
    } catch (e) {
      console.error("Failed to parse hotelGuest:", e);
    }

    // 3. Fallback: Generate a NEW Anonymous Guest
    // We create this immediately if nothing else exists.
    const newAnonymousGuest: GuestData = {
      id: `guest-${Date.now()}`,
      full_name: "Guest",
      room_number: "Unknown", // Or "Lobby"
    };

    // Save it to localStorage so the ID persists if they refresh the page
    try {
      localStorage.setItem("hotelGuest", JSON.stringify(newAnonymousGuest));
    } catch (e) {
      console.error("Failed to save new guest to storage", e);
    }

    return newAnonymousGuest;
  });

  // We don't strictly need a useEffect anymore because we handled the logic 
  // in the initializer, but we can keep it if you expect storage to change 
  // from outside this component (e.g. login happens while on this page).
  useEffect(() => {
    const handleStorageChange = () => {
        // Logic to re-read storage if needed
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return guestData;
};
