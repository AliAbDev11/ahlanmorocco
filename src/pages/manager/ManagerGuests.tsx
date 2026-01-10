import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Search, 
  Users, 
  UserCheck, 
  UserX,
  Clock,
  ShoppingCart,
  Wrench,
  MessageSquareWarning,
  Eye,
  Edit,
  Trash2,
  LogOut,
  Plus,
  Download,
  AlertCircle,
  CalendarDays
} from 'lucide-react';
import { format, differenceInDays, addDays, startOfDay } from 'date-fns';
import { toast } from 'sonner';
import TableActionsMenu, { ActionItem } from '@/components/manager/TableActionsMenu';
import TablePagination from '@/components/manager/TablePagination';
import ConfirmDialog from '@/components/manager/ConfirmDialog';
import SortableTableHead, { SortDirection } from '@/components/manager/SortableTableHead';
import { DatePicker } from '@/components/ui/date-picker';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Guest {
  id: string;
  full_name: string;
  room_number: string;
  phone_number: string | null;
  check_in_date: string;
  check_out_date: string;
  is_active: boolean;
  created_at: string;
  room_id: string | null;
}

interface GuestDetails extends Guest {
  orders: any[];
  serviceRequests: any[];
  reclamations: any[];
  totalSpending: number;
}

interface Room {
  id: string;
  room_number: string;
  room_type: string;
  status: string;
}

const ManagerGuests = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedGuest, setSelectedGuest] = useState<GuestDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [guestToDelete, setGuestToDelete] = useState<Guest | null>(null);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    room_id: '',
    phone_number: ''
  });
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);
  const [dateError, setDateError] = useState<string>('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    checkedOut: 0,
    avgStay: 0
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | null>('full_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    fetchGuests();
    fetchRooms();
  }, []);

  const fetchGuests = async () => {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const guestList = data || [];
      setGuests(guestList);

      const activeGuests = guestList.filter(g => g.is_active);
      const checkedOutGuests = guestList.filter(g => !g.is_active);
      const avgStay = guestList.length > 0 
        ? guestList.reduce((sum, g) => sum + differenceInDays(new Date(g.check_out_date), new Date(g.check_in_date)), 0) / guestList.length
        : 0;

      setStats({
        total: guestList.length,
        active: activeGuests.length,
        checkedOut: checkedOutGuests.length,
        avgStay: Math.round(avgStay * 10) / 10
      });
    } catch (error) {
      console.error('Error fetching guests:', error);
      toast.error('Failed to fetch guests');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('id, room_number, room_type, status')
        .order('room_number', { ascending: true });

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchGuestDetails = async (guest: Guest) => {
    try {
      const [ordersResult, requestsResult, reclamationsResult] = await Promise.all([
        supabase.from('orders').select('*').eq('guest_id', guest.id).order('created_at', { ascending: false }),
        supabase.from('service_requests').select('*').eq('guest_id', guest.id).order('created_at', { ascending: false }),
        supabase.from('reclamations').select('*').eq('guest_id', guest.id).order('created_at', { ascending: false })
      ]);

      const orders = ordersResult.data || [];
      const totalSpending = orders.reduce((sum, order) => sum + (order.total_price || 0), 0);

      setSelectedGuest({
        ...guest,
        orders,
        serviceRequests: requestsResult.data || [],
        reclamations: reclamationsResult.data || [],
        totalSpending
      });
      setDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching guest details:', error);
      toast.error('Failed to fetch guest details');
    }
  };

  const handleCheckInDateChange = (date: Date | undefined) => {
    setCheckInDate(date);
    setDateError('');
    
    // If check-out is already selected and is before or equal to new check-in
    if (checkOutDate && date && date >= checkOutDate) {
      setCheckOutDate(undefined);
      setDateError('Check-out date was reset because it must be after check-in date');
    }
  };

  const handleCheckOutDateChange = (date: Date | undefined) => {
    if (!checkInDate) {
      setDateError('Please select check-in date first');
      return;
    }
    
    if (date && checkInDate && date <= checkInDate) {
      setDateError('Check-out date must be after check-in date');
      return;
    }
    
    setCheckOutDate(date);
    setDateError('');
  };

  const calculateNights = (checkIn: Date, checkOut: Date) => {
    return differenceInDays(checkOut, checkIn);
  };

  const resetForm = () => {
    setFormData({ full_name: '', room_id: '', phone_number: '' });
    setCheckInDate(undefined);
    setCheckOutDate(undefined);
    setDateError('');
  };

  const isFormValid = () => {
    return formData.full_name && formData.room_id && checkInDate && checkOutDate && !dateError;
  };

  const handleAddGuest = async () => {
    if (!checkInDate || !checkOutDate) {
      setDateError('Both check-in and check-out dates are required');
      return;
    }

    if (checkOutDate <= checkInDate) {
      setDateError('Check-out date must be after check-in date');
      return;
    }

    try {
      const selectedRoom = rooms.find(r => r.id === formData.room_id);
      
      const { error } = await supabase.from('guests').insert({
        full_name: formData.full_name,
        room_id: formData.room_id,
        room_number: selectedRoom?.room_number || '',
        phone_number: formData.phone_number || null,
        check_in_date: format(checkInDate, 'yyyy-MM-dd'),
        check_out_date: format(checkOutDate, 'yyyy-MM-dd'),
        is_active: true
      });

      if (error) throw error;

      toast.success('Guest added successfully');
      setAddOpen(false);
      resetForm();
      fetchGuests();
    } catch (error) {
      console.error('Error adding guest:', error);
      toast.error('Failed to add guest');
    }
  };

  const handleEditGuest = async () => {
    if (!editingGuest) return;
    
    if (!checkInDate || !checkOutDate) {
      setDateError('Both check-in and check-out dates are required');
      return;
    }

    if (checkOutDate <= checkInDate) {
      setDateError('Check-out date must be after check-in date');
      return;
    }
    
    try {
      const selectedRoom = rooms.find(r => r.id === formData.room_id);
      
      const { error } = await supabase
        .from('guests')
        .update({
          full_name: formData.full_name,
          room_id: formData.room_id,
          room_number: selectedRoom?.room_number || editingGuest.room_number,
          phone_number: formData.phone_number || null,
          check_in_date: format(checkInDate, 'yyyy-MM-dd'),
          check_out_date: format(checkOutDate, 'yyyy-MM-dd')
        })
        .eq('id', editingGuest.id);

      if (error) throw error;

      toast.success('Guest updated successfully');
      setEditOpen(false);
      setEditingGuest(null);
      resetForm();
      fetchGuests();
    } catch (error) {
      console.error('Error updating guest:', error);
      toast.error('Failed to update guest');
    }
  };

  const handleCheckOut = async (guest: Guest) => {
    try {
      const { error } = await supabase
        .from('guests')
        .update({ is_active: false })
        .eq('id', guest.id);

      if (error) throw error;

      toast.success('Guest checked out successfully');
      fetchGuests();
    } catch (error) {
      console.error('Error checking out guest:', error);
      toast.error('Failed to check out guest');
    }
  };

  const handleDeleteGuest = async () => {
    if (!guestToDelete) return;
    
    try {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', guestToDelete.id);

      if (error) throw error;

      toast.success('Guest deleted successfully');
      setDeleteConfirmOpen(false);
      setGuestToDelete(null);
      fetchGuests();
    } catch (error) {
      console.error('Error deleting guest:', error);
      toast.error('Failed to delete guest');
    }
  };

  const openEditDialog = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({
      full_name: guest.full_name,
      room_id: guest.room_id || '',
      phone_number: guest.phone_number || ''
    });
    setCheckInDate(new Date(guest.check_in_date));
    setCheckOutDate(new Date(guest.check_out_date));
    setDateError('');
    setEditOpen(true);
  };

  const getGuestActions = (guest: Guest): ActionItem[] => {
    const actions: ActionItem[] = [
      {
        label: 'View Details',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => fetchGuestDetails(guest)
      },
      {
        label: 'Edit Guest',
        icon: <Edit className="w-4 h-4" />,
        onClick: () => openEditDialog(guest)
      }
    ];

    if (guest.is_active) {
      actions.push({
        label: 'Check Out',
        icon: <LogOut className="w-4 h-4" />,
        onClick: () => handleCheckOut(guest),
        separator: true
      });
    }

    actions.push({
      label: 'Delete Guest',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => {
        setGuestToDelete(guest);
        setDeleteConfirmOpen(true);
      },
      variant: 'destructive',
      separator: true
    });

    return actions;
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Name', 'Room', 'Phone', 'Check-in', 'Check-out', 'Status'].join(','),
      ...filteredGuests.map(guest => [
        guest.full_name,
        guest.room_number,
        guest.phone_number || '',
        format(new Date(guest.check_in_date), 'yyyy-MM-dd'),
        format(new Date(guest.check_out_date), 'yyyy-MM-dd'),
        guest.is_active ? 'Active' : 'Checked Out'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guests_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Apply filters
  const filteredGuests = guests.filter(guest => {
    const matchesSearch = 
      guest.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.phone_number?.includes(searchQuery);
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && guest.is_active) ||
      (statusFilter === 'checked-out' && !guest.is_active);

    return matchesSearch && matchesStatus;
  });

  // Apply sorting
  const sortedGuests = [...filteredGuests].sort((a, b) => {
    if (!sortColumn) return 0;

    let aVal: any;
    let bVal: any;

    switch (sortColumn) {
      case 'full_name':
        aVal = a.full_name.toLowerCase();
        bVal = b.full_name.toLowerCase();
        break;
      case 'room_number':
        aVal = a.room_number;
        bVal = b.room_number;
        break;
      case 'phone_number':
        aVal = a.phone_number || '';
        bVal = b.phone_number || '';
        break;
      case 'check_in_date':
        aVal = new Date(a.check_in_date).getTime();
        bVal = new Date(b.check_in_date).getTime();
        break;
      case 'check_out_date':
        aVal = new Date(a.check_out_date).getTime();
        bVal = new Date(b.check_out_date).getTime();
        break;
      case 'stay_duration':
        aVal = differenceInDays(new Date(a.check_out_date), new Date(a.check_in_date));
        bVal = differenceInDays(new Date(b.check_out_date), new Date(b.check_in_date));
        break;
      case 'is_active':
        aVal = a.is_active ? 1 : 0;
        bVal = b.is_active ? 1 : 0;
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedGuests.length / pageSize);
  const paginatedGuests = sortedGuests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getStayDuration = (checkIn: string, checkOut: string) => {
    return differenceInDays(new Date(checkOut), new Date(checkIn));
  };

  const availableRooms = rooms.filter(r => r.status === 'available');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Guest Analytics</h1>
          <p className="text-muted-foreground mt-1">
            View and manage guest data, stay patterns, and spending habits.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button onClick={() => {
            resetForm();
            setAddOpen(true);
          }} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Guest
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Guests</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <UserCheck className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Guests</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-500/10">
                <UserX className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Checked Out</p>
                <p className="text-2xl font-bold">{stats.checkedOut}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Stay</p>
                <p className="text-2xl font-bold">{stats.avgStay} nights</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, room, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Guests</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="checked-out">Checked Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Guests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Guest Directory</CardTitle>
          <CardDescription>
            {filteredGuests.length} guests found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableTableHead
                        column="full_name"
                        label="Guest Name"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      />
                      <SortableTableHead
                        column="room_number"
                        label="Room"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      />
                      <SortableTableHead
                        column="phone_number"
                        label="Phone"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      />
                      <SortableTableHead
                        column="check_in_date"
                        label="Check-in"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      />
                      <SortableTableHead
                        column="check_out_date"
                        label="Check-out"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      />
                      <SortableTableHead
                        column="stay_duration"
                        label="Stay Duration"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      />
                      <SortableTableHead
                        column="is_active"
                        label="Status"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      />
                      <TableHead className="w-[50px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedGuests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No guests found matching your criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedGuests.map((guest) => (
                        <TableRow key={guest.id}>
                          <TableCell className="font-medium">{guest.full_name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{guest.room_number}</Badge>
                          </TableCell>
                          <TableCell>{guest.phone_number || '-'}</TableCell>
                          <TableCell>{format(new Date(guest.check_in_date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{format(new Date(guest.check_out_date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{getStayDuration(guest.check_in_date, guest.check_out_date)} nights</TableCell>
                          <TableCell>
                            <Badge variant={guest.is_active ? 'default' : 'secondary'}>
                              {guest.is_active ? 'Active' : 'Checked Out'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <TableActionsMenu actions={getGuestActions(guest)} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={sortedGuests.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Guest Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Guest Profile
            </DialogTitle>
            <DialogDescription>
              Complete guest information and activity history
            </DialogDescription>
          </DialogHeader>
          
          {selectedGuest && (
            <div className="space-y-6">
              {/* Guest Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{selectedGuest.full_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Room Number</p>
                  <Badge variant="outline">{selectedGuest.room_number}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedGuest.phone_number || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={selectedGuest.is_active ? 'default' : 'secondary'}>
                    {selectedGuest.is_active ? 'Active' : 'Checked Out'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Check-in</p>
                  <p className="font-medium">{format(new Date(selectedGuest.check_in_date), 'MMMM dd, yyyy')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Check-out</p>
                  <p className="font-medium">{format(new Date(selectedGuest.check_out_date), 'MMMM dd, yyyy')}</p>
                </div>
              </div>

              {/* Total Spending */}
              <Card className="bg-accent/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Spending</p>
                      <p className="text-2xl font-bold text-accent">${selectedGuest.totalSpending.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <ShoppingCart className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                    <p className="text-2xl font-bold">{selectedGuest.orders.length}</p>
                    <p className="text-sm text-muted-foreground">Orders</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Wrench className="w-6 h-6 mx-auto text-green-500 mb-2" />
                    <p className="text-2xl font-bold">{selectedGuest.serviceRequests.length}</p>
                    <p className="text-sm text-muted-foreground">Service Requests</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <MessageSquareWarning className="w-6 h-6 mx-auto text-orange-500 mb-2" />
                    <p className="text-2xl font-bold">{selectedGuest.reclamations.length}</p>
                    <p className="text-sm text-muted-foreground">Complaints</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              {selectedGuest.orders.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Recent Orders</h4>
                  <div className="space-y-2">
                    {selectedGuest.orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">${order.total_price?.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(order.created_at), 'MMM dd, HH:mm')}
                          </p>
                        </div>
                        <Badge>{order.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Guest Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Guest</DialogTitle>
            <DialogDescription>
              Enter guest details to create a new check-in
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                placeholder="Enter full name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Room</Label>
              <Select value={formData.room_id} onValueChange={(value) => setFormData({ ...formData, room_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {availableRooms.map(room => (
                    <SelectItem key={room.id} value={room.id}>
                      Room {room.room_number} - {room.room_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                placeholder="Enter phone number"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  Check-in Date
                </Label>
                <DatePicker
                  date={checkInDate}
                  onDateChange={handleCheckInDateChange}
                  placeholder="Select check-in date"
                  minDate={startOfDay(new Date())}
                  showClearButton
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  Check-out Date
                </Label>
                <DatePicker
                  date={checkOutDate}
                  onDateChange={handleCheckOutDateChange}
                  placeholder="Select check-out date"
                  minDate={checkInDate ? addDays(checkInDate, 1) : undefined}
                  disabled={!checkInDate}
                  showClearButton
                />
              </div>
            </div>
            
            {/* Stay Duration Display */}
            {checkInDate && checkOutDate && (
              <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
                <p className="text-sm text-primary flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Stay Duration: <span className="font-semibold">{calculateNights(checkInDate, checkOutDate)} night{calculateNights(checkInDate, checkOutDate) !== 1 ? 's' : ''}</span>
                </p>
              </div>
            )}
            
            {/* Date Error Display */}
            {dateError && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{dateError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddGuest} disabled={!isFormValid()}>
              Add Guest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Guest Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Guest</DialogTitle>
            <DialogDescription>
              Update guest information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                placeholder="Enter full name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Room</Label>
              <Select value={formData.room_id} onValueChange={(value) => setFormData({ ...formData, room_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map(room => (
                    <SelectItem key={room.id} value={room.id}>
                      Room {room.room_number} - {room.room_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                placeholder="Enter phone number"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  Check-in Date
                </Label>
                <DatePicker
                  date={checkInDate}
                  onDateChange={handleCheckInDateChange}
                  placeholder="Select check-in date"
                  showClearButton
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  Check-out Date
                </Label>
                <DatePicker
                  date={checkOutDate}
                  onDateChange={handleCheckOutDateChange}
                  placeholder="Select check-out date"
                  minDate={checkInDate ? addDays(checkInDate, 1) : undefined}
                  disabled={!checkInDate}
                  showClearButton
                />
              </div>
            </div>
            
            {/* Stay Duration Display */}
            {checkInDate && checkOutDate && (
              <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
                <p className="text-sm text-primary flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Stay Duration: <span className="font-semibold">{calculateNights(checkInDate, checkOutDate)} night{calculateNights(checkInDate, checkOutDate) !== 1 ? 's' : ''}</span>
                </p>
              </div>
            )}
            
            {/* Date Error Display */}
            {dateError && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{dateError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditGuest} disabled={!isFormValid()}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Guest"
        description={`Are you sure you want to delete ${guestToDelete?.full_name}? This action cannot be undone.`}
        onConfirm={handleDeleteGuest}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default ManagerGuests;
