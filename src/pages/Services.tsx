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
import { useHotelServices } from "@/hooks/useHotelServices";
import { useServiceRequests } from "@/hooks/useServiceRequests";
import { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Sparkles,
  Car,
  Shirt,
  Phone,
  Dumbbell,
  Waves,
  Coffee,
};

const colorMap: Record<string, string> = {
  "Room Service": "bg-accent",
  "Housekeeping": "bg-primary",
  "Spa & Wellness": "bg-accent",
  "Concierge": "bg-primary",
  "Laundry": "bg-accent",
  "Transportation": "bg-primary",
  "Fitness Center": "bg-accent",
  "Wake-Up Call": "bg-primary",
};

const Services = () => {
  const { toast } = useToast();
  const { services, loading: servicesLoading, error: servicesError } = useHotelServices();
  const { createRequest, submitting } = useServiceRequests();

  const handleRequest = async (serviceName: string) => {
    const { error } = await createRequest({
      serviceType: serviceName,
      description: `Request for ${serviceName}`,
    });

    if (error) {
      toast({
        title: "Request Failed",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Service Requested",
        description: `Your ${serviceName} request has been submitted. We'll contact you shortly.`,
      });
    }
  };

  if (servicesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (servicesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Failed to load services. Please try again.</p>
      </div>
    );
  }

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
      {services.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No services available at the moment.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {services.map((service, index) => {
            const Icon = service.icon ? iconMap[service.icon] : Sparkles;
            const color = colorMap[service.name] || "bg-primary";
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="service-card group"
              >
                <div className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center mb-4`}>
                  {Icon && <Icon className="w-7 h-7 text-primary-foreground" />}
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {service.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {service.description}
                </p>
                {service.operating_hours && (
                  <p className="text-xs text-muted-foreground mb-4">
                    Hours: {service.operating_hours}
                  </p>
                )}
                <Button
                  variant="gold-outline"
                  size="sm"
                  className="w-full group-hover:bg-accent group-hover:text-accent-foreground"
                  onClick={() => handleRequest(service.name)}
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
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
      )}

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
