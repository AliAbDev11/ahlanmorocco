import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { enUS, fr, es, de } from "date-fns/locale";
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
  Globe,
  Check,
} from "lucide-react";
import ahlanLogo from "@/assets/ahlan-logo.png";
import { useGuestProfile } from "@/hooks/useGuestProfile";
import { useAuth } from "@/hooks/useAuth";
import { FullscreenButton } from "@/components/ui/fullscreen-button";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

const dateLocales: Record<string, typeof enUS> = {
  en: enUS,
  fr: fr,
  es: es,
  de: de,
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { guest, loading: guestLoading } = useGuestProfile();
  const { user, guestSession, loading: authLoading, isAuthenticated } = useAuth();

  const currentLanguage = i18n.language;

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
  };

  // Redirect to login if not authenticated (neither Supabase user nor guest session)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const formatCheckoutDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = dateLocales[currentLanguage] || enUS;
    return format(date, "EEEE, MMMM d, yyyy", { locale });
  };

  // Get display name from guest session, guest profile, or user email
  const getDisplayName = () => {
    // First check guest session (from QR code login)
    if (guestSession?.fullName) return guestSession.fullName;
    // Then check guest profile (from Supabase)
    if (guest?.full_name) return guest.full_name;
    // Finally fall back to user email
    if (user?.email) {
      const namePart = user.email.split("@")[0];
      return namePart
        .replace(/[0-9]/g, "")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[._-]/g, " ")
        .split(" ")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")
        .trim() || "Guest";
    }
    return "Guest";
  };

  const displayName = getDisplayName();
  // Get room number from guest session or guest profile
  const roomNumber = guestSession?.roomNumber || guest?.room_number || t("common.notAssigned");
  // Get checkout date from guest session or guest profile
  const checkOutDate = guestSession?.checkOutDate || guest?.check_out_date;

  // Get translated quick actions
  const quickActions = [
    { icon: MessageSquare, label: t("dashboard.aiAssistant"), path: "/chatbot", color: "bg-primary" },
    { icon: Utensils, label: t("dashboard.orderFood"), path: "/menu", color: "bg-accent" },
    { icon: Sparkles, label: t("dashboard.hotelServices"), path: "/services", color: "bg-primary" },
    { icon: Map, label: t("dashboard.hotelMap"), path: "/map", color: "bg-accent" },
  ];

  // Get translated notifications
  const notifications = [
    { id: 1, title: t("dashboard.spaAppointment"), message: t("dashboard.spaMessage"), time: "2h" },
    { id: 2, title: t("dashboard.restaurantReservation"), message: t("dashboard.restaurantMessage"), time: "5h" },
  ];

  if (authLoading || guestLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
          {/* Top row: Language selector, Fullscreen, and Notifications */}
          <div className="flex items-center justify-end gap-2 mb-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10 h-9 w-9">
                  <Globe className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[140px]">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
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

            {/* Fullscreen Button - matching style */}
            <FullscreenButton 
              variant="ghost" 
              showLabel={false} 
              className="text-primary-foreground hover:bg-white/10 h-9 w-9" 
            />

            {/* Notification Bell */}
            <NotificationBell 
              userId={user?.id || guestSession?.guestId}
              userType="guest"
              variant="ghost"
              className="text-primary-foreground hover:bg-white/10 h-9 w-9"
            />
          </div>

          {/* Main header content */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-primary-foreground/80 text-sm">{t("common.welcomeBack")}</p>
              <h1 className="text-3xl lg:text-4xl font-serif text-primary-foreground mb-2">
                {displayName}
              </h1>
              <p className="text-primary-foreground/80 flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                {roomNumber} • {checkOutDate 
                  ? `${t("common.checkout")}: ${formatCheckoutDate(checkOutDate)}`
                  : t("common.welcomeHotel")}
              </p>
            </div>

            {/* Ahlan Logo */}
            <div className="flex-shrink-0">
              <img 
                src={ahlanLogo} 
                alt="Ahlan" 
                className="w-20 h-20 lg:w-24 lg:h-24 object-contain rounded-xl"
              />
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
        <h2 className="text-xl font-serif text-foreground mb-4">{t("dashboard.quickActions")}</h2>
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
          <h2 className="text-xl font-serif text-foreground">{t("dashboard.upcoming")}</h2>
          <Button variant="ghost" size="sm">
            {t("common.viewAll")} <ChevronRight className="w-4 h-4 ml-1" />
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
        <h2 className="text-xl font-serif text-foreground mb-4">{t("dashboard.explore")}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate("/guide")}
            className="bg-gradient-to-br from-primary to-navy-dark rounded-xl p-6 text-left group transition-all hover:shadow-lg"
          >
            <Compass className="w-10 h-10 text-accent mb-4" />
            <h3 className="text-xl font-serif text-primary-foreground mb-2">{t("dashboard.localGuide")}</h3>
            <p className="text-sm text-primary-foreground/80">
              {t("dashboard.localGuideDesc")}
            </p>
            <span className="inline-flex items-center gap-1 text-accent text-sm font-medium mt-4 group-hover:gap-2 transition-all">
              {t("common.exploreNow")} <ChevronRight className="w-4 h-4" />
            </span>
          </button>

          <button
            onClick={() => navigate("/menu")}
            className="bg-gradient-to-br from-accent to-gold-dark rounded-xl p-6 text-left group transition-all hover:shadow-lg"
          >
            <Utensils className="w-10 h-10 text-accent-foreground mb-4" />
            <h3 className="text-xl font-serif text-accent-foreground mb-2">{t("dashboard.inRoomDining")}</h3>
            <p className="text-sm text-accent-foreground/80">
              {t("dashboard.inRoomDiningDesc")}
            </p>
            <span className="inline-flex items-center gap-1 text-accent-foreground text-sm font-medium mt-4 group-hover:gap-2 transition-all">
              {t("common.viewMenu")} <ChevronRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      </motion.section>
    </div>
  );
};

export default Dashboard;
