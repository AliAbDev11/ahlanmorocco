import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BedDouble, Search, User, Wrench, Sparkles, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface Room {
  id: string;
  room_number: string;
  room_type: string;
  status: string;
  floor: number | null;
  price_per_night: number;
  capacity: number | null;
  amenities: any;
  description: string | null;
}

interface Guest {
  id: string;
  full_name: string;
  room_number: string;
  check_in_date: string;
  check_out_date: string;
}

const RoomManagement = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [floorFilter, setFloorFilter] = useState<string>("all");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomGuest, setRoomGuest] = useState<Guest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("room_number");

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast({
        title: "Error",
        description: "Failed to load rooms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomGuest = async (roomNumber: string) => {
    try {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .eq("room_number", roomNumber)
        .eq("is_active", true)
        .single();

      if (!error && data) {
        setRoomGuest(data);
      } else {
        setRoomGuest(null);
      }
    } catch (error) {
      setRoomGuest(null);
    }
  };

  const handleRoomClick = async (room: Room) => {
    setSelectedRoom(room);
    if (room.status === "occupied") {
      await fetchRoomGuest(room.room_number);
    } else {
      setRoomGuest(null);
    }
    setDetailsOpen(true);
  };

  const updateRoomStatus = async (roomId: string, status: string) => {
    try {
      await supabase.from("rooms").update({ status }).eq("id", roomId);
      toast({
        title: "Success",
        description: `Room status updated to ${status}`,
      });
      fetchRooms();
      setDetailsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update room status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "occupied":
        return "bg-blue-500";
      case "maintenance":
        return "bg-red-500";
      case "cleaning":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "available":
        return "border-green-200 bg-green-50 hover:border-green-400";
      case "occupied":
        return "border-blue-200 bg-blue-50 hover:border-blue-400";
      case "maintenance":
        return "border-red-200 bg-red-50 hover:border-red-400";
      case "cleaning":
        return "border-yellow-200 bg-yellow-50 hover:border-yellow-400";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const uniqueFloors = [...new Set(rooms.map((r) => r.floor).filter((f) => f !== null))].sort();
  const uniqueTypes = [...new Set(rooms.map((r) => r.room_type))];

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.room_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || room.status === statusFilter;
    const matchesType = typeFilter === "all" || room.room_type === typeFilter;
    const matchesFloor = floorFilter === "all" || room.floor?.toString() === floorFilter;
    return matchesSearch && matchesStatus && matchesType && matchesFloor;
  });

  const statusCounts = {
    available: rooms.filter((r) => r.status === "available").length,
    occupied: rooms.filter((r) => r.status === "occupied").length,
    maintenance: rooms.filter((r) => r.status === "maintenance").length,
    cleaning: rooms.filter((r) => r.status === "cleaning").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Room Management</h1>
        <p className="text-muted-foreground mt-1">View and manage hotel rooms</p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-2xl font-bold text-green-700">{statusCounts.available}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Occupied</p>
              <p className="text-2xl font-bold text-blue-700">{statusCounts.occupied}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Maintenance</p>
              <p className="text-2xl font-bold text-red-700">{statusCounts.maintenance}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">Cleaning</p>
              <p className="text-2xl font-bold text-yellow-700">{statusCounts.cleaning}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
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
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="cleaning">Cleaning</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
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
        <Select value={floorFilter} onValueChange={setFloorFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Floor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Floors</SelectItem>
            {uniqueFloors.map((floor) => (
              <SelectItem key={floor} value={floor!.toString()}>
                Floor {floor}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Room Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array(12)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
            ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BedDouble className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No rooms found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredRooms.map((room) => (
            <Card
              key={room.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md border-2",
                getStatusBgColor(room.status)
              )}
              onClick={() => handleRoomClick(room)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg">{room.room_number}</span>
                  <div className={cn("w-3 h-3 rounded-full", getStatusColor(room.status))} />
                </div>
                <p className="text-sm text-muted-foreground capitalize">{room.room_type}</p>
                <p className="text-xs text-muted-foreground mt-1">Floor {room.floor || "-"}</p>
                <p className="text-sm font-semibold mt-2 text-accent">${room.price_per_night}/night</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Room Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Room {selectedRoom?.room_number}</DialogTitle>
          </DialogHeader>
          {selectedRoom && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <BedDouble className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{selectedRoom.room_type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>${selectedRoom.price_per_night}/night</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-full", getStatusColor(selectedRoom.status))} />
                <span className="capitalize font-medium">{selectedRoom.status}</span>
              </div>

              {selectedRoom.description && (
                <p className="text-sm text-muted-foreground">{selectedRoom.description}</p>
              )}

              {roomGuest && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{roomGuest.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(roomGuest.check_in_date).toLocaleDateString()} -{" "}
                          {new Date(roomGuest.check_out_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-wrap gap-2">
                {selectedRoom.status !== "available" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateRoomStatus(selectedRoom.id, "available")}
                    className="gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Mark Available
                  </Button>
                )}
                {selectedRoom.status !== "maintenance" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateRoomStatus(selectedRoom.id, "maintenance")}
                    className="gap-2"
                  >
                    <Wrench className="h-4 w-4" />
                    Maintenance
                  </Button>
                )}
                {selectedRoom.status !== "cleaning" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateRoomStatus(selectedRoom.id, "cleaning")}
                    className="gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Cleaning
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomManagement;
