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

export const useOrders = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (params: CreateOrderParams) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to place an order");
      }

      // Get guest profile for room number
      const { data: guest, error: guestError } = await supabase
        .from("guests")
        .select("room_number")
        .eq("id", user.id)
        .maybeSingle();

      if (guestError) {
        throw new Error(guestError.message);
      }

      const roomNumber = guest?.room_number || "Unknown";

      const { data, error: insertError } = await supabase
        .from("orders")
        .insert({
          guest_id: user.id,
          room_number: roomNumber,
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
        user.id,
        roomNumber,
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
