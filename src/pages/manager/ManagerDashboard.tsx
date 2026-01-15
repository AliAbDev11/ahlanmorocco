import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  DoorOpen, 
  ShoppingCart, 
  Wrench, 
  MessageSquareWarning,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  CalendarCheck,
  CalendarX
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface DashboardStats {
  activeGuests: number;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
  pendingOrders: number;
  pendingRequests: number;
  openComplaints: number;
  todayRevenue: number;
  todayCheckIns: number;
  todayCheckOuts: number;
}

interface RecentActivity {
  id: string;
  type: 'order' | 'request' | 'complaint' | 'checkin' | 'checkout';
  description: string;
  room_number: string;
  created_at: string;
  status: string;
}

const COLORS = ['hsl(var(--accent))', 'hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(var(--muted-foreground))'];

const ManagerDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [occupancyData, setOccupancyData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [serviceTypeData, setServiceTypeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date();
      const todayStart = startOfDay(today).toISOString();
      const todayEnd = endOfDay(today).toISOString();

      // Fetch all data in parallel
      const [
        guestsResult,
        roomsResult,
        ordersResult,
        requestsResult,
        complaintsResult,
        todayOrdersResult
      ] = await Promise.all([
        supabase.from('guests').select('*', { count: 'exact' }).eq('is_active', true),
        supabase.from('rooms').select('*'),
        supabase.from('orders').select('*', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('service_requests').select('*', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('reclamations').select('*', { count: 'exact' }).eq('status', 'open'),
        supabase.from('orders').select('total_price').gte('created_at', todayStart).lte('created_at', todayEnd)
      ]);

      const rooms = roomsResult.data || [];
      const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
      const availableRooms = rooms.filter(r => r.status === 'available').length;
      const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;

      const todayRevenue = todayOrdersResult.data?.reduce((sum, order) => sum + (order.total_price || 0), 0) || 0;

      // Count today's check-ins and check-outs
      const { count: todayCheckIns } = await supabase
        .from('guests')
        .select('*', { count: 'exact', head: true })
        .gte('check_in_date', todayStart)
        .lte('check_in_date', todayEnd);

      const { count: todayCheckOuts } = await supabase
        .from('guests')
        .select('*', { count: 'exact', head: true })
        .gte('check_out_date', todayStart)
        .lte('check_out_date', todayEnd);

      setStats({
        activeGuests: guestsResult.count || 0,
        totalRooms: rooms.length,
        occupiedRooms,
        availableRooms,
        maintenanceRooms,
        pendingOrders: ordersResult.count || 0,
        pendingRequests: requestsResult.count || 0,
        openComplaints: complaintsResult.count || 0,
        todayRevenue,
        todayCheckIns: todayCheckIns || 0,
        todayCheckOuts: todayCheckOuts || 0
      });

      // Fetch recent activity
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('id, room_number, created_at, status, total_price')
        .order('created_at', { ascending: false })
        .limit(5);

      const activity: RecentActivity[] = (recentOrders || []).map(order => ({
        id: order.id,
        type: 'order' as const,
        description: `Order $${order.total_price?.toFixed(2)}`,
        room_number: order.room_number,
        created_at: order.created_at,
        status: order.status
      }));

      setRecentActivity(activity);

      // Generate mock occupancy data for last 14 days
      const occupancy = [];
      for (let i = 13; i >= 0; i--) {
        const date = subDays(today, i);
        occupancy.push({
          date: format(date, 'MMM dd'),
          occupancy: Math.floor(60 + Math.random() * 35), // 60-95%
          revenue: Math.floor(1000 + Math.random() * 4000)
        });
      }
      setOccupancyData(occupancy);

      // Generate revenue data
      const revenue = [];
      const categories = ['Food', 'Beverages', 'Room Service', 'Spa', 'Other'];
      categories.forEach(cat => {
        revenue.push({
          name: cat,
          value: Math.floor(500 + Math.random() * 2000)
        });
      });
      setRevenueData(revenue);

      // Service request types
      const { data: serviceRequests } = await supabase
        .from('service_requests')
        .select('service_type');
      
      const serviceTypes: Record<string, number> = {};
      (serviceRequests || []).forEach(req => {
        const type = req.service_type || 'Other';
        serviceTypes[type] = (serviceTypes[type] || 0) + 1;
      });
      
      setServiceTypeData(Object.entries(serviceTypes).map(([name, value]) => ({ name, value })));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const occupancyRate = stats ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0;

  const statCards = [
    { 
      title: 'Active Guests', 
      value: stats?.activeGuests || 0, 
      icon: Users, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      trend: '+5%'
    },
    { 
      title: 'Occupancy Rate', 
      value: `${occupancyRate}%`, 
      icon: DoorOpen, 
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      trend: '+2%'
    },
    { 
      title: 'Today\'s Revenue', 
      value: `$${stats?.todayRevenue?.toFixed(2) || '0.00'}`, 
      icon: DollarSign, 
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      trend: '+12%'
    },
    { 
      title: 'Pending Orders', 
      value: stats?.pendingOrders || 0, 
      icon: ShoppingCart, 
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    { 
      title: 'Service Requests', 
      value: stats?.pendingRequests || 0, 
      icon: Wrench, 
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    { 
      title: 'Open Complaints', 
      value: stats?.openComplaints || 0, 
      icon: MessageSquareWarning, 
      color: 'text-destructive',
      bgColor: 'bg-destructive/10'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's what's happening at hyatt regency Hotel today.
        </p>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat, index) => (
            <Card key={index} className="hover:shadow-card-hover transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {stat.title}
                  </span>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                  {stat.trend && (
                    <span className="text-xs text-green-500 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" />
                      {stat.trend}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Room Status & Today's Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Room Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Room Status</CardTitle>
            <CardDescription>Current room availability</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm font-medium">Available</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{stats?.availableRooms}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm font-medium">Occupied</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{stats?.occupiedRooms}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-sm font-medium">Maintenance</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">{stats?.maintenanceRooms}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Activity</CardTitle>
            <CardDescription>Check-ins and check-outs</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array(2).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-green-500/10 rounded-lg">
                  <CalendarCheck className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats?.todayCheckIns}</p>
                    <p className="text-sm text-muted-foreground">Check-ins Today</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-red-500/10 rounded-lg">
                  <CalendarX className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats?.todayCheckOuts}</p>
                    <p className="text-sm text-muted-foreground">Check-outs Today</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <CardDescription>Latest order activity</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array(4).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">Room {activity.room_number}</p>
                      </div>
                    </div>
                    <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Occupancy & Revenue Trend</CardTitle>
            <CardDescription>Last 14 days performance</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="occupancy" 
                    name="Occupancy %"
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="revenue" 
                    name="Revenue $"
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--accent))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Revenue Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue by Category</CardTitle>
            <CardDescription>Distribution of revenue sources</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Service Requests Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Service Request Types</CardTitle>
          <CardDescription>Breakdown of service requests by category</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[250px] w-full" />
          ) : serviceTypeData.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              No service request data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={serviceTypeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerDashboard;
