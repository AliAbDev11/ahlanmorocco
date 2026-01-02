import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UtensilsCrossed, Search, Clock, DollarSign, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  room_number: string;
  items: OrderItem[];
  total_price: number;
  status: string;
  special_requests: string | null;
  delivery_time: string | null;
  created_at: string;
  guests?: { full_name: string } | null;
}

const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    // Set up real-time subscription
    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, guests(full_name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Type assertion for items JSON
      const typedOrders = (data || []).map(order => ({
        ...order,
        items: (order.items as unknown as OrderItem[]) || []
      }));
      
      setOrders(typedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdating(true);
    try {
      const updateData: any = { status };
      if (status === "completed") {
        updateData.completed_at = new Date().toISOString();
      }

      await supabase.from("orders").update(updateData).eq("id", orderId);

      toast({
        title: "Success",
        description: `Order status updated to ${status}`,
      });
      fetchOrders();
      setDetailsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.guests?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const inProgressCount = orders.filter((o) => o.status === "in-progress").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage food and service orders</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            {pendingCount} Pending
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {inProgressCount} In Progress
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by room or guest..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
            ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <UtensilsCrossed className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedOrder(order);
                setDetailsOpen(true);
              }}
            >
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        Room {order.room_number}
                        {order.guests?.full_name && ` - ${order.guests.full_name}`}
                      </span>
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(order.status))}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(order.created_at).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <UtensilsCrossed className="h-4 w-4" />
                        {order.items.length} items
                      </div>
                      {order.delivery_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Deliver by: {order.delivery_time}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-accent">${order.total_price.toFixed(2)}</p>
                    </div>
                    {order.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateOrderStatus(order.id, "in-progress");
                        }}
                      >
                        Start
                      </Button>
                    )}
                    {order.status === "in-progress" && (
                      <Button
                        size="sm"
                        variant="gold"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateOrderStatus(order.id, "completed");
                        }}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Room {selectedOrder.room_number}</p>
                  {selectedOrder.guests?.full_name && (
                    <p className="text-sm text-muted-foreground">{selectedOrder.guests.full_name}</p>
                  )}
                </div>
                <span className={cn("px-3 py-1 rounded-full text-sm font-medium", getStatusColor(selectedOrder.status))}>
                  {selectedOrder.status}
                </span>
              </div>

              <div className="border rounded-lg divide-y">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {selectedOrder.special_requests && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Special Requests:</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.special_requests}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-accent">${selectedOrder.total_price.toFixed(2)}</span>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            {selectedOrder?.status === "pending" && (
              <Button onClick={() => updateOrderStatus(selectedOrder.id, "in-progress")} disabled={updating}>
                {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Mark In Progress
              </Button>
            )}
            {selectedOrder?.status === "in-progress" && (
              <Button variant="gold" onClick={() => updateOrderStatus(selectedOrder.id, "completed")} disabled={updating}>
                {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Mark Completed
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersManagement;
