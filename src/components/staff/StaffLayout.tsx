import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { useTranslation } from "react-i18next";
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
  ChevronLeft,
  ChevronRight,
  Globe,
  Settings,
  Building2
} from "lucide-react";
import ahlanLogo from "@/assets/ahlan-logo.png";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

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
  const { staffInfo, signOut, user } = useStaffAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();

  const handleLogout = async () => {
    await signOut();
    navigate("/staff/login");
  };

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem("language", langCode);
  };

  const getCurrentLanguage = () => {
    return languages.find((lang) => lang.code === i18n.language) || languages[0];
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-screen bg-background flex w-full overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-50",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <img src={ahlanLogo} alt="Ahlan" className="h-8 w-auto" />
              <span className="font-serif font-semibold text-foreground">Staff</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-muted-foreground hover:text-foreground"
          >
            {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const active = isActive(item.path, item.path === "/staff");
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === "/staff"}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section at bottom of sidebar */}
        <div className="p-4 border-t border-border">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 bg-accent">
                <AvatarFallback className="bg-accent text-accent-foreground text-sm">
                  {staffInfo?.full_name ? getInitials(staffInfo.full_name) : "S"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {staffInfo?.full_name || "Staff"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {staffInfo?.role || "Staff Member"}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </Button>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <img src={ahlanLogo} alt="Ahlan" className="h-8 w-8 object-contain" />
          <span className="font-serif text-lg font-semibold text-foreground">Staff Portal</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card">
              <DropdownMenuLabel>Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={cn(
                    i18n.language === lang.code && "bg-muted"
                  )}
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <NotificationBell
            userId={user?.id}
            userType="staff"
            variant="ghost"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-foreground"
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
          "lg:hidden fixed top-16 right-0 h-[calc(100vh-4rem)] w-64 bg-card border-l border-border transition-transform duration-300 z-50",
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
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10 bg-accent">
              <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
                {staffInfo?.full_name ? getInitials(staffInfo.full_name) : "S"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{staffInfo?.full_name || "Staff"}</p>
              <p className="text-sm text-muted-foreground truncate">
                {staffInfo?.role || "Staff Member"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-foreground hover:bg-muted"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content with offset for fixed sidebar */}
      <div
        className={cn(
          "flex-1 flex flex-col h-screen transition-all duration-300",
          "lg:pt-0 pt-16",
          sidebarOpen ? "lg:ml-64" : "lg:ml-16"
        )}
      >
        {/* Sticky Top Bar - Desktop only */}
        <header className="hidden lg:flex sticky top-0 z-40 h-16 bg-card border-b border-border items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-accent" />
            <h1 className="text-lg font-serif font-semibold text-foreground">
              Staff Portal
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">{getCurrentLanguage().flag}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card">
                <DropdownMenuLabel>Select Language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={cn(
                      "cursor-pointer",
                      i18n.language === lang.code && "bg-muted"
                    )}
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <NotificationBell
              userId={user?.id}
              userType="staff"
              variant="ghost"
            />

            <div className="h-8 w-px bg-border" />

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 bg-accent">
                    <AvatarFallback className="bg-accent text-accent-foreground text-sm">
                      {staffInfo?.full_name ? getInitials(staffInfo.full_name) : "S"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground">
                      {staffInfo?.full_name || "Staff"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {staffInfo?.role || "Staff Member"}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-muted/30">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;