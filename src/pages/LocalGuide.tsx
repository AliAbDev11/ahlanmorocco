import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Star, ExternalLink } from "lucide-react";

interface Attraction {
  id: number;
  name: string;
  category: string;
  distance: string;
  rating: number;
  description: string;
  image: string;
}

const attractions: Attraction[] = [
  {
    id: 1,
    name: "Central Art Museum",
    category: "Museum",
    distance: "0.5 km",
    rating: 4.8,
    description: "World-renowned art collection spanning centuries of masterpieces",
    image: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    name: "Botanical Gardens",
    category: "Nature",
    distance: "1.2 km",
    rating: 4.7,
    description: "Beautiful gardens with exotic plants from around the world",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    name: "The Blue Pearl Restaurant",
    category: "Dining",
    distance: "0.3 km",
    rating: 4.9,
    description: "Michelin-starred restaurant with innovative coastal cuisine",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    name: "Historic Old Town",
    category: "Sightseeing",
    distance: "0.8 km",
    rating: 4.6,
    description: "Charming cobblestone streets with historic architecture",
    image: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=400&h=300&fit=crop",
  },
  {
    id: 5,
    name: "Sunset Beach",
    category: "Beach",
    distance: "2.5 km",
    rating: 4.5,
    description: "Pristine sandy beach known for spectacular sunset views",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
  },
  {
    id: 6,
    name: "Grand Opera House",
    category: "Entertainment",
    distance: "0.7 km",
    rating: 4.8,
    description: "Historic venue hosting world-class performances nightly",
    image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400&h=300&fit=crop",
  },
  {
    id: 7,
    name: "Artisan Market Square",
    category: "Shopping",
    distance: "0.4 km",
    rating: 4.4,
    description: "Local crafts, souvenirs, and authentic regional goods",
    image: "https://images.unsplash.com/photo-1555529771-7888783a18d3?w=400&h=300&fit=crop",
  },
  {
    id: 8,
    name: "Sky Tower Observation Deck",
    category: "Sightseeing",
    distance: "1.5 km",
    rating: 4.7,
    description: "360-degree panoramic views of the city and coastline",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=300&fit=crop",
  },
];

const LocalGuide = () => {
  const handleGetDirections = (name: string) => {
    // In production, this would open a maps application
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(name)}`, "_blank");
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
          Local Guide
        </h1>
        <p className="text-muted-foreground">
          Discover the best attractions, dining, and experiences near our hotel
        </p>
      </motion.div>

      {/* Featured */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="relative rounded-2xl overflow-hidden h-64 md:h-80">
          <img
            src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=400&fit=crop"
            alt="City view"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <span className="text-accent text-sm font-medium mb-2 block">
              Concierge Recommended
            </span>
            <h2 className="text-2xl md:text-3xl font-serif text-background mb-2">
              Explore the City
            </h2>
            <p className="text-background/80 text-sm md:text-base">
              Our concierge team has curated the best local experiences for you
            </p>
          </div>
        </div>
      </motion.div>

      {/* Attractions Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {attractions.map((attraction, index) => (
          <motion.div
            key={attraction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="bg-card rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all group"
          >
            <div className="relative h-40 overflow-hidden">
              <img
                src={attraction.image}
                alt={attraction.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 bg-card/90 backdrop-blur-sm rounded-md text-xs font-medium text-foreground">
                  {attraction.category}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-foreground">{attraction.name}</h3>
                <div className="flex items-center gap-1 text-accent">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-medium">{attraction.rating}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {attraction.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {attraction.distance} away
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleGetDirections(attraction.name)}
                  className="text-accent hover:text-accent"
                >
                  Directions
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-6 bg-secondary/50 rounded-xl border border-border"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-1">
              Need personalized recommendations?
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Our concierge team can arrange private tours, restaurant reservations, 
              and exclusive experiences tailored to your interests.
            </p>
            <Button variant="gold" size="sm">
              Contact Concierge
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LocalGuide;
