import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  UtensilsCrossed,
  Sparkles,
  Car,
  Shirt,
  Phone,
  Dumbbell,
  Waves,
  Coffee,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const services = [
  {
    icon: UtensilsCrossed,
    title: "Room Service",
    description: "24/7 in-room dining from our gourmet kitchen",
    available: true,
    color: "bg-accent",
  },
  {
    icon: Sparkles,
    title: "Housekeeping",
    description: "Daily cleaning, turndown service, and more",
    available: true,
    color: "bg-primary",
  },
  {
    icon: Waves,
    title: "Spa & Wellness",
    description: "Massages, facials, and relaxation therapies",
    available: true,
    color: "bg-accent",
  },
  {
    icon: Phone,
    title: "Concierge",
    description: "Reservations, tickets, and personalized assistance",
    available: true,
    color: "bg-primary",
  },
  {
    icon: Shirt,
    title: "Laundry",
    description: "Same-day dry cleaning and pressing services",
    available: true,
    color: "bg-accent",
  },
  {
    icon: Car,
    title: "Transportation",
    description: "Airport transfers and car rental arrangements",
    available: true,
    color: "bg-primary",
  },
  {
    icon: Dumbbell,
    title: "Fitness Center",
    description: "State-of-the-art gym open 24/7",
    available: true,
    color: "bg-accent",
  },
  {
    icon: Coffee,
    title: "Wake-Up Call",
    description: "Personalized morning wake-up service",
    available: true,
    color: "bg-primary",
  },
];

const Services = () => {
  const { toast } = useToast();
  const { user, guestProfile } = useAuth();
  const [loadingService, setLoadingService] = useState<string | null>(null);

  const handleRequest = async (serviceName: string) => {
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to request a service.",
        variant: "destructive",
      });
      return;
    }

    setLoadingService(serviceName);

    const requestData = {
      guest_id: user.id,
      room_number: guestProfile?.room_number || "Unknown",
      service_type: serviceName,
      description: `${serviceName} service requested`,
      status: "pending",
    };

    console.log("Attempting to insert service request:", requestData);

    try {
      const { data, error } = await supabase
        .from("service_requests")
        .insert(requestData)
        .select()
        .single();

      if (error) {
        console.error("Service request insert failed:", error);
        toast({
          title: "Failed to submit request",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      console.log("Service request saved successfully:", data);
      toast({
        title: "Service Requested",
        description: `Your ${serviceName} request has been submitted. We'll contact you shortly.`,
      });
    } catch (err) {
      console.error("Unexpected error submitting request:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingService(null);
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl lg:text-4xl font-serif text-foreground mb-2">
          Hotel Services
        </h1>
        <p className="text-muted-foreground">
          Everything you need for a perfect stay, just one tap away
        </p>
      </motion.div>

      {/* Services Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="service-card group"
            >
              <div className={`w-14 h-14 rounded-xl ${service.color} flex items-center justify-center mb-4`}>
                <Icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {service.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {service.description}
              </p>
              <Button
                variant="gold-outline"
                size="sm"
                className="w-full group-hover:bg-accent group-hover:text-accent-foreground"
                onClick={() => handleRequest(service.title)}
                disabled={loadingService === service.title}
              >
                {loadingService === service.title ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  <>
                    Request
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Emergency Contact */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-6 bg-card rounded-xl border border-border"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">
              Need immediate assistance?
            </h3>
            <p className="text-muted-foreground">
              Our staff is available 24/7 for any urgent requests
            </p>
          </div>
          <Button variant="default" size="lg">
            <Phone className="w-4 h-4 mr-2" />
            Call Front Desk
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Services;
