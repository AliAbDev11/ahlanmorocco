import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, MapPin, Clock, Info } from "lucide-react";

interface Location {
  id: string;
  name: string;
  description: string;
  hours: string;
  floor: string;
  x: number;
  y: number;
}

const locations: Location[] = [
  {
    id: "reception",
    name: "Reception & Lobby",
    description: "24/7 check-in, check-out, and guest services",
    hours: "24 hours",
    floor: "Ground Floor",
    x: 50,
    y: 85,
  },
  {
    id: "restaurant",
    name: "Azure Terrace Restaurant",
    description: "Fine dining with panoramic city views",
    hours: "7:00 AM - 10:00 PM",
    floor: "Ground Floor",
    x: 20,
    y: 60,
  },
  {
    id: "bar",
    name: "Skyline Lounge & Bar",
    description: "Cocktails and light bites with live music",
    hours: "5:00 PM - 1:00 AM",
    floor: "Rooftop",
    x: 80,
    y: 15,
  },
  {
    id: "spa",
    name: "Serenity Spa",
    description: "Full-service spa with massage and treatments",
    hours: "9:00 AM - 9:00 PM",
    floor: "3rd Floor",
    x: 75,
    y: 45,
  },
  {
    id: "gym",
    name: "Fitness Center",
    description: "Modern equipment, personal training available",
    hours: "24 hours",
    floor: "3rd Floor",
    x: 25,
    y: 35,
  },
  {
    id: "pool",
    name: "Infinity Pool",
    description: "Heated outdoor pool with cabanas",
    hours: "6:00 AM - 10:00 PM",
    floor: "5th Floor",
    x: 60,
    y: 25,
  },
  {
    id: "meeting",
    name: "Business Center",
    description: "Meeting rooms and conference facilities",
    hours: "8:00 AM - 8:00 PM",
    floor: "2nd Floor",
    x: 35,
    y: 70,
  },
];

const HotelMap = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl lg:text-4xl font-serif text-foreground mb-2">
          Hotel Map
        </h1>
        <p className="text-muted-foreground">
          Tap on a location to learn more about our facilities
        </p>
      </motion.div>

      {/* Map Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative bg-card rounded-2xl border border-border overflow-hidden"
        style={{ aspectRatio: "16/10" }}
      >
        {/* Map Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-secondary">
          {/* Decorative grid */}
          <div className="absolute inset-0 opacity-10">
            {[...Array(10)].map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute w-full h-px bg-foreground"
                style={{ top: `${i * 10}%` }}
              />
            ))}
            {[...Array(10)].map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute h-full w-px bg-foreground"
                style={{ left: `${i * 10}%` }}
              />
            ))}
          </div>

          {/* Building outline */}
          <div className="absolute inset-8 border-2 border-dashed border-border rounded-xl">
            <div className="absolute top-2 left-2 text-xs text-muted-foreground">
              Hyatt regency Hotel
            </div>
          </div>
        </div>

        {/* Location Markers */}
        {locations.map((location, index) => (
          <motion.button
            key={location.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.05, type: "spring", stiffness: 300 }}
            onClick={() => setSelectedLocation(location)}
            className={`map-location ${selectedLocation?.id === location.id ? "ring-4 ring-accent/50 scale-110" : ""
              }`}
            style={{ left: `${location.x}%`, top: `${location.y}%` }}
          >
            <MapPin className="w-5 h-5 text-accent-foreground" />
          </motion.button>
        ))}

        {/* Info Panel */}
        <AnimatePresence>
          {selectedLocation && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute top-4 right-4 w-72 bg-card rounded-xl border border-border shadow-lg p-4"
            >
              <button
                onClick={() => setSelectedLocation(null)}
                className="absolute top-3 right-3 p-1 hover:bg-secondary rounded-md transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              <h3 className="text-lg font-serif text-foreground mb-2 pr-8">
                {selectedLocation.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedLocation.description}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{selectedLocation.hours}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Info className="w-4 h-4" />
                  <span>{selectedLocation.floor}</span>
                </div>
              </div>

              <Button variant="gold" size="sm" className="w-full mt-4">
                Get Directions
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Location List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {locations.map((location) => (
          <button
            key={location.id}
            onClick={() => setSelectedLocation(location)}
            className={`text-left p-4 rounded-xl border transition-all ${selectedLocation?.id === location.id
                ? "bg-accent/10 border-accent"
                : "bg-card border-border hover:border-accent/50"
              }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">{location.name}</h4>
                <p className="text-xs text-muted-foreground">{location.floor}</p>
              </div>
            </div>
          </button>
        ))}
      </motion.div>
    </div>
  );
};

export default HotelMap;
