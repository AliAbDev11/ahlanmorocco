import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
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
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";

const StaffReclamations = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [searchRoom, setSearchRoom] = useState("");
  const [selectedReclamation, setSelectedReclamation] = useState<any>(null);
  const { toast } = useToast();
  const { staff } = useStaffAuth();
  const { reclamations, loading, updateReclamationStatus } = useStaffTasks(staff?.id || null);

  const filteredReclamations = reclamations.filter((reclamation) => {
    if (statusFilter !== "all" && reclamation.status !== statusFilter) return false;
    if (urgencyFilter !== "all" && reclamation.urgency !== urgencyFilter) return false;
    if (searchRoom && !reclamation.room_number.includes(searchRoom)) return false;
    return true;
  });

  const handleStatusUpdate = async (reclamationId: string, newStatus: string) => {
    const result = await updateReclamationStatus(reclamationId, newStatus);
    if (result?.error) {
      toast({
        title: "Error",
        description: "Failed to update reclamation status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Reclamation marked as ${newStatus}`,
      });
      setSelectedReclamation(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
      open: { variant: "destructive", icon: AlertTriangle },
      in_progress: { variant: "default", icon: Play },
      resolved: { variant: "outline", icon: CheckCircle2 },
    };
    const { variant, icon: Icon } = config[status] || { variant: "outline", icon: Clock };
    return (
      <Badge variant={variant} className="gap-1 capitalize">
        <Icon className="w-3 h-3" />
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const colors: Record<string, string> = {
      high: "bg-destructive/10 text-destructive border-destructive/30",
      medium: "bg-accent/10 text-accent border-accent/30",
      low: "bg-green-100 text-green-700 border-green-300",
    };
    return (
      <Badge variant="outline" className={cn("capitalize", colors[urgency] || "")}>
        {urgency} Priority
      </Badge>
    );
  };

  const getStatusActions = (status: string) => {
    switch (status) {
      case "open":
        return [{ label: "Start Working", status: "in_progress" }];
      case "in_progress":
        return [{ label: "Resolve", status: "resolved" }];
      default:
        return [];
    }
  };

  const getUrgencyBorderColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "border-l-destructive";
      case "medium":
        return "border-l-accent";
      default:
        return "border-l-green-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold">Reclamations</h1>
          <p className="text-muted-foreground">Handle guest complaints and issues</p>
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
          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Urgency</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
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
      ) : filteredReclamations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No reclamations found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredReclamations.map((reclamation, index) => {
            const actions = getStatusActions(reclamation.status || "open");

            return (
              <motion.div
                key={reclamation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn("border-l-4", getUrgencyBorderColor(reclamation.urgency || "medium"))}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-destructive/10">
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">Room {reclamation.room_number}</span>
                            <Badge variant="outline" className="capitalize">
                              {reclamation.category}
                            </Badge>
                            {getStatusBadge(reclamation.status || "open")}
                            {getUrgencyBadge(reclamation.urgency || "medium")}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {reclamation.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Reported {formatDistanceToNow(new Date(reclamation.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedReclamation(reclamation)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                        {actions.map((action) => (
                          <Button
                            key={action.status}
                            size="sm"
                            variant={action.status === "resolved" ? "default" : "outline"}
                            onClick={() => handleStatusUpdate(reclamation.id, action.status)}
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

      {/* Reclamation Detail Dialog */}
      <Dialog open={!!selectedReclamation} onOpenChange={() => setSelectedReclamation(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Reclamation - Room {selectedReclamation?.room_number}
            </DialogTitle>
            <DialogDescription>
              Reported {selectedReclamation && format(new Date(selectedReclamation.created_at), "PPp")}
            </DialogDescription>
          </DialogHeader>

          {selectedReclamation && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge variant="outline" className="capitalize">
                  {selectedReclamation.category}
                </Badge>
                {getUrgencyBadge(selectedReclamation.urgency || "medium")}
              </div>

              <div>
                <h4 className="font-medium mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedReclamation.description}</p>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border">
                <div>
                  <h4 className="font-medium mb-1">Status</h4>
                  {getStatusBadge(selectedReclamation.status || "open")}
                </div>
                <div className="flex gap-2">
                  {getStatusActions(selectedReclamation.status || "open").map((action) => (
                    <Button
                      key={action.status}
                      size="sm"
                      variant={action.status === "resolved" ? "default" : "outline"}
                      onClick={() => handleStatusUpdate(selectedReclamation.id, action.status)}
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

export default StaffReclamations;
