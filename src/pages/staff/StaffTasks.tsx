import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Wrench,
  MessageSquare,
  Filter,
  CheckCircle2,
  Clock,
  Play,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { useStaffTasks } from "@/hooks/useStaffTasks";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type TaskType = "all" | "order" | "service" | "reclamation";
type TaskTab = "pending" | "in_progress" | "completed";

interface UnifiedTask {
  id: string;
  type: "order" | "service" | "reclamation";
  room: string;
  status: string;
  created: string;
  priority: string;
  description: string;
  details: any;
}

const StaffTasks = () => {
  const [activeTab, setActiveTab] = useState<TaskTab>("pending");
  const [filterType, setFilterType] = useState<TaskType>("all");
  const { toast } = useToast();
  const { staff } = useStaffAuth();
  const {
    orders,
    serviceRequests,
    reclamations,
    loading,
    updateOrderStatus,
    updateServiceRequestStatus,
    updateReclamationStatus,
  } = useStaffTasks(staff?.id || null);

  // Unify all tasks
  const allTasks: UnifiedTask[] = [
    ...orders.map((o) => ({
      id: o.id,
      type: "order" as const,
      room: o.room_number,
      status: o.status || "pending",
      created: o.created_at,
      priority: "medium",
      description: `${(o.items as any[])?.length || 0} items - $${o.total_price}`,
      details: o,
    })),
    ...serviceRequests.map((s) => ({
      id: s.id,
      type: "service" as const,
      room: s.room_number,
      status: s.status || "pending",
      created: s.created_at,
      priority: "medium",
      description: s.service_type,
      details: s,
    })),
    ...reclamations.map((r) => ({
      id: r.id,
      type: "reclamation" as const,
      room: r.room_number,
      status: r.status || "open",
      created: r.created_at,
      priority: r.urgency || "medium",
      description: r.category,
      details: r,
    })),
  ];

  const filterTasks = (tasks: UnifiedTask[], tab: TaskTab, type: TaskType) => {
    let filtered = tasks;

    // Filter by type
    if (type !== "all") {
      filtered = filtered.filter((t) => t.type === type);
    }

    // Filter by tab/status
    switch (tab) {
      case "pending":
        filtered = filtered.filter((t) =>
          ["pending", "open"].includes(t.status)
        );
        break;
      case "in_progress":
        filtered = filtered.filter((t) =>
          ["in_progress", "preparing", "delivering", "confirmed"].includes(t.status)
        );
        break;
      case "completed":
        const today = new Date().toDateString();
        filtered = filtered.filter((t) => {
          const isCompleted = ["completed", "delivered", "resolved"].includes(t.status);
          const completedDate = t.details.completed_at || t.details.resolved_at;
          return isCompleted && completedDate && new Date(completedDate).toDateString() === today;
        });
        break;
    }

    return filtered.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
  };

  const handleStatusUpdate = async (task: UnifiedTask, newStatus: string) => {
    let result;
    switch (task.type) {
      case "order":
        result = await updateOrderStatus(task.id, newStatus);
        break;
      case "service":
        result = await updateServiceRequestStatus(task.id, newStatus);
        break;
      case "reclamation":
        result = await updateReclamationStatus(task.id, newStatus);
        break;
    }

    if (result?.error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Status updated successfully",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "order":
        return ShoppingBag;
      case "service":
        return Wrench;
      case "reclamation":
        return MessageSquare;
      default:
        return Clock;
    }
  };

  const getStatusActions = (task: UnifiedTask) => {
    switch (task.type) {
      case "order":
        if (task.status === "pending") {
          return [
            { label: "Start Preparing", status: "preparing", icon: Play },
          ];
        }
        if (task.status === "preparing") {
          return [
            { label: "Out for Delivery", status: "delivering", icon: Clock },
          ];
        }
        if (task.status === "delivering") {
          return [
            { label: "Mark Delivered", status: "delivered", icon: CheckCircle2 },
          ];
        }
        break;
      case "service":
        if (task.status === "pending") {
          return [
            { label: "Accept", status: "confirmed", icon: Play },
          ];
        }
        if (task.status === "confirmed") {
          return [
            { label: "Start Work", status: "in_progress", icon: Clock },
          ];
        }
        if (task.status === "in_progress") {
          return [
            { label: "Complete", status: "completed", icon: CheckCircle2 },
          ];
        }
        break;
      case "reclamation":
        if (task.status === "open") {
          return [
            { label: "Start Working", status: "in_progress", icon: Play },
          ];
        }
        if (task.status === "in_progress") {
          return [
            { label: "Resolve", status: "resolved", icon: CheckCircle2 },
          ];
        }
        break;
    }
    return [];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-destructive";
      case "medium":
        return "border-l-accent";
      default:
        return "border-l-green-500";
    }
  };

  const filteredTasks = filterTasks(allTasks, activeTab, filterType);

  const tabCounts = {
    pending: filterTasks(allTasks, "pending", filterType).length,
    in_progress: filterTasks(allTasks, "in_progress", filterType).length,
    completed: filterTasks(allTasks, "completed", filterType).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold">My Tasks</h1>
          <p className="text-muted-foreground">Manage all your assigned tasks</p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filterType} onValueChange={(v) => setFilterType(v as TaskType)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="order">Orders</SelectItem>
              <SelectItem value="service">Services</SelectItem>
              <SelectItem value="reclamation">Reclamations</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TaskTab)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="gap-2">
            Pending
            {tabCounts.pending > 0 && (
              <Badge variant="secondary" className="ml-1">
                {tabCounts.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="gap-2">
            In Progress
            {tabCounts.in_progress > 0 && (
              <Badge variant="secondary" className="ml-1">
                {tabCounts.in_progress}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            Completed Today
            {tabCounts.completed > 0 && (
              <Badge variant="secondary" className="ml-1">
                {tabCounts.completed}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No tasks in this category</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredTasks.map((task, index) => {
                const Icon = getTypeIcon(task.type);
                const actions = getStatusActions(task);

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={cn("border-l-4", getPriorityColor(task.priority))}>
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-2 rounded-lg bg-secondary">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium">Room {task.room}</span>
                                <Badge variant="outline" className="capitalize text-xs">
                                  {task.type}
                                </Badge>
                                <Badge
                                  variant={
                                    task.status === "pending" || task.status === "open"
                                      ? "secondary"
                                      : task.status.includes("progress") || task.status === "preparing"
                                      ? "default"
                                      : "outline"
                                  }
                                  className="capitalize text-xs"
                                >
                                  {task.status.replace("_", " ")}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 capitalize">
                                {task.description}
                              </p>
                              {task.details.special_requests && (
                                <p className="text-xs text-muted-foreground mt-1 italic">
                                  Note: {task.details.special_requests}
                                </p>
                              )}
                              {task.details.description && task.type !== "service" && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {task.details.description}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                {formatDistanceToNow(new Date(task.created), { addSuffix: true })}
                              </p>
                            </div>
                          </div>

                          {actions.length > 0 && (
                            <div className="flex gap-2 sm:flex-col">
                              {actions.map((action) => (
                                <Button
                                  key={action.status}
                                  size="sm"
                                  variant={action.status.includes("complete") || action.status.includes("deliver") || action.status.includes("resolve") ? "default" : "outline"}
                                  onClick={() => handleStatusUpdate(task, action.status)}
                                  className="gap-2"
                                >
                                  <action.icon className="w-4 h-4" />
                                  <span className="hidden sm:inline">{action.label}</span>
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffTasks;
