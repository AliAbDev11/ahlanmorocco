import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus, Search, QrCode, User, Phone, Calendar, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QRCode from "react-qr-code";

interface Guest {
  id: string;
  full_name: string;
  room_number: string;
  phone_number: string | null;
  check_in_date: string;
  check_out_date: string;
  is_active: boolean;
  qr_code: string | null;
}

interface Room {
  id: string;
  room_number: string;
  room_type: string;
  status: string;
}

const GuestManagement = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "checked-out">("active");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [generatedQR, setGeneratedQR] = useState<{ url: string; guestName: string } | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    room_id: "",
    phone_number: "",
    check_in_date: "",
    check_out_date: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchGuests();
    fetchRooms();
  }, [filter]);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      let query = supabase.from("guests").select("*").order("created_at", { ascending: false });

      if (filter === "active") {
        query = query.eq("is_active", true);
      } else if (filter === "checked-out") {
        query = query.eq("is_active", false);
      }

      const { data, error } = await query;
      if (error) throw error;
      setGuests(data || []);
    } catch (error) {
      console.error("Error fetching guests:", error);
      toast({
        title: "Error",
        description: "Failed to load guests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("id, room_number, room_type, status")
        .eq("status", "available")
        .order("room_number");
      
      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const generateToken = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const selectedRoom = rooms.find(r => r.id === formData.room_id);
      if (!selectedRoom) {
        toast({
          title: "Error",
          description: "Please select a room",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // Generate unique token for QR code
      const token = generateToken();
      const guestId = crypto.randomUUID();

      // Generate the full guest access URL
      const appBaseUrl = window.location.origin;
      const guestAccessUrl = `${appBaseUrl}/guest-access?token=${token}`;

      // Create guest
      const { error: guestError } = await supabase.from("guests").insert({
        id: guestId,
        full_name: formData.full_name,
        room_number: selectedRoom.room_number,
        room_id: selectedRoom.id,
        phone_number: formData.phone_number || null,
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
        qr_code: token,
        is_active: true,
      });

      if (guestError) throw guestError;

      // Create access token with full URL
      const expiresAt = new Date(formData.check_out_date);
      expiresAt.setHours(23, 59, 59, 999);

      const { error: tokenError } = await supabase.from("guest_access_tokens").insert({
        guest_id: guestId,
        token: token,
        qr_code_data: guestAccessUrl,
        expires_at: expiresAt.toISOString(),
        is_active: true,
      });

      if (tokenError) throw tokenError;

      // Update room status
      await supabase.from("rooms").update({ status: "occupied" }).eq("id", selectedRoom.id);

      toast({
        title: "Success",
        description: "Guest added successfully",
      });

      // Show QR code dialog with full URL
      setGeneratedQR({ url: guestAccessUrl, guestName: formData.full_name });
      setQrDialogOpen(true);
      setIsAddDialogOpen(false);
      
      // Reset form
      setFormData({
        full_name: "",
        room_id: "",
        phone_number: "",
        check_in_date: "",
        check_out_date: "",
      });

      fetchGuests();
      fetchRooms();
    } catch (error: any) {
      console.error("Error adding guest:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add guest",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async (guest: Guest) => {
    try {
      // Update guest status
      await supabase.from("guests").update({ is_active: false }).eq("id", guest.id);

      // Deactivate access token
      await supabase
        .from("guest_access_tokens")
        .update({ is_active: false })
        .eq("guest_id", guest.id);

      // Update room status to available
      const { data: guestData } = await supabase
        .from("guests")
        .select("room_id")
        .eq("id", guest.id)
        .single();

      if (guestData?.room_id) {
        await supabase.from("rooms").update({ status: "cleaning" }).eq("id", guestData.room_id);
      }

      toast({
        title: "Success",
        description: `${guest.full_name} has been checked out`,
      });

      fetchGuests();
      fetchRooms();
    } catch (error) {
      console.error("Error checking out guest:", error);
      toast({
        title: "Error",
        description: "Failed to check out guest",
        variant: "destructive",
      });
    }
  };

  const filteredGuests = guests.filter(
    (guest) =>
      guest.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.room_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Guest Management</h1>
          <p className="text-muted-foreground mt-1">Manage hotel guests and check-ins</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Guest
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Guest</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddGuest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="full_name"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="room">Room *</Label>
                <Select
                  value={formData.room_id}
                  onValueChange={(value) => setFormData({ ...formData, room_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        Room {room.room_number} - {room.room_type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="check_in">Check-in Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="check_in"
                      type="date"
                      value={formData.check_in_date}
                      onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="check_out">Check-out Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="check_out"
                      type="date"
                      value={formData.check_out_date}
                      onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Add Guest & Generate QR"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* QR Code Display Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Guest QR Code</DialogTitle>
          </DialogHeader>
          {generatedQR && (
            <div className="flex flex-col items-center space-y-4 p-4">
              <p className="text-lg font-medium">{generatedQR.guestName}</p>
              <div className="bg-white p-4 rounded-lg">
                <QRCode value={generatedQR.url} size={200} />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Guest can scan this QR code to access hotel services
              </p>
              <Button onClick={() => window.print()} variant="outline" className="gap-2">
                <QrCode className="h-4 w-4" />
                Print QR Code
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="checked-out">Checked Out</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Guest List */}
      {loading ? (
        <div className="grid gap-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/4" />
                      <div className="h-3 bg-muted rounded w-1/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : filteredGuests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No guests found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredGuests.map((guest) => (
            <Card key={guest.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{guest.full_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Room {guest.room_number}
                        {guest.phone_number && ` • ${guest.phone_number}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(guest.check_in_date).toLocaleDateString()} -{" "}
                        {new Date(guest.check_out_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        guest.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {guest.is_active ? "Active" : "Checked Out"}
                    </span>
                    {guest.qr_code && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const appBaseUrl = window.location.origin;
                          const guestAccessUrl = `${appBaseUrl}/guest-access?token=${guest.qr_code}`;
                          setGeneratedQR({ url: guestAccessUrl, guestName: guest.full_name });
                          setQrDialogOpen(true);
                        }}
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                    )}
                    {guest.is_active && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCheckOut(guest)}
                      >
                        Check Out
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuestManagement;
