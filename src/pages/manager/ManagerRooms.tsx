import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Download } from 'lucide-react';
import { toast } from 'sonner';
import { FullscreenButton } from '@/components/ui/fullscreen-button';

// Room components
import RoomStatsCards from '@/components/manager/rooms/RoomStatsCards';
import RoomFilters from '@/components/manager/rooms/RoomFilters';
import RoomGridView from '@/components/manager/rooms/RoomGridView';
import RoomListView from '@/components/manager/rooms/RoomListView';
import RoomFormDialog from '@/components/manager/rooms/RoomFormDialog';
import RoomDetailsDialog from '@/components/manager/rooms/RoomDetailsDialog';
import DeleteRoomDialog from '@/components/manager/rooms/DeleteRoomDialog';
import AssignGuestDialog from '@/components/manager/rooms/AssignGuestDialog';

import { RoomWithGuest, RoomStats, RoomFormData } from '@/components/manager/rooms/types';
import { ActionItem } from '@/components/manager/TableActionsMenu';
import { 
  DoorOpen, 
  Wrench, 
  Sparkles,
  Eye,
  Pencil,
  Trash2,
  UserPlus,
  Clock
} from 'lucide-react';

const ManagerRooms = () => {
  // State
  const [rooms, setRooms] = useState<RoomWithGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RoomStats>({
    total: 0,
    available: 0,
    occupied: 0,
    maintenance: 0,
    cleaning: 0,
    occupancyRate: 0,
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Dialog states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomWithGuest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch rooms with guest data
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .order('room_number', { ascending: true });

      if (roomsError) throw roomsError;

      // Fetch active guests
      const { data: guestsData, error: guestsError } = await supabase
        .from('guests')
        .select('id, full_name, phone_number, check_in_date, check_out_date, room_number')
        .eq('is_active', true);

      if (guestsError) throw guestsError;

      // Merge rooms with guest data
      const roomsWithGuests: RoomWithGuest[] = (roomsData || []).map(room => {
        const guest = guestsData?.find(g => g.room_number === room.room_number);
        return {
          ...room,
          currentGuest: guest ? {
            id: guest.id,
            full_name: guest.full_name,
            phone_number: guest.phone_number,
            check_in_date: guest.check_in_date,
            check_out_date: guest.check_out_date,
          } : null,
        };
      });

      setRooms(roomsWithGuests);

      // Calculate stats
      const roomStats: RoomStats = {
        total: roomsWithGuests.length,
        available: roomsWithGuests.filter(r => r.status === 'available').length,
        occupied: roomsWithGuests.filter(r => r.status === 'occupied').length,
        maintenance: roomsWithGuests.filter(r => r.status === 'maintenance').length,
        cleaning: roomsWithGuests.filter(r => r.status === 'cleaning').length,
        occupancyRate: roomsWithGuests.length > 0 
          ? Math.round((roomsWithGuests.filter(r => r.status === 'occupied').length / roomsWithGuests.length) * 100)
          : 0,
      };
      setStats(roomStats);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Get unique room types
  const roomTypes = [...new Set(rooms.map(r => r.room_type))];

  // Filter rooms
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = searchQuery === '' ||
      room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.room_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.currentGuest?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.floor?.toString().includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesType = typeFilter === 'all' || room.room_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || typeFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  // Room actions
  const handleUpdateStatus = async (room: RoomWithGuest, newStatus: string) => {
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

  const handleAddRoom = async (data: RoomFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('rooms')
        .insert({
          room_number: data.room_number,
          room_type: data.room_type,
          floor: data.floor,
          capacity: data.capacity,
          price_per_night: data.price_per_night,
          status: data.status,
          description: data.description || null,
          image_url: data.image_url || null,
          amenities: data.amenities,
        });

      if (error) throw error;

      toast.success(`Room ${data.room_number} added successfully`);
      setFormDialogOpen(false);
      setSelectedRoom(null);
      fetchRooms();
    } catch (error: any) {
      console.error('Error adding room:', error);
      if (error.code === '23505') {
        toast.error('A room with this number already exists');
      } else {
        toast.error('Failed to add room');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRoom = async (data: RoomFormData) => {
    if (!selectedRoom) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('rooms')
        .update({
          room_type: data.room_type,
          floor: data.floor,
          capacity: data.capacity,
          price_per_night: data.price_per_night,
          status: data.status,
          description: data.description || null,
          image_url: data.image_url || null,
          amenities: data.amenities,
        })
        .eq('id', selectedRoom.id);

      if (error) throw error;

      toast.success(`Room ${selectedRoom.room_number} updated successfully`);
      setFormDialogOpen(false);
      setSelectedRoom(null);
      fetchRooms();
    } catch (error) {
      console.error('Error updating room:', error);
      toast.error('Failed to update room');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', selectedRoom.id);

      if (error) throw error;

      toast.success(`Room ${selectedRoom.room_number} deleted successfully`);
      setDeleteDialogOpen(false);
      setSelectedRoom(null);
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Failed to delete room');
    } finally {
      setIsDeleting(false);
    }
  };

  const openViewDialog = (room: RoomWithGuest) => {
    setSelectedRoom(room);
    setDetailsDialogOpen(true);
  };

  const openEditDialog = (room: RoomWithGuest) => {
    setSelectedRoom(room);
    setFormDialogOpen(true);
  };

  const openDeleteDialog = (room: RoomWithGuest) => {
    setSelectedRoom(room);
    setDeleteDialogOpen(true);
  };

  const openAssignDialog = (room: RoomWithGuest) => {
    setSelectedRoom(room);
    setAssignDialogOpen(true);
  };

  const openAddDialog = () => {
    setSelectedRoom(null);
    setFormDialogOpen(true);
  };

  // Get actions for each room
  const getRoomActions = (room: RoomWithGuest): ActionItem[] => {
    const actions: ActionItem[] = [
      {
        label: 'View Details',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => openViewDialog(room),
      },
      {
        label: 'Edit Room',
        icon: <Pencil className="w-4 h-4" />,
        onClick: () => openEditDialog(room),
      },
    ];

    // Status change options
    if (room.status !== 'available') {
      actions.push({
        label: 'Set Available',
        icon: <DoorOpen className="w-4 h-4" />,
        onClick: () => handleUpdateStatus(room, 'available'),
        separator: true,
      });
    }

    if (room.status !== 'maintenance') {
      actions.push({
        label: 'Set Maintenance',
        icon: <Wrench className="w-4 h-4" />,
        onClick: () => handleUpdateStatus(room, 'maintenance'),
      });
    }

    if (room.status !== 'cleaning') {
      actions.push({
        label: 'Set Cleaning',
        icon: <Sparkles className="w-4 h-4" />,
        onClick: () => handleUpdateStatus(room, 'cleaning'),
      });
    }

    // Assign guest (only for available rooms)
    if (room.status === 'available') {
      actions.push({
        label: 'Assign Guest',
        icon: <UserPlus className="w-4 h-4" />,
        onClick: () => openAssignDialog(room),
        separator: true,
      });
    }

    // Delete room
    actions.push({
      label: 'Delete Room',
      icon: <Trash2 className="w-4 h-4 text-destructive" />,
      onClick: () => openDeleteDialog(room),
      separator: true,
    });

    return actions;
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvContent = [
      ['Room Number', 'Type', 'Status', 'Floor', 'Capacity', 'Price/Night', 'Guest'].join(','),
      ...rooms.map(room => [
        room.room_number,
        room.room_type,
        room.status,
        room.floor || '',
        room.capacity || '',
        room.price_per_night,
        room.currentGuest?.full_name || '',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rooms_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Rooms exported to CSV');
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
        <div className="flex items-center gap-3">
          <Button onClick={openAddDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Room
          </Button>
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          {/* <FullscreenButton /> */}
        </div>
      </div>

      {/* Stats Cards */}
      <RoomStatsCards stats={stats} loading={loading} />

      {/* Filters Card */}
      <Card>
        <CardContent className="p-4">
          <RoomFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            roomTypes={roomTypes}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </CardContent>
      </Card>

      {/* Room count */}
      {!loading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredRooms.length} of {rooms.length} rooms
          </p>
        </div>
      )}

      {/* Room View */}
      {viewMode === 'grid' ? (
        <RoomGridView
          rooms={filteredRooms}
          loading={loading}
          onViewRoom={openViewDialog}
          onEditRoom={openEditDialog}
          getActions={getRoomActions}
          onClearFilters={clearFilters}
        />
      ) : (
        <RoomListView
          rooms={filteredRooms}
          loading={loading}
          onViewRoom={openViewDialog}
          onEditRoom={openEditDialog}
          getActions={getRoomActions}
          onClearFilters={clearFilters}
        />
      )}

      {/* Dialogs */}
      <RoomFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        room={selectedRoom}
        onSubmit={selectedRoom ? handleEditRoom : handleAddRoom}
        isSubmitting={isSubmitting}
      />

      <RoomDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        room={selectedRoom}
        onEdit={openEditDialog}
      />

      <DeleteRoomDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        room={selectedRoom}
        onConfirm={handleDeleteRoom}
        isDeleting={isDeleting}
      />

      <AssignGuestDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        room={selectedRoom}
        onSuccess={fetchRooms}
      />
    </div>
  );
};

export default ManagerRooms;
