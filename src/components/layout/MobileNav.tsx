import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  MessageSquare,
  Sparkles,
  Utensils,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Sidebar from "./Sidebar";

const mobileNavItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: MessageSquare, label: "Chat", path: "/chatbot" },
  { icon: Sparkles, label: "Services", path: "/services" },
  { icon: Utensils, label: "Menu", path: "/menu" },
];

const MobileNav = () => {
  const location = useLocation();

  return (
    <>
      {/* Top bar with menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-50 flex items-center justify-between px-4">
        <span className="font-serif text-lg text-foreground">Grand Azure</span>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>

      {/* Bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-50">
        <div className="flex items-center justify-around h-full">
          {mobileNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 transition-colors",
                  isActive ? "text-accent" : "text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default MobileNav;
