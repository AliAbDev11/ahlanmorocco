import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck, Trash2, Filter, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'order':
      return '🍽️';
    case 'service_request':
      return '🛎️';
    case 'complaint':
      return '⚠️';
    case 'assignment':
      return '📋';
    case 'reminder':
      return '⏰';
    case 'alert':
      return '🔔';
    case 'system':
    default:
      return 'ℹ️';
  }
};

const getPriorityBadge = (priority: Notification['priority']) => {
  switch (priority) {
    case 'urgent':
      return <Badge variant="destructive">Urgent</Badge>;
    case 'high':
      return <Badge className="bg-orange-500">High</Badge>;
    case 'medium':
      return <Badge variant="secondary">Medium</Badge>;
    case 'low':
    default:
      return <Badge variant="outline">Low</Badge>;
  }
};

const getTypeBadge = (type: Notification['type']) => {
  const typeLabels: Record<Notification['type'], string> = {
    order: 'Order',
    service_request: 'Service',
    complaint: 'Complaint',
    system: 'System',
    assignment: 'Assignment',
    reminder: 'Reminder',
    alert: 'Alert',
  };
  
  return <Badge variant="outline">{typeLabels[type]}</Badge>;
};

const Notifications = () => {
  const navigate = useNavigate();
  const { user, guestSession } = useAuth();
  const userId = user?.id || guestSession?.guestId;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications({ 
    userId, 
    userType: 'guest',
    limit: 100 
  });

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchQuery === '' || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter;
    
    return matchesSearch && matchesType && matchesPriority;
  });

  const unreadNotifications = filteredNotifications.filter(n => !n.is_read);
  const readNotifications = filteredNotifications.filter(n => n.is_read);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const formatFullDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPpp');
    } catch {
      return dateString;
    }
  };

  const NotificationItem = ({ notification }: { notification: Notification }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer group',
        !notification.is_read 
          ? 'bg-primary/5 border-primary/20' 
          : 'bg-card border-border'
      )}
      onClick={() => handleNotificationClick(notification)}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
          {getNotificationIcon(notification.type)}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={cn(
                'text-foreground',
                !notification.is_read && 'font-semibold'
              )}>
                {notification.title}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {notification.message}
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.is_read && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notification.id);
                  }}
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Meta info */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {getPriorityBadge(notification.priority)}
            {getTypeBadge(notification.type)}
            <span className="text-xs text-muted-foreground">
              {formatTime(notification.created_at)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-serif text-foreground">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'All caught up!'}
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="order">Orders</SelectItem>
              <SelectItem value="service_request">Services</SelectItem>
              <SelectItem value="complaint">Complaints</SelectItem>
              <SelectItem value="reminder">Reminders</SelectItem>
              <SelectItem value="alert">Alerts</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
          
          {notifications.length > 0 && (
            <Button variant="outline" className="text-destructive" onClick={clearAllNotifications}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </motion.div>

      {/* Content */}
      {filteredNotifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-muted-foreground"
        >
          <Bell className="w-16 h-16 mb-4 opacity-30" />
          <p className="text-lg">No notifications found</p>
          <p className="text-sm mt-1">
            {searchQuery || typeFilter !== 'all' || priorityFilter !== 'all' 
              ? 'Try adjusting your filters'
              : "We'll notify you when something arrives"}
          </p>
        </motion.div>
      ) : (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">
              All ({filteredNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="read">
              Read ({readNotifications.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {filteredNotifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </TabsContent>
          
          <TabsContent value="unread" className="space-y-4">
            {unreadNotifications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No unread notifications</p>
            ) : (
              unreadNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="read" className="space-y-4">
            {readNotifications.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No read notifications</p>
            ) : (
              readNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Notifications;
