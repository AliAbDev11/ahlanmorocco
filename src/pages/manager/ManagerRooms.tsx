import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  DoorOpen, 
  DoorClosed, 
  Wrench, 
  Sparkles,
  DollarSign,
  Bed,
  Eye,
  Edit,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import TableActionsMenu, { ActionItem } from '@/components/manager/TableActionsMenu';

interface Room {
  id: string;
  room_number: string;
  room_type: string;
  status: string;
  floor: number | null;
  capacity: number | null;
  price_per_night: number;
  amenities: any;
  description: string | null;
}

interface RoomStats {
  total: number;
  available: number;
  occupied: number;
  maintenance: number;
  cleaning: number;
}

const statusColors: Record<string, { color: string; bg: string; icon: any }> = {
  available: { color: 'text-green-500', bg: 'bg-green-500', icon: DoorOpen },
  occupied: { color: 'text-blue-500', bg: 'bg-blue-500', icon: DoorClosed },
  maintenance: { color: 'text-orange-500', bg: 'bg-orange-500', icon: Wrench },
  cleaning: { color: 'text-yellow-500', bg: 'bg-yellow-500', icon: Sparkles },
};

const ManagerRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RoomStats>({
    total: 0,
    available: 0,
    occupied: 0,
    maintenance: 0,
    cleaning: 0
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number', { ascending: true });

      if (error) throw error;

      const roomList = data || [];
      setRooms(roomList);

      const stats: RoomStats = {
        total: roomList.length,
        available: roomList.filter(r => r.status === 'available').length,
        occupied: roomList.filter(r => r.status === 'occupied').length,
        maintenance: roomList.filter(r => r.status === 'maintenance').length,
        cleaning: roomList.filter(r => r.status === 'cleaning').length
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (room: Room, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ status: newStatus })
        .eq('id', room.id);

      if (error) throw error;

      toast.success(`Room ${room.room_number} status updated to ${newStatus}`);
      fetchRooms();
    } catch (error) {
      console.error('Error updating room status:', error);
      toast.error('Failed to update room status');
    }
  };

  const getRoomActions = (room: Room): ActionItem[] => {
    const actions: ActionItem[] = [
      {
        label: 'View Details',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => {
          setSelectedRoom(room);
          setDetailsOpen(true);
        }
      }
    ];

    // Status change options
    if (room.status !== 'available') {
      actions.push({
        label: 'Set Available',
        icon: <DoorOpen className="w-4 h-4" />,
        onClick: () => handleUpdateStatus(room, 'available'),
        separator: true
      });
    }

    if (room.status !== 'maintenance') {
      actions.push({
        label: 'Set Maintenance',
        icon: <Wrench className="w-4 h-4" />,
        onClick: () => handleUpdateStatus(room, 'maintenance')
      });
    }

    if (room.status !== 'cleaning') {
      actions.push({
        label: 'Set Cleaning',
        icon: <Sparkles className="w-4 h-4" />,
        onClick: () => handleUpdateStatus(room, 'cleaning')
      });
    }

    return actions;
  };

  const roomTypes = [...new Set(rooms.map(r => r.room_type))];

  const filteredRooms = rooms.filter(room => {
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesType = typeFilter === 'all' || room.room_type === typeFilter;
    return matchesStatus && matchesType;
  });

  const getFloors = () => {
    const floors = [...new Set(rooms.map(r => r.floor).filter(Boolean))].sort((a, b) => (b || 0) - (a || 0));
    return floors.length > 0 ? floors : [1, 2, 3];
  };

  const getRoomsByFloor = (floor: number) => {
    return filteredRooms.filter(r => r.floor === floor);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Room Number', 'Type', 'Status', 'Floor', 'Capacity', 'Price/Night'].join(','),
      ...rooms.map(room => [
        room.room_number,
        room.room_type,
        room.status,
        room.floor || '',
        room.capacity || '',
        room.price_per_night
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rooms_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Room Management</h1>
          <p className="text-muted-foreground mt-1">
            Monitor room status and manage availability.
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bed className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Rooms</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DoorOpen className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">{stats.available}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <DoorClosed className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Occupied</p>
                <p className="text-2xl font-bold">{stats.occupied}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Wrench className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Maintenance</p>
                <p className="text-2xl font-bold">{stats.maintenance}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <DollarSign className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Occupancy Rate</p>
                <p className="text-2xl font-bold">{stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {roomTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Room Grid by Floor */}
      <Card>
        <CardHeader>
          <CardTitle>Room Overview</CardTitle>
          <CardDescription>Click the menu on each room for actions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {Array(16).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {getFloors().map(floor => (
                <div key={floor}>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Floor {floor}</h4>
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {getRoomsByFloor(floor as number).map(room => {
                      const statusConfig = statusColors[room.status] || statusColors.available;
                      const StatusIcon = statusConfig.icon;
                      return (
                        <div
                          key={room.id}
                          className={`p-3 rounded-lg border-2 transition-all hover:shadow-md relative ${
                            room.status === 'available' ? 'border-green-500/50 bg-green-500/5' :
                            room.status === 'occupied' ? 'border-blue-500/50 bg-blue-500/5' :
                            room.status === 'maintenance' ? 'border-orange-500/50 bg-orange-500/5' :
                            'border-yellow-500/50 bg-yellow-500/5'
                          }`}
                        >
                          <div className="absolute top-1 right-1">
                            <TableActionsMenu actions={getRoomActions(room)} />
                          </div>
                          <div className="flex flex-col items-center gap-1 pt-4">
                            <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                            <span className="text-sm font-bold">{room.room_number}</span>
                            <span className="text-xs text-muted-foreground truncate w-full text-center">
                              {room.room_type}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {filteredRooms.filter(r => !r.floor).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Unassigned Floor</h4>
                  <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {filteredRooms.filter(r => !r.floor).map(room => {
                      const statusConfig = statusColors[room.status] || statusColors.available;
                      const StatusIcon = statusConfig.icon;
                      return (
                        <div
                          key={room.id}
                          className={`p-3 rounded-lg border-2 transition-all hover:shadow-md relative ${
                            room.status === 'available' ? 'border-green-500/50 bg-green-500/5' :
                            room.status === 'occupied' ? 'border-blue-500/50 bg-blue-500/5' :
                            room.status === 'maintenance' ? 'border-orange-500/50 bg-orange-500/5' :
                            'border-yellow-500/50 bg-yellow-500/5'
                          }`}
                        >
                          <div className="absolute top-1 right-1">
                            <TableActionsMenu actions={getRoomActions(room)} />
                          </div>
                          <div className="flex flex-col items-center gap-1 pt-4">
                            <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                            <span className="text-sm font-bold">{room.room_number}</span>
                            <span className="text-xs text-muted-foreground truncate w-full text-center">
                              {room.room_type}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Room Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DoorOpen className="w-5 h-5 text-accent" />
              Room {selectedRoom?.room_number}
            </DialogTitle>
            <DialogDescription>
              Room details and information
            </DialogDescription>
          </DialogHeader>

          {selectedRoom && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Room Type</p>
                  <p className="font-medium">{selectedRoom.room_type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge 
                    variant="outline" 
                    className={statusColors[selectedRoom.status]?.color}
                  >
                    {selectedRoom.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Floor</p>
                  <p className="font-medium">{selectedRoom.floor || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="font-medium">{selectedRoom.capacity || 2} guests</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Price per Night</p>
                  <p className="font-medium text-accent">${selectedRoom.price_per_night}</p>
                </div>
              </div>
              {selectedRoom.description && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{selectedRoom.description}</p>
                </div>
              )}
              {selectedRoom.amenities && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Amenities</p>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(selectedRoom.amenities) 
                      ? selectedRoom.amenities 
                      : Object.keys(selectedRoom.amenities)
                    ).map((amenity: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerRooms;
