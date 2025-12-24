import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Utensils,
  Sparkles,
  Map,
  Compass,
  Bell,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/dashboard/HeroSection";
import QuickActionCard from "@/components/dashboard/QuickActionCard";
import WeatherWidget from "@/components/dashboard/WeatherWidget";
import AmenitiesWidget from "@/components/dashboard/AmenitiesWidget";
import LanguageSelector from "@/components/dashboard/LanguageSelector";

const quickActions = [
  { icon: MessageSquare, label: "AI Assistant", description: "Chat with concierge", path: "/chatbot" },
  { icon: Utensils, label: "Order Food", description: "Order food & drinks", path: "/menu" },
  { icon: Sparkles, label: "Room Service", description: "Request housekeeping", path: "/services" },
  { icon: Map, label: "Hotel Map", description: "Explore the property", path: "/map" },
];

const upcomingEvents = [
  { id: 1, title: "Spa Appointment", message: "Your massage is scheduled for 3:00 PM", time: "2h" },
  { id: 2, title: "Restaurant Reservation", message: "Table for 2 at Azure Terrace, 7:30 PM", time: "5h" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const guestData = JSON.parse(localStorage.getItem("hotelGuest") || '{"username": "Guest", "room": "Suite 405", "full_name": "John Smith"}');
  
  const guestName = guestData.full_name || guestData.username || "Guest";
  const roomNumber = guestData.room_number || guestData.room || "Suite 405";

  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation bar */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div />
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full text-xs flex items-center justify-center text-accent-foreground font-medium">
                2
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <HeroSection guestName={guestName} roomNumber={roomNumber} />

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-serif text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={action.label}
                icon={action.icon}
                label={action.label}
                description={action.description}
                onClick={() => navigate(action.path)}
                delay={0.1 + index * 0.05}
              />
            ))}
          </div>
        </motion.section>

        {/* Upcoming Activities */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif text-foreground">Upcoming</h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + index * 0.05 }}
                className="bg-card rounded-xl p-4 border border-border flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground">{event.title}</h3>
                  <p className="text-sm text-muted-foreground truncate">{event.message}</p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {event.time}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Weather & Amenities Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <WeatherWidget />
          <AmenitiesWidget />
        </div>

        {/* Explore Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-serif text-foreground mb-4">Explore</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/guide")}
              className="bg-gradient-to-br from-navy to-navy-dark rounded-xl p-6 text-left group transition-all hover:shadow-lg"
            >
              <Compass className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-xl font-serif text-cream mb-2">Local Guide</h3>
              <p className="text-sm text-cream/80">
                Discover the best attractions, restaurants, and hidden gems nearby
              </p>
              <span className="inline-flex items-center gap-1 text-accent text-sm font-medium mt-4 group-hover:gap-2 transition-all">
                Explore Now <ChevronRight className="w-4 h-4" />
              </span>
            </button>

            <button
              onClick={() => navigate("/menu")}
              className="bg-gradient-to-br from-accent to-gold-dark rounded-xl p-6 text-left group transition-all hover:shadow-lg"
            >
              <Utensils className="w-10 h-10 text-accent-foreground mb-4" />
              <h3 className="text-xl font-serif text-accent-foreground mb-2">In-Room Dining</h3>
              <p className="text-sm text-accent-foreground/80">
                Explore our gourmet menu and order directly to your room
              </p>
              <span className="inline-flex items-center gap-1 text-accent-foreground text-sm font-medium mt-4 group-hover:gap-2 transition-all">
                View Menu <ChevronRight className="w-4 h-4" />
              </span>
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Dashboard;
