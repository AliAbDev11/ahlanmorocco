import { motion } from "framer-motion";
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShoppingBag,
  Wrench,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { useStaffTasks } from "@/hooks/useStaffTasks";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const StaffDashboard = () => {
  const { staff } = useStaffAuth();
  const { orders, serviceRequests, reclamations, activityLog, loading, metrics } = useStaffTasks(staff?.id || null);
  const navigate = useNavigate();

  const statCards = [
    {
      title: "Pending Tasks",
      value: metrics.pendingTasks,
      icon: ClipboardList,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Completed Today",
      value: metrics.completedToday,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Urgent Items",
      value: metrics.urgentItems,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "Avg Response",
      value: "15m",
      icon: Clock,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  // Combine all pending tasks
  const pendingTasks = [
    ...orders
      .filter((o) => o.status !== "delivered")
      .map((o) => ({
        id: o.id,
        type: "order" as const,
        room: o.room_number,
        status: o.status,
        created: o.created_at,
        priority: "medium",
        description: `${(o.items as any[])?.length || 0} items - $${o.total_price}`,
      })),
    ...serviceRequests
      .filter((s) => s.status !== "completed")
      .map((s) => ({
        id: s.id,
        type: "service" as const,
        room: s.room_number,
        status: s.status,
        created: s.created_at,
        priority: "medium",
        description: s.service_type,
      })),
    ...reclamations
      .filter((r) => r.status !== "resolved")
      .map((r) => ({
        id: r.id,
        type: "reclamation" as const,
        room: r.room_number,
        status: r.status,
        created: r.created_at,
        priority: r.urgency,
        description: r.category,
      })),
  ].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "order":
        return ShoppingBag;
      case "service":
        return Wrench;
      case "reclamation":
        return MessageSquare;
      default:
        return ClipboardList;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      preparing: "default",
      in_progress: "default",
      open: "destructive",
      delivering: "default",
    };
    return (
      <Badge variant={variants[status] || "outline"} className="text-xs capitalize">
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-destructive";
      case "medium":
        return "border-l-accent";
      default:
        return "border-l-muted";
    }
  };

  const getActivityIcon = (actionType: string) => {
    if (actionType.includes("order")) return ShoppingBag;
    if (actionType.includes("service")) return Wrench;
    if (actionType.includes("reclamation")) return MessageSquare;
    return CheckCircle2;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-serif font-semibold">
          Welcome back, {staff?.full_name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">Here's an overview of your tasks for today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={cn("p-3 rounded-lg", stat.bgColor)}>
                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Current Tasks */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">My Current Tasks</CardTitle>
                <CardDescription>Tasks assigned to you</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/staff/tasks")}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : pendingTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No pending tasks. Great job!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingTasks.slice(0, 5).map((task) => {
                    const Icon = getTypeIcon(task.type);
                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          "p-4 rounded-lg border border-l-4 bg-card hover:bg-secondary/50 transition-colors cursor-pointer",
                          getPriorityColor(task.priority)
                        )}
                        onClick={() => {
                          if (task.type === "order") navigate("/staff/orders");
                          else if (task.type === "service") navigate("/staff/services");
                          else navigate("/staff/reclamations");
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-secondary">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium">Room {task.room}</p>
                              {getStatusBadge(task.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 capitalize">
                              {task.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(task.created), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Your last 10 actions</CardDescription>
          </CardHeader>
          <CardContent>
            {activityLog.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent activity
              </p>
            ) : (
              <div className="space-y-4">
                {activityLog.slice(0, 10).map((activity) => {
                  const Icon = getActivityIcon(activity.action_type);
                  return (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="p-1.5 rounded-full bg-secondary mt-0.5">
                        <Icon className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm capitalize">
                          {activity.action_type.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffDashboard;
