import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  Sparkles,
  Utensils,
  Map,
  Compass,
  Clock,
  ChevronRight,
  Bell,
  Wifi,
  Globe,
  Check,
} from "lucide-react";

const quickActions = [
  { icon: MessageSquare, label: "AI Assistant", path: "/chatbot", color: "bg-primary" },
  { icon: Utensils, label: "Order Food", path: "/menu", color: "bg-accent" },
  { icon: Sparkles, label: "Room Service", path: "/services", color: "bg-primary" },
  { icon: Map, label: "Hotel Map", path: "/map", color: "bg-accent" },
];

const notifications = [
  { id: 1, title: "Spa Appointment", message: "Your massage is scheduled for 3:00 PM", time: "2h" },
  { id: 2, title: "Restaurant Reservation", message: "Table for 2 at Azure Terrace, 7:30 PM", time: "5h" },
];

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const guestData = JSON.parse(localStorage.getItem("hotelGuest") || '{"full_name": "Guest", "room_number": "Suite 405"}');
  
  const displayName = guestData.full_name || guestData.username || "Guest";
  const roomNumber = guestData.room_number || guestData.room || "Suite 405";

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header with gradient background */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 -mx-6 -mt-6 lg:-mx-8 lg:-mt-8 px-6 py-6 lg:px-8 lg:py-8 rounded-b-3xl relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, hsl(var(--navy-dark)) 0%, hsl(var(--primary)) 50%, hsl(var(--navy-light)) 100%)",
        }}
      >
        {/* Decorative pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <div className="relative z-10">
          {/* Top row: Language selector and actions */}
          <div className="flex items-center justify-end gap-2 mb-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/10 gap-2">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">{languages.find(l => l.code === currentLanguage)?.flag}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px]">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setCurrentLanguage(lang.code)}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </span>
                    {currentLanguage === lang.code && <Check className="w-4 h-4 text-accent" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notification Bell */}
            <Button variant="ghost" size="icon" className="relative text-primary-foreground hover:bg-white/10">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full text-xs flex items-center justify-center text-accent-foreground font-medium">
                2
              </span>
            </Button>
          </div>

          {/* Main header content */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-primary-foreground/80 text-sm">Welcome back,</p>
              <h1 className="text-3xl lg:text-4xl font-serif text-primary-foreground mb-2">
                {displayName}
              </h1>
              <p className="text-primary-foreground/80 flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                {roomNumber} • Check-out: December 28, 2024
              </p>
            </div>

            {/* WiFi QR Code */}
            <div className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="flex items-center gap-1.5 text-primary-foreground mb-2">
                <Wifi className="w-4 h-4" />
                <span className="text-xs font-medium">WiFi</span>
              </div>
              <div className="bg-white rounded-lg p-2">
                <svg width="64" height="64" viewBox="0 0 64 64" className="text-foreground">
                  {/* QR Code pattern */}
                  <rect x="4" y="4" width="16" height="16" fill="currentColor"/>
                  <rect x="8" y="8" width="8" height="8" fill="white"/>
                  <rect x="10" y="10" width="4" height="4" fill="currentColor"/>
                  
                  <rect x="44" y="4" width="16" height="16" fill="currentColor"/>
                  <rect x="48" y="8" width="8" height="8" fill="white"/>
                  <rect x="50" y="10" width="4" height="4" fill="currentColor"/>
                  
                  <rect x="4" y="44" width="16" height="16" fill="currentColor"/>
                  <rect x="8" y="48" width="8" height="8" fill="white"/>
                  <rect x="10" y="50" width="4" height="4" fill="currentColor"/>
                  
                  <rect x="24" y="4" width="4" height="4" fill="currentColor"/>
                  <rect x="32" y="4" width="4" height="4" fill="currentColor"/>
                  <rect x="24" y="12" width="4" height="4" fill="currentColor"/>
                  <rect x="28" y="8" width="4" height="4" fill="currentColor"/>
                  <rect x="36" y="12" width="4" height="4" fill="currentColor"/>
                  
                  <rect x="4" y="24" width="4" height="4" fill="currentColor"/>
                  <rect x="12" y="28" width="4" height="4" fill="currentColor"/>
                  <rect x="4" y="32" width="4" height="4" fill="currentColor"/>
                  <rect x="8" y="36" width="4" height="4" fill="currentColor"/>
                  
                  <rect x="24" y="24" width="4" height="4" fill="currentColor"/>
                  <rect x="32" y="24" width="4" height="4" fill="currentColor"/>
                  <rect x="28" y="28" width="4" height="4" fill="currentColor"/>
                  <rect x="24" y="32" width="4" height="4" fill="currentColor"/>
                  <rect x="36" y="32" width="4" height="4" fill="currentColor"/>
                  <rect x="32" y="36" width="4" height="4" fill="currentColor"/>
                  
                  <rect x="44" y="24" width="4" height="4" fill="currentColor"/>
                  <rect x="52" y="28" width="4" height="4" fill="currentColor"/>
                  <rect x="56" y="32" width="4" height="4" fill="currentColor"/>
                  <rect x="48" y="36" width="4" height="4" fill="currentColor"/>
                  
                  <rect x="24" y="44" width="4" height="4" fill="currentColor"/>
                  <rect x="32" y="48" width="4" height="4" fill="currentColor"/>
                  <rect x="28" y="52" width="4" height="4" fill="currentColor"/>
                  <rect x="36" y="56" width="4" height="4" fill="currentColor"/>
                  
                  <rect x="44" y="44" width="4" height="4" fill="currentColor"/>
                  <rect x="52" y="48" width="4" height="4" fill="currentColor"/>
                  <rect x="48" y="52" width="4" height="4" fill="currentColor"/>
                  <rect x="56" y="56" width="4" height="4" fill="currentColor"/>
                </svg>
              </div>
              <span className="text-[10px] text-primary-foreground/70 mt-1">Scan to connect</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-xl font-serif text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                onClick={() => navigate(action.path)}
                className="service-card flex flex-col items-center gap-3 py-6"
              >
                <div className={`w-14 h-14 rounded-xl ${action.color} flex items-center justify-center`}>
                  <Icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <span className="font-medium text-foreground">{action.label}</span>
              </motion.button>
            );
          })}
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
          <Button variant="ghost" size="sm">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <div className="space-y-3">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + index * 0.05 }}
              className="bg-card rounded-xl p-4 border border-border flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground">{notification.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{notification.message}</p>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {notification.time}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Explore Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-serif text-foreground mb-4">Explore</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/guide")}
            className="bg-gradient-to-br from-primary to-navy-dark rounded-xl p-6 text-left group transition-all hover:shadow-lg"
          >
            <Compass className="w-10 h-10 text-accent mb-4" />
            <h3 className="text-xl font-serif text-primary-foreground mb-2">Local Guide</h3>
            <p className="text-sm text-primary-foreground/80">
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
  );
};

export default Dashboard;
