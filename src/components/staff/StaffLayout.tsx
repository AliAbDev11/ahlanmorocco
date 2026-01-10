import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import {
  LayoutDashboard,
  Users,
  BedDouble,
  UtensilsCrossed,
  Wrench,
  MessageSquareWarning,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import ahlanLogo from "@/assets/ahlan-logo.png";
import { FullscreenButton } from "@/components/ui/fullscreen-button";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/staff" },
  { icon: Users, label: "Guests", path: "/staff/guests" },
  { icon: BedDouble, label: "Rooms", path: "/staff/rooms" },
  { icon: UtensilsCrossed, label: "Orders", path: "/staff/orders" },
  { icon: Wrench, label: "Service Requests", path: "/staff/requests" },
  { icon: MessageSquareWarning, label: "Reclamations", path: "/staff/reclamations" },
];

const StaffLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { staffInfo, signOut } = useStaffAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/staff/login");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-primary text-primary-foreground transition-all duration-300 z-40",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-primary-foreground/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={ahlanLogo} alt="Ahlan" className="h-10 w-10 object-contain" />
            {sidebarOpen && (
              <span className="font-serif text-xl font-semibold">Staff Portal</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {sidebarOpen && (
              <FullscreenButton 
                variant="ghost" 
                showLabel={false} 
                className="text-primary-foreground hover:bg-primary-foreground/10" 
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/staff"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-primary-foreground/10"
                )
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-primary-foreground/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-semibold">
              {staffInfo?.full_name?.charAt(0) || "S"}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{staffInfo?.full_name || "Staff"}</p>
                <p className="text-sm text-primary-foreground/70 truncate">
                  {staffInfo?.role || "Staff Member"}
                </p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "mt-4 text-primary-foreground hover:bg-primary-foreground/10",
              sidebarOpen ? "w-full justify-start" : "w-full justify-center"
            )}
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-primary text-primary-foreground flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <img src={ahlanLogo} alt="Ahlan" className="h-8 w-8 object-contain" />
          <span className="font-serif text-lg font-semibold">Staff Portal</span>
        </div>
        <div className="flex items-center gap-2">
          <FullscreenButton 
            variant="ghost" 
            showLabel={false} 
            className="text-primary-foreground hover:bg-primary-foreground/10" 
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-primary-foreground"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed top-16 right-0 h-[calc(100vh-4rem)] w-64 bg-primary text-primary-foreground transition-transform duration-300 z-50",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/staff"}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-primary-foreground/10"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-primary-foreground/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-semibold">
              {staffInfo?.full_name?.charAt(0) || "S"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{staffInfo?.full_name || "Staff"}</p>
              <p className="text-sm text-primary-foreground/70 truncate">
                {staffInfo?.role || "Staff Member"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-primary-foreground hover:bg-primary-foreground/10"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 min-h-screen transition-all duration-300",
          "pt-16 lg:pt-0",
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        )}
      >
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StaffLayout;
