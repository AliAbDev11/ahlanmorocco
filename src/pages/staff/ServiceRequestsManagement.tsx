import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Wrench, Search, Clock, User, Loader2, CheckCircle, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { notifyServiceRequestStatusChange } from "@/lib/notificationTriggers";

interface ServiceRequest {
  id: string;
  room_number: string;
  service_type: string;
  description: string | null;
  requested_time: string | null;
  status: string;
  created_at: string;
  guest_id: string | null;
  guests?: { full_name: string } | null;
}

const ServiceRequestsManagement = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
    const channel = supabase
      .channel("service-requests-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "service_requests" },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*, guests(full_name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Error",
        description: "Failed to load service requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    setUpdating(true);
    try {
      const updateData: any = { status };
      if (status === "completed") {
        updateData.completed_at = new Date().toISOString();
      }

      const request = requests.find(r => r.id === requestId);

      await supabase.from("service_requests").update(updateData).eq("id", requestId);

      // Send notification to guest
      if (request?.guest_id) {
        await notifyServiceRequestStatusChange(requestId, request.guest_id, status, request.service_type);
      }

      toast({
        title: "Success",
        description: `Request status updated to ${status}`,
      });
      fetchRequests();
      setDetailsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update request status",
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

  const getServiceIcon = (type: string) => {
    return <Wrench className="h-5 w-5" />;
  };

  const uniqueTypes = [...new Set(requests.map((r) => r.service_type))];

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.guests?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.service_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesType = typeFilter === "all" || request.service_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const inProgressCount = requests.filter((r) => r.status === "in-progress").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Service Requests</h1>
          <p className="text-muted-foreground mt-1">Manage guest service requests</p>
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
            placeholder="Search requests..."
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
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Service Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {uniqueTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="space-y-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
            ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No service requests found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card
              key={request.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedRequest(request);
                setDetailsOpen(true);
              }}
            >
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {getServiceIcon(request.service_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium capitalize">{request.service_type}</span>
                        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(request.status))}>
                          {request.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <User className="h-4 w-4" />
                        Room {request.room_number}
                        {request.guests?.full_name && ` - ${request.guests.full_name}`}
                      </div>
                      {request.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{request.description}</p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3" />
                        {new Date(request.created_at).toLocaleString()}
                        {request.requested_time && ` • Requested: ${request.requested_time}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {request.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateRequestStatus(request.id, "in-progress");
                        }}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                    )}
                    {request.status === "in-progress" && (
                      <Button
                        size="sm"
                        variant="gold"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateRequestStatus(request.id, "completed");
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
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

      {/* Request Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="capitalize">{selectedRequest?.service_type} Request</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Room {selectedRequest.room_number}</p>
                  {selectedRequest.guests?.full_name && (
                    <p className="text-sm text-muted-foreground">{selectedRequest.guests.full_name}</p>
                  )}
                </div>
                <span className={cn("px-3 py-1 rounded-full text-sm font-medium", getStatusColor(selectedRequest.status))}>
                  {selectedRequest.status}
                </span>
              </div>

              {selectedRequest.description && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Description:</p>
                  <p className="text-sm">{selectedRequest.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Created:</p>
                  <p>{new Date(selectedRequest.created_at).toLocaleString()}</p>
                </div>
                {selectedRequest.requested_time && (
                  <div>
                    <p className="text-muted-foreground">Requested Time:</p>
                    <p>{selectedRequest.requested_time}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            {selectedRequest?.status === "pending" && (
              <Button onClick={() => updateRequestStatus(selectedRequest.id, "in-progress")} disabled={updating}>
                {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                Accept Request
              </Button>
            )}
            {selectedRequest?.status === "in-progress" && (
              <Button variant="gold" onClick={() => updateRequestStatus(selectedRequest.id, "completed")} disabled={updating}>
                {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Mark Completed
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceRequestsManagement;
