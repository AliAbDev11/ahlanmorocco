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

    // First try to get guest session (from QR code login - most reliable source)

    const guestSession = localStorage.getItem("guestSession");

    if (guestSession) {

      try {

        const parsed = JSON.parse(guestSession);

        if (parsed.guestId && parsed.fullName && parsed.roomNumber) {

          setGuestData({

            id: parsed.guestId,

            full_name: parsed.fullName,

            room_number: parsed.roomNumber,

            phone_number: parsed.phoneNumber || undefined,

          });

          return;

        }

      } catch (e) {

        console.error("Failed to parse guestSession:", e);

      }

    }



    // Fallback to hotelGuest storage

    const stored = localStorage.getItem("hotelGuest");

    if (stored) {

      try {

        const parsed = JSON.parse(stored);

        setGuestData({

          id: parsed.id || `guest-${Date.now()}`,

          full_name: parsed.full_name || parsed.username || "Guest",

          room_number: parsed.room_number || parsed.room || "Unknown",

          phone_number: parsed.phone_number || undefined,

          username: parsed.username,

        });

      } catch (e) {
