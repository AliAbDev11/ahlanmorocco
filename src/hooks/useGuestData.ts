import { useAuth } from "@/hooks/useAuth";

export interface GuestData {
  id: string;
  full_name: string;
  room_number: string;
}

export const useGuestData = (): GuestData | null => {
  const { guestProfile, user } = useAuth();

  if (!user) {
    return null;
  }

  // Return guest profile data from Supabase auth
  return {
    id: guestProfile?.id || user.id,
    full_name: guestProfile?.full_name || user.email?.split("@")[0] || "Guest",
    room_number: guestProfile?.room_number || "Unknown",
  };
};
