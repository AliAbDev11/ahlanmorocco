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
import { useNavigate } from "react-router-dom";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: MessageSquare, label: "AI Assistant", path: "/chatbot" },
  { icon: Sparkles, label: "Services", path: "/services" },
  { icon: Map, label: "Hotel Map", path: "/map" },
  { icon: Utensils, label: "Menu & Dining", path: "/menu" },
  { icon: Compass, label: "Local Guide", path: "/guide" },
  { icon: MessageCircle, label: "Reclamations", path: "/requests" },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isCollapsed, toggleCollapsed } = useSidebarContext();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: t("common.error"),
        description: t("auth.signOutError"),
        variant: "destructive",
      });
    } else {
      navigate("/", { replace: true });
    }
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "h-screen bg-card border-r border-border flex flex-col transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "p-6 border-b border-border",
        isCollapsed ? "flex flex-col items-center gap-3" : "flex items-center justify-between"
      )}>
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Hotel className="w-5 h-5 text-accent" />
          </div>
          {!isCollapsed && (
            <span className="font-serif text-lg text-foreground">Hyatt regency</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className="hidden lg:flex"
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
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-accent")} />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-border">
        <div className={cn("flex items-center gap-3 mb-4", isCollapsed && "justify-center")}>
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
            <span className="text-accent font-medium">G</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Guest</p>
              <p className="text-xs text-muted-foreground">Suite 405</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          className={cn("w-full justify-start text-muted-foreground", isCollapsed && "justify-center")}
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
