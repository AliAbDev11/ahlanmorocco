import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Request {
  id: number;
  category: string;
  description: string;
  urgency: string;
  status: "pending" | "in-progress" | "resolved";
  createdAt: Date;
}

const Requests = () => {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("");
  const [requests, setRequests] = useState<Request[]>([
    {
      id: 1,
      category: "Maintenance",
      description: "Air conditioning not working properly",
      urgency: "high",
      status: "in-progress",
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      id: 2,
      category: "Housekeeping",
      description: "Extra towels and pillows requested",
      urgency: "low",
      status: "resolved",
      createdAt: new Date(Date.now() - 86400000),
    },
  ]);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || !description || !urgency) {
      toast({
        title: "Please fill all fields",
        description: "All fields are required to submit a request.",
        variant: "destructive",
      });
      return;
    }

    const newRequest: Request = {
      id: requests.length + 1,
      category,
      description,
      urgency,
      status: "pending",
      createdAt: new Date(),
    };

    setRequests([newRequest, ...requests]);
    setCategory("");
    setDescription("");
    setUrgency("");

    toast({
      title: "Request Submitted",
      description: "Your request has been received. We'll address it shortly.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case "in-progress":
        return <AlertCircle className="w-4 h-4 text-accent" />;
      case "resolved":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in-progress":
        return "In Progress";
      case "resolved":
        return "Resolved";
      default:
        return status;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "low":
        return "bg-secondary text-muted-foreground";
      case "medium":
        return "bg-accent/20 text-accent";
      case "high":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-secondary text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl lg:text-4xl font-serif text-foreground mb-2">
          Service Requests
        </h1>
        <p className="text-muted-foreground">
          Submit requests or report issues. Our team is here to help.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Submit Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-foreground">
                  New Request
                </h2>
                <p className="text-sm text-muted-foreground">
                  Tell us how we can help
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Housekeeping">Housekeeping</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Room Service">Room Service</SelectItem>
                    <SelectItem value="Concierge">Concierge</SelectItem>
                    <SelectItem value="Billing">Billing</SelectItem>
                    <SelectItem value="Noise Complaint">Noise Complaint</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe your request or issue in detail..."
                  className="min-h-[120px] bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency Level</Label>
                <Select value={urgency} onValueChange={setUrgency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - When convenient</SelectItem>
                    <SelectItem value="medium">Medium - Within a few hours</SelectItem>
                    <SelectItem value="high">High - Urgent attention needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" variant="gold" size="lg" className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Submit Request
              </Button>
            </form>
          </div>
        </motion.div>

        {/* Request History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-medium text-foreground mb-4">
            Your Requests
          </h2>

          {requests.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="bg-card rounded-xl border border-border p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {request.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(
                          request.urgency
                        )}`}
                      >
                        {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {getStatusIcon(request.status)}
                      <span className="text-muted-foreground">
                        {getStatusLabel(request.status)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {request.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Submitted{" "}
                    {request.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Requests;
