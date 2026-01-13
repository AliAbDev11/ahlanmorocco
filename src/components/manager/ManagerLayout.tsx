import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useManagerAuth } from '@/hooks/useManagerAuth';
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
  BarChart3
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

const navItems = [
  { path: '/manager', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/manager/guests', icon: Users, label: 'Guests' },
  { path: '/manager/rooms', icon: DoorOpen, label: 'Rooms' },
  { path: '/manager/orders', icon: ShoppingCart, label: 'Orders & Revenue' },
  { path: '/manager/requests', icon: Wrench, label: 'Service Requests' },
  { path: '/manager/complaints', icon: MessageSquareWarning, label: 'Complaints' },
  { path: '/manager/staff', icon: UserCog, label: 'Staff' },
  { path: '/manager/reports', icon: FileText, label: 'Reports' },
  { path: '/manager/settings', icon: Settings, label: 'Settings' },
];

const ManagerLayout = () => {
  const { managerInfo, signOut, user } = useManagerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/manager/login');
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
              Manager Dashboard
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <FullscreenButton variant="outline" showLabel={true} />
            
            <NotificationBell 
              userId={user?.id}
              userType="manager"
              variant="ghost"
            />

            <div className="h-8 w-px bg-border" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 bg-accent">
                    <AvatarFallback className="bg-accent text-accent-foreground text-sm">
                      {managerInfo?.full_name ? getInitials(managerInfo.full_name) : 'MG'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground hidden sm:inline">
                    {managerInfo?.full_name || 'Manager'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/manager/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
