import { motion } from "framer-motion";
import { Wifi, Dumbbell, Waves, UtensilsCrossed, Car, ShoppingBag } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const amenities = [
  { icon: Wifi, label: "Free WiFi", hasQR: true },
  { icon: Dumbbell, label: "Fitness Center" },
  { icon: Waves, label: "Pool & Spa" },
  { icon: UtensilsCrossed, label: "Restaurant" },
  { icon: Car, label: "Valet Parking" },
  { icon: ShoppingBag, label: "Gift Shop" },
];

const AmenitiesWidget = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-card rounded-xl p-6 border border-border"
    >
      <h3 className="font-serif text-lg text-foreground mb-4">Hotel Amenities</h3>
      
      <div className="grid grid-cols-3 gap-4">
        {amenities.map((amenity) => {
          const Icon = amenity.icon;
          
          if (amenity.hasQR) {
            return (
              <Dialog key={amenity.label}>
                <DialogTrigger asChild>
                  <button className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <span className="text-xs text-muted-foreground text-center">{amenity.label}</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center font-serif">Connect to WiFi</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-6">
                    <div className="p-4 bg-white rounded-xl">
                      <QRCodeSVG
                        value="WIFI:T:WPA;S:GrandAzure_Guest;P:Welcome2024;;"
                        size={180}
                        level="H"
                        includeMargin
                      />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-foreground">GrandAzure_Guest</p>
                      <p className="text-sm text-muted-foreground">Password: Welcome2024</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            );
          }
          
          return (
            <div
              key={amenity.label}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <span className="text-xs text-muted-foreground text-center">{amenity.label}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default AmenitiesWidget;
