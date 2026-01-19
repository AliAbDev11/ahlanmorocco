import { useState, useEffect } from "react";

export interface GuestData {
  id: string;
  full_name: string;
  room_number: string;
  phone_number?: string;
  username?: string;
}

export const useGuestData = (): GuestData | null => {
  const [guestData, setGuestData] = useState<GuestData | null>(null);

  useEffect(() => {
    // Log all localStorage keys to debug
    console.log('All localStorage keys:', Object.keys(localStorage));
    console.log('guestSession:', localStorage.getItem('guestSession'));
    console.log('hotelGuest:', localStorage.getItem('hotelGuest'));

    // Try multiple possible localStorage keys and formats
    const possibleKeys = ['guestSession', 'hotelGuest', 'guest', 'currentGuest'];

    for (const key of possibleKeys) {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          console.log(`Parsed ${key}:`, parsed);

          // Extract data from various possible formats
          const id = parsed.guestId || parsed.id || parsed.guest_id || `${Date.now()}`;
          const name = parsed.fullName || parsed.full_name || parsed.username || parsed.name || 'Guest';
          const room = parsed.roomNumber || parsed.room_number || parsed.room || 'Unknown';
          const phone = parsed.phoneNumber || parsed.phone_number || parsed.phone;

          // Only set if we have valid name and room (not fallback values)
          if (name !== 'Guest' && room !== 'Unknown') {
            setGuestData({
              id: id.toString().replace('guest-', ''), // Remove 'guest-' prefix if present
              full_name: name,
              room_number: room.toString(),
              phone_number: phone || undefined,
            });
            console.log('Guest data set:', { id, name, room, phone });
            return;
          }
        } catch (e) {
          console.error(`Failed to parse ${key}:`, e);
        }
      }
    }

    console.warn('No valid guest data found in localStorage');
  }, []);

  return guestData;
};
