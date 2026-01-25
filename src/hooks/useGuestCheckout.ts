import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GuestSession } from "@/hooks/useAuth";

export const useGuestCheckout = (guestSession: GuestSession | null) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const checkAndLogoutIfExpired = useCallback(async () => {
    if (!guestSession) return false;

    try {
      const checkOutDate = new Date(guestSession.checkOutDate);
      const now = new Date();

      // Add grace period of 4 hours after checkout
      const graceHours = 4;
      const checkOutWithGrace = new Date(checkOutDate);
      checkOutWithGrace.setHours(checkOutWithGrace.getHours() + graceHours);

      if (now > checkOutWithGrace) {
        // Guest is past checkout, log them out

        // Deactivate guest account
        await supabase
          .from("guests")
          .update({ is_active: false })
          .eq("id", guestSession.guestId);

        // Deactivate access tokens
        await supabase
          .from("guest_access_tokens")
          .update({ is_active: false })
          .eq("guest_id", guestSession.guestId);

        // Clear session
        localStorage.removeItem("guestSession");

        toast({
          title: "Session Expired",
          description: "Your stay has ended. Thank you for choosing Hyatt regency Hotel!",
        });

        navigate("/");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking checkout status:", error);
      return false;
    }
  }, [guestSession, navigate, toast]);

  // Check on mount
  useEffect(() => {
    checkAndLogoutIfExpired();
  }, [checkAndLogoutIfExpired]);

  // Periodic check every 5 minutes
  useEffect(() => {
    if (!guestSession) return;

    const interval = setInterval(() => {
      checkAndLogoutIfExpired();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [guestSession, checkAndLogoutIfExpired]);

  // Get checkout status info
  const getCheckoutStatus = useCallback(() => {
    if (!guestSession) return null;

    const checkOutDate = new Date(guestSession.checkOutDate);
    const now = new Date();
    const hoursUntilCheckout = (checkOutDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilCheckout <= 0) {
      return { status: "expired", message: "Check-out time has passed", variant: "destructive" as const };
    } else if (hoursUntilCheckout <= 2) {
      return { status: "urgent", message: `Check-out in ${Math.ceil(hoursUntilCheckout * 60)} minutes`, variant: "destructive" as const };
    } else if (hoursUntilCheckout <= 24) {
      return { status: "soon", message: `Check-out in ${Math.ceil(hoursUntilCheckout)} hours`, variant: "default" as const };
    }

    return null;
  }, [guestSession]);

  return { checkAndLogoutIfExpired, getCheckoutStatus };
};
