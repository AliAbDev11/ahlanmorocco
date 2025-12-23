import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Sparkles,
  Utensils,
  Map,
  Compass,
  Clock,
  ChevronRight,
  Bell,
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

const Dashboard = () => {
  const navigate = useNavigate();
  const guestData = JSON.parse(localStorage.getItem("hotelGuest") || '{"username": "Guest", "room": "Suite 405"}');

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-muted-foreground">Welcome back,</p>
            <h1 className="text-3xl lg:text-4xl font-serif text-foreground">
              {guestData.username}
            </h1>
          </div>
          <div className="relative">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full text-xs flex items-center justify-center text-accent-foreground">
                2
              </span>
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {guestData.room} • Check-out: December 28, 2024
        </p>
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
