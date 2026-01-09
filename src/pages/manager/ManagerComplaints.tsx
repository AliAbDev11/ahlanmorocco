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
  MessageSquareWarning, 
  AlertTriangle, 
  CheckCircle,
  Search,
  AlertCircle,
  Eye,
  Edit,
  Clock,
  Download
} from 'lucide-react';
import { format, parseISO, differenceInHours } from 'date-fns';
import { toast } from 'sonner';
import TableActionsMenu, { ActionItem } from '@/components/manager/TableActionsMenu';
import TablePagination from '@/components/manager/TablePagination';
import SortableTableHead, { SortDirection } from '@/components/manager/SortableTableHead';

interface Complaint {
  id: string;
  guest_id: string | null;
  room_number: string;
  category: string;
  description: string;
  urgency: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
}

interface ComplaintStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  critical: number;
  avgResolutionTime: number;
}

const URGENCY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e'
};

const URGENCY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3
};

const ManagerComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ComplaintStats>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0,
    avgResolutionTime: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Sorting state
  const [sortColumn, setSortColumn] = useState<string | null>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from('reclamations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const complaintList = data || [];
      setComplaints(complaintList);

      const open = complaintList.filter(c => c.status === 'open').length;
      const inProgress = complaintList.filter(c => c.status === 'in_progress').length;
      const resolved = complaintList.filter(c => c.status === 'resolved').length;
      const critical = complaintList.filter(c => c.urgency === 'critical').length;

      const resolvedComplaints = complaintList.filter(c => c.status === 'resolved' && c.resolved_at);
      const avgTime = resolvedComplaints.length > 0
        ? resolvedComplaints.reduce((sum, c) => {
            return sum + differenceInHours(parseISO(c.resolved_at!), parseISO(c.created_at));
          }, 0) / resolvedComplaints.length
        : 0;

      setStats({
        total: complaintList.length,
        open,
        inProgress,
        resolved,
        critical,
        avgResolutionTime: Math.round(avgTime)
      });
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (complaint: Complaint, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('reclamations')
        .update(updateData)
        .eq('id', complaint.id);

      if (error) throw error;

      toast.success(`Complaint status updated to ${newStatus}`);
      fetchComplaints();
    } catch (error) {
      console.error('Error updating complaint:', error);
      toast.error('Failed to update complaint status');
    }
  };

  const getComplaintActions = (complaint: Complaint): ActionItem[] => {
    const actions: ActionItem[] = [
      {
        label: 'View Details',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => {
          setSelectedComplaint(complaint);
          setDetailsOpen(true);
        }
      }
    ];

    if (complaint.status === 'open') {
      actions.push({
        label: 'Start Processing',
        icon: <Edit className="w-4 h-4" />,
        onClick: () => handleUpdateStatus(complaint, 'in_progress'),
        separator: true
      });
    }

    if (complaint.status === 'in_progress') {
      actions.push({
        label: 'Mark as Resolved',
        icon: <CheckCircle className="w-4 h-4" />,
        onClick: () => handleUpdateStatus(complaint, 'resolved'),
        separator: true
      });
    }

    return actions;
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = 
      complaint.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || complaint.urgency === urgencyFilter;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  // Apply sorting
  const sortedComplaints = [...filteredComplaints].sort((a, b) => {
    if (!sortColumn) return 0;

    let aVal: any;
    let bVal: any;

    switch (sortColumn) {
      case 'room_number':
        aVal = a.room_number;
        bVal = b.room_number;
        break;
      case 'category':
        aVal = a.category.toLowerCase();
        bVal = b.category.toLowerCase();
        break;
      case 'description':
        aVal = a.description.toLowerCase();
        bVal = b.description.toLowerCase();
        break;
      case 'urgency':
        aVal = URGENCY_ORDER[a.urgency] ?? 4;
        bVal = URGENCY_ORDER[b.urgency] ?? 4;
        break;
      case 'status':
        aVal = a.status;
        bVal = b.status;
        break;
      case 'created_at':
        aVal = new Date(a.created_at).getTime();
        bVal = new Date(b.created_at).getTime();
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedComplaints.length / pageSize);
  const paginatedComplaints = sortedComplaints.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const exportToCSV = () => {
    const csvContent = [
      ['Room', 'Category', 'Urgency', 'Status', 'Created', 'Resolved'].join(','),
      ...filteredComplaints.map(c => [
        c.room_number,
        c.category,
        c.urgency,
        c.status,
        format(parseISO(c.created_at), 'yyyy-MM-dd HH:mm'),
        c.resolved_at ? format(parseISO(c.resolved_at), 'yyyy-MM-dd HH:mm') : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complaints_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return <Badge className="bg-green-500">Resolved</Badge>;
      case 'open':
        return <Badge variant="destructive">Open</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    const color = URGENCY_COLORS[urgency] || URGENCY_COLORS.medium;
    return (
      <Badge style={{ backgroundColor: color }} className="text-white">
        {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Complaints Management</h1>
          <p className="text-muted-foreground mt-1">
            Track and resolve guest complaints.
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <MessageSquareWarning className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-2xl font-bold">{stats.open}</p>
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
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">{stats.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold">{stats.critical}</p>
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
                <p className="text-sm text-muted-foreground">Avg. Resolution</p>
                <p className="text-2xl font-bold">{stats.avgResolutionTime}h</p>
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
                placeholder="Search complaints..."
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
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgencies</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Complaints</CardTitle>
          <CardDescription>
            {filteredComplaints.length} complaints found
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
                        column="room_number"
                        label="Room"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      />
                      <SortableTableHead
                        column="category"
                        label="Category"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      />
                      <SortableTableHead
                        column="description"
                        label="Description"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      />
                      <SortableTableHead
                        column="urgency"
                        label="Urgency"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      />
                      <SortableTableHead
                        column="status"
                        label="Status"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      />
                      <SortableTableHead
                        column="created_at"
                        label="Created"
                        sortColumn={sortColumn}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                      />
                      <TableHead className="w-[50px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedComplaints.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No complaints found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedComplaints.map((complaint) => (
                        <TableRow key={complaint.id}>
                          <TableCell>
                            <Badge variant="outline">{complaint.room_number}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{complaint.category}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {complaint.description}
                          </TableCell>
                          <TableCell>{getUrgencyBadge(complaint.urgency)}</TableCell>
                          <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                          <TableCell>{format(parseISO(complaint.created_at), 'MMM dd, HH:mm')}</TableCell>
                          <TableCell>
                            <TableActionsMenu actions={getComplaintActions(complaint)} />
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
                totalItems={sortedComplaints.length}
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

      {/* Complaint Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquareWarning className="w-5 h-5 text-accent" />
              Complaint Details
            </DialogTitle>
            <DialogDescription>
              Complaint information and status
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Room</p>
                  <p className="font-medium">{selectedComplaint.room_number}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{selectedComplaint.category}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Urgency</p>
                  {getUrgencyBadge(selectedComplaint.urgency)}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedComplaint.status)}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{format(parseISO(selectedComplaint.created_at), 'MMM dd, HH:mm')}</p>
                </div>
                {selectedComplaint.resolved_at && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Resolved</p>
                    <p className="font-medium">{format(parseISO(selectedComplaint.resolved_at), 'MMM dd, HH:mm')}</p>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{selectedComplaint.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerComplaints;
