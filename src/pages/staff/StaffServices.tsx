import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wrench,
  Filter,
  Search,
  Clock,
  CheckCircle2,
  Play,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { formatDistanceToNow, format } from "date-fns";

const serviceTypeLabels: Record<string, string> = {
  housekeeping: "Housekeeping",
  spa: "Spa & Wellness",
  laundry: "Laundry",
  transportation: "Transportation",
  fitness: "Fitness Center",
  concierge: "Concierge",
  room_service: "Room Service",
};

const StaffServices = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchRoom, setSearchRoom] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const { toast } = useToast();
  const { staff } = useStaffAuth();
  const { serviceRequests, loading, updateServiceRequestStatus } = useStaffTasks(staff?.id || null);

  const filteredRequests = serviceRequests.filter((request) => {
    if (statusFilter !== "all" && request.status !== statusFilter) return false;
    if (typeFilter !== "all" && request.service_type !== typeFilter) return false;
    if (searchRoom && !request.room_number.includes(searchRoom)) return false;
    return true;
  });

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    const result = await updateServiceRequestStatus(requestId, newStatus);
    if (result?.error) {
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Request marked as ${newStatus}`,
      });
      setSelectedRequest(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
      pending: { variant: "secondary", icon: Clock },
      confirmed: { variant: "default", icon: CheckCircle2 },
      in_progress: { variant: "default", icon: Play },
      completed: { variant: "outline", icon: CheckCircle2 },
    };
    const { variant, icon: Icon } = config[status] || { variant: "outline", icon: Clock };
    return (
      <Badge variant={variant} className="gap-1 capitalize">
        <Icon className="w-3 h-3" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getStatusActions = (status: string) => {
    switch (status) {
      case "pending":
        return [{ label: "Accept", status: "confirmed" }];
      case "confirmed":
        return [{ label: "Start Work", status: "in_progress" }];
      case "in_progress":
        return [{ label: "Complete", status: "completed" }];
      default:
        return [];
    }
  };

  const serviceTypes = [...new Set(serviceRequests.map((r) => r.service_type))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold">Service Requests</h1>
          <p className="text-muted-foreground">Manage guest service requests</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search room..."
              value={searchRoom}
              onChange={(e) => setSearchRoom(e.target.value)}
              className="pl-9 w-[120px]"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {serviceTypes.map((type) => (
                <SelectItem key={type} value={type} className="capitalize">
                  {serviceTypeLabels[type] || type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
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
      ) : filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Wrench className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No service requests found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map((request, index) => {
            const actions = getStatusActions(request.status || "pending");

            return (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Wrench className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">Room {request.room_number}</span>
                            <Badge variant="outline" className="capitalize">
                              {serviceTypeLabels[request.service_type] || request.service_type}
                            </Badge>
                            {getStatusBadge(request.status || "pending")}
                          </div>
                          {request.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {request.description}
                            </p>
                          )}
                          {request.requested_time && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Requested for: {request.requested_time}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Submitted {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                        {actions.map((action) => (
                          <Button
                            key={action.status}
                            size="sm"
                            onClick={() => handleStatusUpdate(request.id, action.status)}
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

      {/* Request Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Service Request - Room {selectedRequest?.room_number}
            </DialogTitle>
            <DialogDescription>
              Submitted {selectedRequest && format(new Date(selectedRequest.created_at), "PPp")}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Service Type</h4>
                <Badge variant="outline" className="capitalize">
                  {serviceTypeLabels[selectedRequest.service_type] || selectedRequest.service_type}
                </Badge>
              </div>

              {selectedRequest.description && (
                <div>
                  <h4 className="font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedRequest.description}</p>
                </div>
              )}

              {selectedRequest.requested_time && (
                <div>
                  <h4 className="font-medium mb-1">Requested Time</h4>
                  <p className="text-sm text-muted-foreground">{selectedRequest.requested_time}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-border">
                <div>
                  <h4 className="font-medium mb-1">Status</h4>
                  {getStatusBadge(selectedRequest.status || "pending")}
                </div>
                <div className="flex gap-2">
                  {getStatusActions(selectedRequest.status || "pending").map((action) => (
                    <Button
                      key={action.status}
                      size="sm"
                      onClick={() => handleStatusUpdate(selectedRequest.id, action.status)}
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

export default StaffServices;
