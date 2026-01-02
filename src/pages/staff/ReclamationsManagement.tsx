import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  MessageSquareWarning,
  Search,
  Clock,
  User,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ArrowUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Reclamation {
  id: string;
  room_number: string;
  category: string;
  description: string;
  urgency: string | null;
  status: string;
  created_at: string;
  resolved_at: string | null;
  guests?: { full_name: string } | null;
}

const ReclamationsManagement = () => {
  const [reclamations, setReclamations] = useState<Reclamation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [selectedReclamation, setSelectedReclamation] = useState<Reclamation | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchReclamations();
    const channel = supabase
      .channel("reclamations-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reclamations" },
        () => {
          fetchReclamations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReclamations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reclamations")
        .select("*, guests(full_name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReclamations(data || []);
    } catch (error) {
      console.error("Error fetching reclamations:", error);
      toast({
        title: "Error",
        description: "Failed to load complaints",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReclamationStatus = async (reclamationId: string, status: string) => {
    setUpdating(true);
    try {
      const updateData: any = { status };
      if (status === "resolved") {
        updateData.resolved_at = new Date().toISOString();
      }

      await supabase.from("reclamations").update(updateData).eq("id", reclamationId);

      toast({
        title: "Success",
        description: `Complaint status updated to ${status}`,
      });
      fetchReclamations();
      setDetailsOpen(false);
      setResolveDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update complaint status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUrgencyColor = (urgency: string | null) => {
    switch (urgency) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const filteredReclamations = reclamations.filter((reclamation) => {
    const matchesSearch =
      reclamation.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reclamation.guests?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reclamation.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reclamation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || reclamation.status === statusFilter;
    const matchesUrgency = urgencyFilter === "all" || reclamation.urgency === urgencyFilter;
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const openCount = reclamations.filter((r) => r.status === "open").length;
  const inProgressCount = reclamations.filter((r) => r.status === "in-progress").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Reclamations</h1>
          <p className="text-muted-foreground mt-1">Manage guest complaints and feedback</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            {openCount} Open
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
            placeholder="Search complaints..."
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
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Urgency</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reclamations List */}
      {loading ? (
        <div className="space-y-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-28 bg-muted rounded-lg animate-pulse" />
            ))}
        </div>
      ) : filteredReclamations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquareWarning className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No complaints found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredReclamations.map((reclamation) => (
            <Card
              key={reclamation.id}
              className={cn(
                "hover:shadow-md transition-shadow cursor-pointer",
                reclamation.urgency === "high" && reclamation.status !== "resolved"
                  ? "border-l-4 border-l-red-500"
                  : ""
              )}
              onClick={() => {
                setSelectedReclamation(reclamation);
                setDetailsOpen(true);
              }}
            >
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        reclamation.urgency === "high"
                          ? "bg-red-100 text-red-600"
                          : "bg-orange-100 text-orange-600"
                      )}
                    >
                      <MessageSquareWarning className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium capitalize">{reclamation.category}</span>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-xs font-medium",
                            getStatusColor(reclamation.status)
                          )}
                        >
                          {reclamation.status}
                        </span>
                        {reclamation.urgency && (
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-medium",
                              getUrgencyColor(reclamation.urgency)
                            )}
                          >
                            {reclamation.urgency}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <User className="h-4 w-4" />
                        Room {reclamation.room_number}
                        {reclamation.guests?.full_name && ` - ${reclamation.guests.full_name}`}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {reclamation.description}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3" />
                        {new Date(reclamation.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {reclamation.status === "open" && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateReclamationStatus(reclamation.id, "in-progress");
                        }}
                      >
                        Respond
                      </Button>
                    )}
                    {reclamation.status === "in-progress" && (
                      <Button
                        size="sm"
                        variant="gold"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReclamation(reclamation);
                          setResolveDialogOpen(true);
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="capitalize">{selectedReclamation?.category} Complaint</DialogTitle>
          </DialogHeader>
          {selectedReclamation && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Room {selectedReclamation.room_number}</p>
                  {selectedReclamation.guests?.full_name && (
                    <p className="text-sm text-muted-foreground">
                      {selectedReclamation.guests.full_name}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium",
                      getStatusColor(selectedReclamation.status)
                    )}
                  >
                    {selectedReclamation.status}
                  </span>
                  {selectedReclamation.urgency && (
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium",
                        getUrgencyColor(selectedReclamation.urgency)
                      )}
                    >
                      {selectedReclamation.urgency}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Description:</p>
                <p className="text-sm">{selectedReclamation.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Submitted:</p>
                  <p>{new Date(selectedReclamation.created_at).toLocaleString()}</p>
                </div>
                {selectedReclamation.resolved_at && (
                  <div>
                    <p className="text-muted-foreground">Resolved:</p>
                    <p>{new Date(selectedReclamation.resolved_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            {selectedReclamation?.status === "open" && (
              <>
                <Button
                  onClick={() => updateReclamationStatus(selectedReclamation.id, "in-progress")}
                  disabled={updating}
                >
                  {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Start Responding
                </Button>
              </>
            )}
            {selectedReclamation?.status === "in-progress" && (
              <Button
                variant="gold"
                onClick={() => {
                  setResolveDialogOpen(true);
                  setDetailsOpen(false);
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolve
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Confirmation Dialog */}
      <AlertDialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resolve Complaint</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this complaint as resolved? This will notify the guest
              that their issue has been addressed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedReclamation && updateReclamationStatus(selectedReclamation.id, "resolved")
              }
              disabled={updating}
            >
              {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Resolution
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReclamationsManagement;
