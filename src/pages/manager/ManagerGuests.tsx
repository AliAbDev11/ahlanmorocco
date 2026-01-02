import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
} from '@/components/ui/dialog';
import { 
  Search, 
  Users, 
  UserCheck, 
  UserX,
  Calendar,
  Phone,
  DoorOpen,
  Clock,
  ShoppingCart,
  Wrench,
  MessageSquareWarning,
  Eye
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface Guest {
  id: string;
  full_name: string;
  room_number: string;
  phone_number: string | null;
  check_in_date: string;
  check_out_date: string;
  is_active: boolean;
  created_at: string;
}

interface GuestDetails extends Guest {
  orders: any[];
  serviceRequests: any[];
  reclamations: any[];
  totalSpending: number;
}

const ManagerGuests = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedGuest, setSelectedGuest] = useState<GuestDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    checkedOut: 0,
    avgStay: 0
  });

  useEffect(() => {
    fetchGuests();
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

      // Calculate stats
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
    } finally {
      setLoading(false);
    }
  };

  const fetchGuestDetails = async (guest: Guest) => {
    try {
      // Fetch orders, service requests, and reclamations for this guest
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
    }
  };

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

  const getStayDuration = (checkIn: string, checkOut: string) => {
    return differenceInDays(new Date(checkOut), new Date(checkIn));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Guest Analytics</h1>
        <p className="text-muted-foreground mt-1">
          View and analyze guest data, stay patterns, and spending habits.
        </p>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest Name</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Stay Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No guests found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGuests.map((guest) => (
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
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => fetchGuestDetails(guest)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
              Detailed information and activity history
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
                  <p className="font-medium">{selectedGuest.room_number}</p>
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
                  <p className="text-sm text-muted-foreground">Check-in Date</p>
                  <p className="font-medium">{format(new Date(selectedGuest.check_in_date), 'PPP')}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Check-out Date</p>
                  <p className="font-medium">{format(new Date(selectedGuest.check_out_date), 'PPP')}</p>
                </div>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <ShoppingCart className="w-6 h-6 mx-auto text-accent mb-2" />
                    <p className="text-2xl font-bold">${selectedGuest.totalSpending.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Total Spending</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Wrench className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                    <p className="text-2xl font-bold">{selectedGuest.serviceRequests.length}</p>
                    <p className="text-xs text-muted-foreground">Service Requests</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <MessageSquareWarning className="w-6 h-6 mx-auto text-destructive mb-2" />
                    <p className="text-2xl font-bold">{selectedGuest.reclamations.length}</p>
                    <p className="text-xs text-muted-foreground">Complaints</p>
                  </CardContent>
                </Card>
              </div>

              {/* Orders History */}
              <div>
                <h4 className="font-medium mb-3">Order History ({selectedGuest.orders.length})</h4>
                {selectedGuest.orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No orders placed</p>
                ) : (
                  <div className="space-y-2">
                    {selectedGuest.orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm font-medium">${order.total_price?.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(order.created_at), 'PPp')}
                          </p>
                        </div>
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerGuests;
