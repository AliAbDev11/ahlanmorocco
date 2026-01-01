import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Order {
  id: string;
  guest_id: string | null;
  room_number: string;
  items: any;
  total_price: number;
  status: string;
  delivery_time: string | null;
  special_requests: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  assigned_to: string | null;
}

interface ServiceRequest {
  id: string;
  guest_id: string | null;
  room_number: string;
  service_type: string;
  description: string | null;
  requested_time: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  assigned_to: string | null;
}

interface Reclamation {
  id: string;
  guest_id: string | null;
  room_number: string;
  category: string;
  description: string;
  urgency: string;
  status: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  assigned_to: string | null;
}

interface ActivityLog {
  id: string;
  staff_id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  details: any;
  created_at: string;
}

export const useStaffTasks = (staffId: string | null) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!staffId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [ordersRes, servicesRes, reclamationsRes, activityRes] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .eq("assigned_to", staffId)
          .order("created_at", { ascending: false }),
        supabase
          .from("service_requests")
          .select("*")
          .eq("assigned_to", staffId)
          .order("created_at", { ascending: false }),
        supabase
          .from("reclamations")
          .select("*")
          .eq("assigned_to", staffId)
          .order("created_at", { ascending: false }),
        supabase
          .from("activity_log")
          .select("*")
          .eq("staff_id", staffId)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (servicesRes.error) throw servicesRes.error;
      if (reclamationsRes.error) throw reclamationsRes.error;
      if (activityRes.error) throw activityRes.error;

      setOrders(ordersRes.data || []);
      setServiceRequests(servicesRes.data || []);
      setReclamations(reclamationsRes.data || []);
      setActivityLog(activityRes.data || []);
    } catch (err: any) {
      console.error("Error fetching staff tasks:", err);
      setError(err.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    if (!staffId) return { error: { message: "Not authenticated" } };

    const updates: any = { status, updated_at: new Date().toISOString() };
    if (status === "delivered") {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", orderId)
      .eq("assigned_to", staffId);

    if (!error) {
      // Log activity
      await supabase.from("activity_log").insert({
        staff_id: staffId,
        action_type: status === "delivered" ? "order_completed" : "order_updated",
        entity_type: "order",
        entity_id: orderId,
        details: { status },
      });
      fetchTasks();
    }

    return { error };
  };

  const updateServiceRequestStatus = async (requestId: string, status: string) => {
    if (!staffId) return { error: { message: "Not authenticated" } };

    const updates: any = { status, updated_at: new Date().toISOString() };
    if (status === "completed") {
      updates.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("service_requests")
      .update(updates)
      .eq("id", requestId)
      .eq("assigned_to", staffId);

    if (!error) {
      await supabase.from("activity_log").insert({
        staff_id: staffId,
        action_type: status === "completed" ? "service_completed" : "service_updated",
        entity_type: "service_request",
        entity_id: requestId,
        details: { status },
      });
      fetchTasks();
    }

    return { error };
  };

  const updateReclamationStatus = async (reclamationId: string, status: string) => {
    if (!staffId) return { error: { message: "Not authenticated" } };

    const updates: any = { status, updated_at: new Date().toISOString() };
    if (status === "resolved") {
      updates.resolved_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("reclamations")
      .update(updates)
      .eq("id", reclamationId)
      .eq("assigned_to", staffId);

    if (!error) {
      await supabase.from("activity_log").insert({
        staff_id: staffId,
        action_type: status === "resolved" ? "reclamation_resolved" : "reclamation_updated",
        entity_type: "reclamation",
        entity_id: reclamationId,
        details: { status },
      });
      fetchTasks();
    }

    return { error };
  };

  // Compute metrics
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "preparing");
  const pendingServices = serviceRequests.filter((s) => s.status === "pending" || s.status === "in_progress");
  const openReclamations = reclamations.filter((r) => r.status === "open" || r.status === "in_progress");

  const today = new Date().toDateString();
  const completedToday = [
    ...orders.filter((o) => o.completed_at && new Date(o.completed_at).toDateString() === today),
    ...serviceRequests.filter((s) => s.completed_at && new Date(s.completed_at).toDateString() === today),
    ...reclamations.filter((r) => r.resolved_at && new Date(r.resolved_at).toDateString() === today),
  ].length;

  const urgentItems = reclamations.filter((r) => r.urgency === "high" && r.status !== "resolved").length;

  return {
    orders,
    serviceRequests,
    reclamations,
    activityLog,
    loading,
    error,
    refetch: fetchTasks,
    updateOrderStatus,
    updateServiceRequestStatus,
    updateReclamationStatus,
    metrics: {
      pendingTasks: pendingOrders.length + pendingServices.length + openReclamations.length,
      completedToday,
      urgentItems,
      pendingOrders: pendingOrders.length,
      pendingServices: pendingServices.length,
      openReclamations: openReclamations.length,
    },
  };
};
