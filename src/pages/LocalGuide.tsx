import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Star, ExternalLink, Loader2 } from "lucide-react";
import { useLocalAttractions } from "@/hooks/useLocalAttractions";

const LocalGuide = () => {
  const { t } = useTranslation();
  const { attractions, loading, error } = useLocalAttractions();

  const handleGetDirections = (googleMapsUrl: string | null, name: string) => {
    if (googleMapsUrl) {
      window.open(googleMapsUrl, "_blank");
    } else {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(name)}`, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Failed to load attractions. Please try again.</p>
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
          {t("localGuide.title")}
        </h1>
        <p className="text-muted-foreground">
          {t("localGuide.discoverArea")}
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
      {attractions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No attractions available at the moment.</p>
        </div>
      ) : (
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
                {attraction.image_url ? (
                  <img
                    src={attraction.image_url}
                    alt={attraction.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-card/90 backdrop-blur-sm rounded-md text-xs font-medium text-foreground">
                    {attraction.category}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-foreground">{attraction.name}</h3>
                  {attraction.rating && (
                    <div className="flex items-center gap-1 text-accent">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">{attraction.rating}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {attraction.description}
                </p>
                {attraction.operating_hours && (
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {attraction.operating_hours}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {attraction.distance_km ? `${attraction.distance_km} km away` : attraction.address}
                  </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleGetDirections(attraction.google_maps_url, attraction.name)}
                      className="text-accent hover:text-accent"
                    >
                      {t("localGuide.directions")}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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
