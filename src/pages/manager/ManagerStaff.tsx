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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  UserCheck,
  UserX,
  Search,
  Building2,
  Eye,
  Edit,
  Trash2,
  UserCog,
  Plus,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import TableActionsMenu, { ActionItem } from '@/components/manager/TableActionsMenu';
import TablePagination from '@/components/manager/TablePagination';
import ConfirmDialog from '@/components/manager/ConfirmDialog';

interface StaffMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  department: string | null;
  phone_number: string | null;
  is_active: boolean;
  created_at: string;
}

interface StaffStats {
  total: number;
  active: number;
  inactive: number;
  byDepartment: Record<string, number>;
}

const DEPARTMENTS = [
  'Front Desk',
  'Housekeeping',
  'Maintenance',
  'Food Service',
  'Concierge',
  'Security',
  'Management'
];

const ROLES = ['staff', 'manager', 'admin'];

const ManagerStaff = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StaffStats>({
    total: 0,
    active: 0,
    inactive: 0,
    byDepartment: {}
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Dialogs
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    role: 'staff',
    department: ''
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Column filters
  const [columnFilters, setColumnFilters] = useState({
    name: '',
    email: '',
    role: ''
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;

      const staffList = data || [];
      setStaff(staffList);

      const active = staffList.filter(s => s.is_active).length;
      const inactive = staffList.filter(s => !s.is_active).length;

      const departments: Record<string, number> = {};
      staffList.forEach(member => {
        const dept = member.department || 'Unassigned';
        departments[dept] = (departments[dept] || 0) + 1;
      });

      setStats({
        total: staffList.length,
        active,
        inactive,
        byDepartment: departments
      });
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to fetch staff members');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async () => {
    try {
      // Note: In a real app, you'd also create the auth user
      // For now, we just add to the staff table with a placeholder user_id
      const { error } = await supabase.from('staff').insert({
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number || null,
        role: formData.role,
        department: formData.department || null,
        user_id: crypto.randomUUID(), // Placeholder - in real app, this would be from auth.users
        is_active: true
      });

      if (error) throw error;

      toast.success('Staff member added successfully');
      setAddOpen(false);
      setFormData({ full_name: '', email: '', phone_number: '', role: 'staff', department: '' });
      fetchStaff();
    } catch (error) {
      console.error('Error adding staff:', error);
      toast.error('Failed to add staff member');
    }
  };

  const handleEditStaff = async () => {
    if (!selectedStaff) return;

    try {
      const { error } = await supabase
        .from('staff')
        .update({
          full_name: formData.full_name,
          email: formData.email,
          phone_number: formData.phone_number || null,
          role: formData.role,
          department: formData.department || null
        })
        .eq('id', selectedStaff.id);

      if (error) throw error;

      toast.success('Staff member updated successfully');
      setEditOpen(false);
      setSelectedStaff(null);
      fetchStaff();
    } catch (error) {
      console.error('Error updating staff:', error);
      toast.error('Failed to update staff member');
    }
  };

  const handleToggleStatus = async (member: StaffMember) => {
    try {
      const { error } = await supabase
        .from('staff')
        .update({ is_active: !member.is_active })
        .eq('id', member.id);

      if (error) throw error;

      toast.success(`Staff member ${member.is_active ? 'deactivated' : 'activated'} successfully`);
      fetchStaff();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update staff status');
    }
  };

  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;

    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', staffToDelete.id);

      if (error) throw error;

      toast.success('Staff member deleted successfully');
      setDeleteConfirmOpen(false);
      setStaffToDelete(null);
      fetchStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error('Failed to delete staff member');
    }
  };

  const openEditDialog = (member: StaffMember) => {
    setSelectedStaff(member);
    setFormData({
      full_name: member.full_name,
      email: member.email,
      phone_number: member.phone_number || '',
      role: member.role,
      department: member.department || ''
    });
    setEditOpen(true);
  };

  const getStaffActions = (member: StaffMember): ActionItem[] => [
    {
      label: 'View Profile',
      icon: <Eye className="w-4 h-4" />,
      onClick: () => {
        setSelectedStaff(member);
        setDetailsOpen(true);
      }
    },
    {
      label: 'Edit Staff',
      icon: <Edit className="w-4 h-4" />,
      onClick: () => openEditDialog(member)
    },
    {
      label: member.is_active ? 'Deactivate' : 'Activate',
      icon: <UserCog className="w-4 h-4" />,
      onClick: () => handleToggleStatus(member),
      separator: true
    },
    {
      label: 'Delete Staff',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => {
        setStaffToDelete(member);
        setDeleteConfirmOpen(true);
      },
      variant: 'destructive',
      separator: true
    }
  ];

  const exportToCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Department', 'Phone', 'Status'].join(','),
      ...filteredStaff.map(member => [
        member.full_name,
        member.email,
        member.role,
        member.department || '',
        member.phone_number || '',
        member.is_active ? 'Active' : 'Inactive'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `staff_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const departments = [...new Set(staff.map(s => s.department).filter(Boolean))];

  const filteredStaff = staff.filter(member => {
    const matchesSearch = 
      member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && member.is_active) ||
      (statusFilter === 'inactive' && !member.is_active);

    const matchesDepartment = 
      departmentFilter === 'all' || 
      member.department === departmentFilter;

    const matchesColumnFilters = 
      member.full_name.toLowerCase().includes(columnFilters.name.toLowerCase()) &&
      member.email.toLowerCase().includes(columnFilters.email.toLowerCase()) &&
      member.role.toLowerCase().includes(columnFilters.role.toLowerCase());

    return matchesSearch && matchesStatus && matchesDepartment && matchesColumnFilters;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStaff.length / pageSize);
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground mt-1">
            View and manage staff members, departments, and roles.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button onClick={() => {
            setFormData({ full_name: '', email: '', phone_number: '', role: 'staff', department: '' });
            setAddOpen(true);
          }} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Staff Member
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Staff</p>
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
                <p className="text-sm text-muted-foreground">Active</p>
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
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Building2 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold">{Object.keys(stats.byDepartment).length}</p>
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
                placeholder="Search staff..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
          <CardDescription>
            {filteredStaff.length} staff members found
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
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]">Actions</TableHead>
                    </TableRow>
                    {/* Column Filters */}
                    <TableRow className="bg-muted/50">
                      <TableHead className="py-2">
                        <Input
                          placeholder="Filter name..."
                          value={columnFilters.name}
                          onChange={(e) => setColumnFilters({ ...columnFilters, name: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </TableHead>
                      <TableHead className="py-2">
                        <Input
                          placeholder="Filter email..."
                          value={columnFilters.email}
                          onChange={(e) => setColumnFilters({ ...columnFilters, email: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </TableHead>
                      <TableHead className="py-2">
                        <Input
                          placeholder="Filter role..."
                          value={columnFilters.role}
                          onChange={(e) => setColumnFilters({ ...columnFilters, role: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </TableHead>
                      <TableHead colSpan={4}></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedStaff.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No staff members found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedStaff.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                                  {getInitials(member.full_name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{member.full_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{member.role}</Badge>
                          </TableCell>
                          <TableCell>{member.department || '-'}</TableCell>
                          <TableCell>{member.phone_number || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={member.is_active ? 'default' : 'secondary'}>
                              {member.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <TableActionsMenu actions={getStaffActions(member)} />
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
                totalItems={filteredStaff.length}
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

      {/* Staff Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Staff Profile
            </DialogTitle>
            <DialogDescription>
              Staff member details and information
            </DialogDescription>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-accent text-accent-foreground text-lg">
                    {getInitials(selectedStaff.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{selectedStaff.full_name}</h3>
                  <p className="text-muted-foreground">{selectedStaff.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Role</p>
                  <Badge variant="outline">{selectedStaff.role}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{selectedStaff.department || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedStaff.phone_number || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={selectedStaff.is_active ? 'default' : 'secondary'}>
                    {selectedStaff.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Staff Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>
              Enter the staff member details below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(role => (
                      <SelectItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddStaff}>Add Staff Member</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>
              Update the staff member details below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_full_name">Full Name</Label>
              <Input
                id="edit_full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_email">Email</Label>
              <Input
                id="edit_email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_phone">Phone Number</Label>
              <Input
                id="edit_phone"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(role => (
                      <SelectItem key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEditStaff}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Staff Member"
        description={`Are you sure you want to delete ${staffToDelete?.full_name}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteStaff}
        variant="destructive"
      />
    </div>
  );
};

export default ManagerStaff;
