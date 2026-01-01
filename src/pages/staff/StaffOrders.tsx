import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Filter,
  Search,
  Clock,
  CheckCircle2,
  Play,
  Truck,
  Eye,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useStaffAuth } from "@/hooks/useStaffAuth";
import { useStaffTasks } from "@/hooks/useStaffTasks";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";

const StaffOrders = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchRoom, setSearchRoom] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { toast } = useToast();
  const { staff } = useStaffAuth();
  const { orders, loading, updateOrderStatus } = useStaffTasks(staff?.id || null);

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    if (searchRoom && !order.room_number.includes(searchRoom)) return false;
    return true;
  });

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    const result = await updateOrderStatus(orderId, newStatus);
    if (result?.error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Order marked as ${newStatus}`,
      });
      setSelectedOrder(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
      pending: { variant: "secondary", icon: Clock },
      preparing: { variant: "default", icon: Play },
      delivering: { variant: "default", icon: Truck },
      delivered: { variant: "outline", icon: CheckCircle2 },
    };
    const { variant, icon: Icon } = config[status] || { variant: "outline", icon: Clock };
    return (
      <Badge variant={variant} className="gap-1 capitalize">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  const getStatusActions = (status: string) => {
    switch (status) {
      case "pending":
        return [{ label: "Start Preparing", status: "preparing" }];
      case "preparing":
        return [{ label: "Out for Delivery", status: "delivering" }];
      case "delivering":
        return [{ label: "Mark Delivered", status: "delivered" }];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold">Orders</h1>
          <p className="text-muted-foreground">Manage food and beverage orders</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search room..."
              value={searchRoom}
              onChange={(e) => setSearchRoom(e.target.value)}
              className="pl-9 w-[140px]"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="delivering">Delivering</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order, index) => {
            const actions = getStatusActions(order.status || "pending");
            const items = order.items as any[];

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-accent/10">
                          <ShoppingBag className="w-5 h-5 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">Room {order.room_number}</span>
                            {getStatusBadge(order.status || "pending")}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {items?.length || 0} items • ${order.total_price}
                          </p>
                          {order.delivery_time && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Delivery: {order.delivery_time}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Ordered {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                        {actions.map((action) => (
                          <Button
                            key={action.status}
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, action.status)}
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Order Details - Room {selectedOrder?.room_number}
            </DialogTitle>
            <DialogDescription>
              Ordered {selectedOrder && format(new Date(selectedOrder.created_at), "PPp")}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Items</h4>
                <div className="space-y-2">
                  {(selectedOrder.items as any[])?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="text-muted-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between font-medium pt-2 border-t border-border">
                <span>Total</span>
                <span>${selectedOrder.total_price}</span>
              </div>

              {selectedOrder.special_requests && (
                <div>
                  <h4 className="font-medium mb-1">Special Requests</h4>
                  <p className="text-sm text-muted-foreground">{selectedOrder.special_requests}</p>
                </div>
              )}

              {selectedOrder.delivery_time && (
                <div>
                  <h4 className="font-medium mb-1">Delivery Time</h4>
                  <p className="text-sm text-muted-foreground">{selectedOrder.delivery_time}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <div>
                  <h4 className="font-medium mb-1">Status</h4>
                  {getStatusBadge(selectedOrder.status || "pending")}
                </div>
                <div className="flex gap-2">
                  {getStatusActions(selectedOrder.status || "pending").map((action) => (
                    <Button
                      key={action.status}
                      size="sm"
                      onClick={() => handleStatusUpdate(selectedOrder.id, action.status)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffOrders;
