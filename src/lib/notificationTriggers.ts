import { supabase } from "@/integrations/supabase/client";

interface NotificationParams {
  userId: string;
  userType: "guest" | "staff" | "manager";
  type: string;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  actionUrl?: string;
}

// Create notification using the database function
export const createNotification = async (params: NotificationParams) => {
  try {
    const { data, error } = await supabase.rpc("create_notification", {
      p_user_id: params.userId,
      p_user_type: params.userType,
      p_type: params.type,
      p_title: params.title,
      p_message: params.message,
      p_related_entity_type: params.relatedEntityType || null,
      p_related_entity_id: params.relatedEntityId || null,
      p_priority: params.priority || "medium",
      p_action_url: params.actionUrl || null,
    });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Failed to create notification:", err);
    return null;
  }
};

// Notify all staff members
export const notifyAllStaff = async (
  type: string,
  title: string,
  message: string,
  relatedEntityType?: string,
  relatedEntityId?: string,
  priority: "low" | "medium" | "high" | "urgent" = "medium",
  actionUrl?: string
) => {
  try {
    // Get all active staff members
    const { data: staffMembers, error } = await supabase
      .from("staff")
      .select("user_id")
      .eq("is_active", true);

    if (error) throw error;

    // Create notifications for each staff member
    const notifications = staffMembers?.map((staff) =>
      createNotification({
        userId: staff.user_id,
        userType: "staff",
        type,
        title,
        message,
        relatedEntityType,
        relatedEntityId,
        priority,
        actionUrl,
      })
    );

    await Promise.all(notifications || []);
  } catch (err) {
    console.error("Failed to notify staff:", err);
  }
};

// Notify all managers
export const notifyAllManagers = async (
  type: string,
  title: string,
  message: string,
  relatedEntityType?: string,
  relatedEntityId?: string,
  priority: "low" | "medium" | "high" | "urgent" = "medium",
  actionUrl?: string
) => {
  try {
    // Get all managers/admins
    const { data: managers, error } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("role", ["manager", "admin"]);

    if (error) throw error;

    // Create notifications for each manager
    const notifications = managers?.map((manager) =>
      createNotification({
        userId: manager.user_id,
        userType: "manager",
        type,
        title,
        message,
        relatedEntityType,
        relatedEntityId,
        priority,
        actionUrl,
      })
    );

    await Promise.all(notifications || []);
  } catch (err) {
    console.error("Failed to notify managers:", err);
  }
};

// Order notification triggers
export const notifyOrderPlaced = async (
  orderId: string,
  guestId: string,
  roomNumber: string,
  totalAmount: number
) => {
  // Notify guest
  await createNotification({
    userId: guestId,
    userType: "guest",
    type: "order",
    title: "Order Confirmed",
    message: "Your order has been received and is being processed.",
    relatedEntityType: "order",
    relatedEntityId: orderId,
    priority: "medium",
    actionUrl: "/requests",
  });

  // Notify all staff
  await notifyAllStaff(
    "order",
    `New Order - Room ${roomNumber}`,
    `New order received. Total: $${totalAmount.toFixed(2)}`,
    "order",
    orderId,
    "high",
    "/staff/orders"
  );

  // Notify all managers
  await notifyAllManagers(
    "order",
    `New Order - Room ${roomNumber}`,
    `New order: $${totalAmount.toFixed(2)}`,
    "order",
    orderId,
    "medium",
    "/manager/orders"
  );
};

export const notifyOrderStatusChange = async (
  orderId: string,
  guestId: string,
  status: string
) => {
  const statusMessages: Record<string, { title: string; message: string }> = {
    "in-progress": {
      title: "Order Being Prepared",
      message: "Your order is now being prepared.",
    },
    ready: {
      title: "Order Ready",
      message: "Your order is ready for delivery.",
    },
    completed: {
      title: "Order Delivered",
      message: "Your order has been delivered. Enjoy!",
    },
    cancelled: {
      title: "Order Cancelled",
      message: "Your order has been cancelled.",
    },
  };

  const notification = statusMessages[status];
  if (notification) {
    await createNotification({
      userId: guestId,
      userType: "guest",
      type: "order",
      title: notification.title,
      message: notification.message,
      relatedEntityType: "order",
      relatedEntityId: orderId,
      priority: status === "cancelled" ? "high" : "medium",
      actionUrl: "/requests",
    });
  }
};

// Service request notification triggers
export const notifyServiceRequestCreated = async (
  requestId: string,
  guestId: string,
  roomNumber: string,
  serviceType: string
) => {
  // Notify guest
  await createNotification({
    userId: guestId,
    userType: "guest",
    type: "service_request",
    title: "Request Received",
    message: `Your ${serviceType} request has been received.`,
    relatedEntityType: "service_request",
    relatedEntityId: requestId,
    priority: "medium",
    actionUrl: "/requests",
  });

  // Notify all staff
  await notifyAllStaff(
    "service_request",
    `New Request - Room ${roomNumber}`,
    `${serviceType} request received`,
    "service_request",
    requestId,
    "high",
    "/staff/requests"
  );

  // Notify all managers
  await notifyAllManagers(
    "service_request",
    `Service Request - Room ${roomNumber}`,
    `${serviceType} request received`,
    "service_request",
    requestId,
    "medium",
    "/manager/requests"
  );
};

export const notifyServiceRequestStatusChange = async (
  requestId: string,
  guestId: string,
  status: string,
  serviceType: string
) => {
  const statusMessages: Record<string, { title: string; message: string }> = {
    "in-progress": {
      title: "Request In Progress",
      message: `Your ${serviceType} request is being handled.`,
    },
    completed: {
      title: "Request Completed",
      message: `Your ${serviceType} request has been completed.`,
    },
    cancelled: {
      title: "Request Cancelled",
      message: `Your ${serviceType} request has been cancelled.`,
    },
  };

  const notification = statusMessages[status];
  if (notification) {
    await createNotification({
      userId: guestId,
      userType: "guest",
      type: "service_request",
      title: notification.title,
      message: notification.message,
      relatedEntityType: "service_request",
      relatedEntityId: requestId,
      priority: "medium",
      actionUrl: "/requests",
    });
  }
};

// Complaint notification triggers
export const notifyComplaintCreated = async (
  complaintId: string,
  guestId: string,
  roomNumber: string,
  category: string,
  urgency: string
) => {
  // Notify guest
  await createNotification({
    userId: guestId,
    userType: "guest",
    type: "complaint",
    title: "Complaint Received",
    message: `Your ${category} complaint has been logged and will be addressed.`,
    relatedEntityType: "reclamation",
    relatedEntityId: complaintId,
    priority: "medium",
    actionUrl: "/requests",
  });

  // Notify all staff
  await notifyAllStaff(
    "complaint",
    `Complaint - Room ${roomNumber}`,
    `${category} complaint filed`,
    "reclamation",
    complaintId,
    urgency === "high" || urgency === "critical" ? "urgent" : "high",
    "/staff/reclamations"
  );

  // Notify all managers with higher priority
  await notifyAllManagers(
    "complaint",
    `Guest Complaint - Room ${roomNumber}`,
    `${category} complaint (${urgency} urgency)`,
    "reclamation",
    complaintId,
    urgency === "high" || urgency === "critical" ? "urgent" : "high",
    "/manager/complaints"
  );
};

// Guest check-in notification
export const notifyGuestCheckIn = async (
  guestId: string,
  guestName: string,
  roomNumber: string
) => {
  // Notify all staff
  await notifyAllStaff(
    "system",
    "New Guest Check-In",
    `${guestName} checked in to Room ${roomNumber}`,
    "guest",
    guestId,
    "medium",
    "/staff/guests"
  );

  // Notify all managers
  await notifyAllManagers(
    "system",
    "New Guest Check-In",
    `${guestName} checked in to Room ${roomNumber}`,
    "guest",
    guestId,
    "low",
    "/manager/guests"
  );
};
