import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useManagerAuth } from '@/hooks/useManagerAuth';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Users, 
  DoorOpen, 
  ShoppingCart, 
  Wrench,
  MessageSquareWarning,
  UserCog,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  BarChart3,
  Compass,
  Globe
} from 'lucide-react';
import { FullscreenButton } from '@/components/ui/fullscreen-button';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import ahlanLogo from '@/assets/ahlan-logo.png';

const languages = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

const ManagerLayout = () => {
  const { managerInfo, signOut, user } = useManagerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { path: '/manager', icon: LayoutDashboard, label: t('nav.dashboard'), exact: true },
    { path: '/manager/guests', icon: Users, label: t('manager.guests') },
    { path: '/manager/rooms', icon: DoorOpen, label: t('manager.rooms') },
    { path: '/manager/orders', icon: ShoppingCart, label: t('manager.ordersRevenue') },
    { path: '/manager/requests', icon: Wrench, label: t('manager.serviceRequests') },
    { path: '/manager/complaints', icon: MessageSquareWarning, label: t('manager.complaints') },
    { path: '/manager/local-guide', icon: Compass, label: t('manager.localGuide') },
    { path: '/manager/staff', icon: UserCog, label: t('manager.staffManagement') },
    { path: '/manager/reports', icon: FileText, label: t('manager.reports') },
    { path: '/manager/settings', icon: Settings, label: t('manager.settings') },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/manager/login');
  };

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem("language", langCode);
  };

  const getCurrentLanguage = () => {
    return languages.find((lang) => lang.code === i18n.language) || languages[0];
  };

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="h-screen bg-background flex w-full overflow-hidden">
      {/* Fixed Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-screen bg-card border-r border-border flex flex-col transition-all duration-300 z-50",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <img src={ahlanLogo} alt="Logo" className="h-8 w-auto" />
              <span className="font-serif font-semibold text-foreground">Manager</span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCollapsed(!collapsed)}
            className="text-muted-foreground hover:text-foreground"
          >
            {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const active = isActive(item.path, item.exact);
              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                      active 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border">
          {collapsed ? (
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 bg-accent">
                <AvatarFallback className="bg-accent text-accent-foreground text-sm">
                  {managerInfo?.full_name ? getInitials(managerInfo.full_name) : 'MG'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {managerInfo?.full_name || 'Manager'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {managerInfo?.role || 'Manager'}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content with offset for fixed sidebar */}
      <div 
        className={cn(
          "flex-1 flex flex-col h-screen transition-all duration-300",
          collapsed ? "ml-16" : "ml-64"
        )}
      >
        {/* Sticky Top Bar */}
        <header className="sticky top-0 z-40 h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent" />
            <h1 className="text-lg font-serif font-semibold text-foreground">
              {t('manager.dashboard')}
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
                <DropdownMenuLabel>{t('common.selectLanguage')}</DropdownMenuLabel>
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

            <FullscreenButton variant="outline" showLabel={true} />
            
            <NotificationBell 
              userId={user?.id}
              userType="manager"
              variant="ghost"
            />
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-muted/30">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;
