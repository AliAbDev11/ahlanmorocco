import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { notifyOrderPlaced } from "@/lib/notificationTriggers";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CreateOrderParams {
  items: OrderItem[];
  totalPrice: number;
  deliveryTime?: string;
  specialRequests?: string;
}

interface GuestSession {
  guestId: string;
  fullName: string;
  roomNumber: string;
}

// Helper to get current user ID from either Supabase auth or localStorage guest session
const getCurrentGuestInfo = async (): Promise<{ guestId: string; roomNumber: string } | null> => {
  // First try Supabase auth
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    // Get room number from guests table
    const { data: guest } = await supabase
      .from("guests")
      .select("room_number")
      .eq("id", user.id)
      .maybeSingle();
    
    return {
      guestId: user.id,
      roomNumber: guest?.room_number || "Unknown"
    };
  }
  
  // Fall back to localStorage guest session (QR code login)
  const storedSession = localStorage.getItem("guestSession");
  if (storedSession) {
    try {
      const parsed: GuestSession = JSON.parse(storedSession);
      if (parsed.guestId) {
        return {
          guestId: parsed.guestId,
          roomNumber: parsed.roomNumber || "Unknown"
        };
      }
    } catch (e) {
      console.error("Error parsing guest session:", e);
    }
  }
  
  return null;
};

export const useOrders = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (params: CreateOrderParams) => {
    setLoading(true);
    setError(null);

    try {
      const guestInfo = await getCurrentGuestInfo();

      if (!guestInfo) {
        throw new Error("You must be logged in to place an order");
      }

      const { data, error: insertError } = await supabase
        .from("orders")
        .insert({
          guest_id: guestInfo.guestId,
          room_number: guestInfo.roomNumber,
          items: params.items as unknown as Json,
          total_price: params.totalPrice,
          delivery_time: params.deliveryTime,
          special_requests: params.specialRequests,
          status: "pending",
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Trigger notifications for staff and managers
      console.log("Order created, sending notifications...");
      await notifyOrderPlaced(
        data.id,
        guestInfo.guestId,
        guestInfo.roomNumber,
        params.totalPrice
      );
      console.log("Notifications sent successfully");

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create order";
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { createOrder, loading, error };
};
