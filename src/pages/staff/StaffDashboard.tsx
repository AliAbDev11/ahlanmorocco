import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, BedDouble, UtensilsCrossed, Wrench, MessageSquareWarning, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

interface DashboardStats {
  activeGuests: number;
  availableRooms: number;
  occupiedRooms: number;
  pendingOrders: number;
  pendingRequests: number;
  openReclamations: number;
}

const StaffDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        guestsResult,
        roomsResult,
        ordersResult,
        requestsResult,
        reclamationsResult
      ] = await Promise.all([
        supabase.from("guests").select("id", { count: "exact" }).eq("is_active", true),
        supabase.from("rooms").select("status"),
        supabase.from("orders").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("service_requests").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("reclamations").select("id", { count: "exact" }).eq("status", "open"),
      ]);

      const roomStatuses = roomsResult.data || [];
      const availableRooms = roomStatuses.filter(r => r.status === "available").length;
      const occupiedRooms = roomStatuses.filter(r => r.status === "occupied").length;

      setStats({
        activeGuests: guestsResult.count || 0,
        availableRooms,
        occupiedRooms,
        pendingOrders: ordersResult.count || 0,
        pendingRequests: requestsResult.count || 0,
        openReclamations: reclamationsResult.count || 0,
      });

      // Fetch recent orders for activity feed
      const { data: recentOrders } = await supabase
        .from("orders")
        .select("*, guests(full_name)")
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentActivity(recentOrders || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: t('staff.activeGuests'),
      value: stats?.activeGuests || 0,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: t('staff.availableRooms'),
      value: stats?.availableRooms || 0,
      icon: BedDouble,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: t('staff.occupiedRooms'),
      value: stats?.occupiedRooms || 0,
      icon: BedDouble,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: t('staff.pendingOrders'),
      value: stats?.pendingOrders || 0,
      icon: UtensilsCrossed,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: t('staff.pendingRequests'),
      value: stats?.pendingRequests || 0,
      icon: Wrench,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: t('staff.openComplaints'),
      value: stats?.openReclamations || 0,
      icon: MessageSquareWarning,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">{t('staff.dashboard')}</h1>
        <p className="text-muted-foreground mt-1">{t('staff.welcomeMessage')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array(6)
              .fill(0)
              .map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))
          : statCards.map((stat) => (
              <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t('staff.recentOrders')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t('staff.noRecentActivity')}</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium">
                      Room {order.room_number} - {order.guests?.full_name || "Guest"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-accent">${order.total_price?.toFixed(2)}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "in-progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffDashboard;
