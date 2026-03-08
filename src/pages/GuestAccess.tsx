import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Hotel, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const GuestAccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [guestName, setGuestName] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      validateAndLoginGuest(token);
    } else {
      setStatus("error");
      setErrorMessage("No access token provided");
    }
  }, [searchParams]);

  const validateAndLoginGuest = async (token: string) => {
    try {
      // Query guest_access_tokens table with guest data
      const { data: tokenData, error } = await supabase
        .from("guest_access_tokens")
        .select("*, guests(*)")
        .eq("token", token)
        .eq("is_active", true)
        .single();

      if (error || !tokenData) {
        setStatus("error");
        setErrorMessage("Invalid or expired QR code. Please contact the front desk.");
        return;
      }

      // Check if token is expired
      if (new Date(tokenData.expires_at) < new Date()) {
        setStatus("expired");
        setErrorMessage("This QR code has expired. Please contact the front desk for a new one.");
        return;
      }

      // Check if guest is still active
      const guestData = tokenData.guests as any;
      if (!guestData || !guestData.is_active) {
        setStatus("error");
        setErrorMessage("Your stay has ended. Please contact the front desk if you need assistance.");
        return;
      }

      // Update last_used_at
      await supabase
        .from("guest_access_tokens")
        .update({ last_used_at: new Date().toISOString() })
        .eq("id", tokenData.id);

      // Store guest session in localStorage
      const guestSession = {
        guestId: tokenData.guest_id,
        fullName: guestData.full_name,
        roomNumber: guestData.room_number,
        checkInDate: guestData.check_in_date,
        checkOutDate: guestData.check_out_date,
        token: token,
        authenticatedAt: new Date().toISOString(),
      };

      localStorage.setItem("guestSession", JSON.stringify(guestSession));

      setGuestName(guestData.full_name);
      setStatus("success");

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (err) {
      console.error("Error validating guest token:", err);
      setStatus("error");
      setErrorMessage("An error occurred while validating your access. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary to-navy-dark p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-card rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
      >
        {/* Hotel Logo */}
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Hotel className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-2xl font-serif text-foreground mb-2">
          Grand Azur Hotel
        </h1>

        {status === "loading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8"
          >
            <Loader2 className="w-12 h-12 text-accent mx-auto animate-spin mb-4" />
            <p className="text-muted-foreground">Verifying your access...</p>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Welcome, {guestName}!
            </h2>
            <p className="text-muted-foreground mb-4">
              Your access has been verified. Redirecting you to the guest portal...
            </p>
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </motion.div>
        )}

        {(status === "error" || status === "expired") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${status === "expired" ? "bg-yellow-100" : "bg-red-100"
              }`}>
              <AlertCircle className={`w-8 h-8 ${status === "expired" ? "text-yellow-600" : "text-red-600"
                }`} />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {status === "expired" ? "QR Code Expired" : "Access Denied"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {errorMessage}
            </p>
            <div className="space-y-3">
              <Button
                variant="gold"
                className="w-full"
                onClick={() => navigate("/")}
              >
                Go to Login
              </Button>
              <p className="text-sm text-muted-foreground">
                Need help? Contact the front desk
              </p>
              <p className="text-sm text-accent font-medium">
                +1 (555) 123-4567
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default GuestAccess;
