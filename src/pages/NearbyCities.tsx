import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowLeft, MapPin, Clock, Star, ExternalLink, Building2, Landmark, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface City {
  id: string;
  name: string;
  nameAr?: string;
  distance: number;
  travelTime: string;
  description: string;
  rating: number;
  attractions: string[];
  imageUrl: string;
  mapsUrl: string;
}

const cities: City[] = [
  {
    id: "1",
    name: "Rabat",
    nameAr: "الرباط",
    distance: 87,
    travelTime: "1h 15min",
    description: "Morocco's capital city featuring the historic Kasbah of the Udayas, Hassan Tower, and the beautiful Chellah necropolis.",
    rating: 4.7,
    attractions: ["Kasbah of the Udayas", "Hassan Tower", "Chellah", "Mohammed V Mausoleum"],
    imageUrl: "https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=800&auto=format&fit=crop&q=60",
    mapsUrl: "https://maps.google.com/?q=Rabat,Morocco"
  },
  {
    id: "2",
    name: "Marrakech",
    nameAr: "مراكش",
    distance: 327,
    travelTime: "3h 30min",
    description: "The Red City famous for Jemaa el-Fnaa square, Bahia Palace, and vibrant souks filled with spices and crafts.",
    rating: 4.8,
    attractions: ["Jemaa el-Fnaa", "Bahia Palace", "Majorelle Garden", "Koutoubia Mosque"],
    imageUrl: "https://images.unsplash.com/photo-1597212720452-43f92e5e8f44?w=800&auto=format&fit=crop&q=60",
    mapsUrl: "https://maps.google.com/?q=Marrakech,Morocco"
  },
  {
    id: "3",
    name: "Fes",
    nameAr: "فاس",
    distance: 206,
    travelTime: "2h 30min",
    description: "Home to the world's oldest university and the largest medieval medina, renowned for its traditional tanneries.",
    rating: 4.6,
    attractions: ["Fes el-Bali Medina", "Al-Qarawiyyin University", "Chouara Tannery", "Bou Inania Madrasa"],
    imageUrl: "https://images.unsplash.com/photo-1579018603628-7f5c97975fa9?w=800&auto=format&fit=crop&q=60",
    mapsUrl: "https://maps.google.com/?q=Fes,Morocco"
  },
  {
    id: "4",
    name: "Tangier",
    nameAr: "طنجة",
    distance: 308,
    travelTime: "3h 15min",
    description: "Gateway between Europe and Africa, known for its stunning views of the Strait of Gibraltar and bohemian past.",
    rating: 4.5,
    attractions: ["Cap Spartel", "Hercules Cave", "Kasbah Museum", "Grand Socco"],
    imageUrl: "https://images.unsplash.com/photo-1553899017-94f34d3c8c90?w=800&auto=format&fit=crop&q=60",
    mapsUrl: "https://maps.google.com/?q=Tangier,Morocco"
  },
  {
    id: "5",
    name: "Chefchaouen",
    nameAr: "شفشاون",
    distance: 252,
    travelTime: "2h 45min",
    description: "The famous Blue Pearl of Morocco, nestled in the Rif Mountains with stunning blue-washed streets and buildings.",
    rating: 4.9,
    attractions: ["Blue Medina", "Kasbah Museum", "Ras El Maa Waterfall", "Spanish Mosque"],
    imageUrl: "https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=800&auto=format&fit=crop&q=60",
    mapsUrl: "https://maps.google.com/?q=Chefchaouen,Morocco"
  },
  {
    id: "6",
    name: "Essaouira",
    nameAr: "الصويرة",
    distance: 350,
    travelTime: "3h 45min",
    description: "A charming coastal city known for its historic medina, beautiful beaches, and fresh seafood.",
    rating: 4.7,
    attractions: ["Essaouira Medina", "Skala de la Kasbah", "Essaouira Beach", "Port"],
    imageUrl: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800&auto=format&fit=crop&q=60",
    mapsUrl: "https://maps.google.com/?q=Essaouira,Morocco"
  }
];

const NearbyCities = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleOpenMaps = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("common.back")}
        </Button>
        
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-gold-dark flex items-center justify-center">
            <Building2 className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-serif text-foreground">{t("nearbyCities.title")}</h1>
            <p className="text-muted-foreground">{t("nearbyCities.subtitle")}</p>
          </div>
        </div>
      </motion.div>

      {/* Cities Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities.map((city, index) => (
          <motion.div
            key={city.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card rounded-xl overflow-hidden border border-border group hover:shadow-lg transition-all"
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={city.imageUrl}
                alt={city.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-xl font-serif text-white mb-1">
                  {city.name}
                  {city.nameAr && <span className="text-white/80 text-sm ml-2">({city.nameAr})</span>}
                </h3>
                <div className="flex items-center gap-3 text-white/90 text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {city.distance} km
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {city.travelTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-accent fill-accent" />
                    {city.rating}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {city.description}
              </p>

              {/* Attractions */}
              <div className="mb-4">
                <div className="flex items-center gap-1.5 text-sm text-foreground mb-2">
                  <Landmark className="w-4 h-4 text-accent" />
                  <span className="font-medium">{t("nearbyCities.topAttractions")}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {city.attractions.slice(0, 3).map((attraction, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {attraction}
                    </Badge>
                  ))}
                  {city.attractions.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{city.attractions.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleOpenMaps(city.mapsUrl)}
                >
                  <MapPin className="w-4 h-4 mr-1.5" />
                  {t("nearbyCities.getDirections")}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleOpenMaps(city.mapsUrl)}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Travel Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 border border-border"
      >
        <div className="flex items-center gap-3 mb-4">
          <Camera className="w-6 h-6 text-accent" />
          <h2 className="text-lg font-serif text-foreground">{t("nearbyCities.travelTips")}</h2>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-accent">•</span>
            {t("nearbyCities.tip1")}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent">•</span>
            {t("nearbyCities.tip2")}
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent">•</span>
            {t("nearbyCities.tip3")}
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default NearbyCities;
