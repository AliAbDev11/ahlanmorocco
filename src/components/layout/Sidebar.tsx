import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  MessageSquare,
  Sparkles,
  Map,
  Utensils,
  Compass,
  MessageCircle,
  LogOut,
  Hotel,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: MessageSquare, label: "AI Assistant", path: "/chatbot" },
  { icon: Sparkles, label: "Services", path: "/services" },
  { icon: Map, label: "Hotel Map", path: "/map" },
  { icon: Utensils, label: "Menu & Dining", path: "/menu" },
  { icon: Compass, label: "Local Guide", path: "/guide" },
  { icon: MessageCircle, label: "Requests", path: "/requests" },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const guestData = JSON.parse(localStorage.getItem("hotelGuest") || '{"full_name": "Guest", "room_number": "Suite 405"}');
  
  const guestName = guestData.full_name || guestData.username || "Guest";
  const roomNumber = guestData.room_number || guestData.room || "Suite 405";
  const initials = guestName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("hotelGuest");
    navigate("/");
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "h-screen bg-navy-dark border-r border-navy-light/20 flex flex-col transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-navy-light/20 flex items-center justify-between">
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <Hotel className="w-5 h-5 text-accent-foreground" />
          </div>
          {!isCollapsed && (
            <span className="font-serif text-lg text-cream">Grand Azure</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex text-cream/60 hover:text-cream hover:bg-navy-light/20"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-cream/60 hover:text-cream hover:bg-navy-light/20"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-accent-foreground")} />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-navy-light/20">
        <div className={cn("flex items-center gap-3 mb-4", isCollapsed && "justify-center")}>
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
            <span className="text-accent font-medium text-sm">{initials}</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-cream truncate">{guestName}</p>
              <p className="text-xs text-cream/60">{roomNumber}</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-cream/60 hover:text-cream hover:bg-navy-light/20",
            isCollapsed && "justify-center"
          )}
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
