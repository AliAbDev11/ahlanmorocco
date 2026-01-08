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
  Wrench, 
  Clock, 
  CheckCircle,
  Search,
  AlertCircle,
  Timer,
  Eye,
  Edit,
  Download
} from 'lucide-react';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { toast } from 'sonner';
import TableActionsMenu, { ActionItem } from '@/components/manager/TableActionsMenu';
import TablePagination from '@/components/manager/TablePagination';

interface ServiceRequest {
  id: string;
  guest_id: string | null;
  room_number: string;
  service_type: string;
  description: string | null;
  status: string;
  requested_time: string | null;
  created_at: string;
  completed_at: string | null;
}

interface RequestStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  avgResponseTime: number;
}

const ManagerServiceRequests = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RequestStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    avgResponseTime: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Column filters
  const [columnFilters, setColumnFilters] = useState({
    room: '',
    type: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const requestList = data || [];
      setRequests(requestList);

      const pending = requestList.filter(r => r.status === 'pending').length;
      const inProgress = requestList.filter(r => r.status === 'in_progress').length;
      const completed = requestList.filter(r => r.status === 'completed').length;

      const completedRequests = requestList.filter(r => r.status === 'completed' && r.completed_at);
      const avgTime = completedRequests.length > 0
        ? completedRequests.reduce((sum, r) => {
            return sum + differenceInMinutes(parseISO(r.completed_at!), parseISO(r.created_at));
          }, 0) / completedRequests.length
        : 0;

      setStats({
        total: requestList.length,
        pending,
        inProgress,
        completed,
        avgResponseTime: Math.round(avgTime)
      });
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch service requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (request: ServiceRequest, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('service_requests')
        .update(updateData)
        .eq('id', request.id);

      if (error) throw error;

      toast.success(`Request status updated to ${newStatus}`);
      fetchRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Failed to update request status');
    }
  };

  const getRequestActions = (request: ServiceRequest): ActionItem[] => {
    const actions: ActionItem[] = [
      {
        label: 'View Details',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => {
          setSelectedRequest(request);
          setDetailsOpen(true);
        }
      }
    ];

    if (request.status === 'pending') {
      actions.push({
        label: 'Start Processing',
        icon: <Edit className="w-4 h-4" />,
        onClick: () => handleUpdateStatus(request, 'in_progress'),
        separator: true
      });
    }

    if (request.status === 'in_progress') {
      actions.push({
        label: 'Mark as Completed',
        icon: <CheckCircle className="w-4 h-4" />,
        onClick: () => handleUpdateStatus(request, 'completed'),
        separator: true
      });
    }

    return actions;
  };

  const serviceTypes = [...new Set(requests.map(r => r.service_type))];

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.service_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.service_type === typeFilter;

    const matchesColumnFilters = 
      request.room_number.toLowerCase().includes(columnFilters.room.toLowerCase()) &&
      request.service_type.toLowerCase().includes(columnFilters.type.toLowerCase());

    return matchesSearch && matchesStatus && matchesType && matchesColumnFilters;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / pageSize);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const exportToCSV = () => {
    const csvContent = [
      ['Room', 'Service Type', 'Status', 'Created', 'Completed'].join(','),
      ...filteredRequests.map(req => [
        req.room_number,
        req.service_type,
        req.status,
        format(parseISO(req.created_at), 'yyyy-MM-dd HH:mm'),
        req.completed_at ? format(parseISO(req.completed_at), 'yyyy-MM-dd HH:mm') : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `service_requests_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Service Requests</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage service requests from guests.
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Wrench className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Timer className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Response</p>
                <p className="text-2xl font-bold">{stats.avgResponseTime}m</p>
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
                placeholder="Search requests..."
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
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {serviceTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Service Requests</CardTitle>
          <CardDescription>
            {filteredRequests.length} requests found
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
                      <TableHead>Room</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead className="w-[50px]">Actions</TableHead>
                    </TableRow>
                    {/* Column Filters */}
                    <TableRow className="bg-muted/50">
                      <TableHead className="py-2">
                        <Input
                          placeholder="Filter room..."
                          value={columnFilters.room}
                          onChange={(e) => setColumnFilters({ ...columnFilters, room: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </TableHead>
                      <TableHead className="py-2">
                        <Input
                          placeholder="Filter type..."
                          value={columnFilters.type}
                          onChange={(e) => setColumnFilters({ ...columnFilters, type: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </TableHead>
                      <TableHead colSpan={5}></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No service requests found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <Badge variant="outline">{request.room_number}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{request.service_type}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {request.description || '-'}
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>{format(parseISO(request.created_at), 'MMM dd, HH:mm')}</TableCell>
                          <TableCell>
                            {request.completed_at 
                              ? format(parseISO(request.completed_at), 'MMM dd, HH:mm')
                              : '-'
                            }
                          </TableCell>
                          <TableCell>
                            <TableActionsMenu actions={getRequestActions(request)} />
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
                totalItems={filteredRequests.length}
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

      {/* Request Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-accent" />
              Request Details
            </DialogTitle>
            <DialogDescription>
              Service request information
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Room</p>
                  <p className="font-medium">{selectedRequest.room_number}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Service Type</p>
                  <p className="font-medium">{selectedRequest.service_type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{format(parseISO(selectedRequest.created_at), 'PPp')}</p>
                </div>
              </div>
              {selectedRequest.description && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{selectedRequest.description}</p>
                </div>
              )}
              {selectedRequest.completed_at && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="font-medium">{format(parseISO(selectedRequest.completed_at), 'PPp')}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerServiceRequests;
