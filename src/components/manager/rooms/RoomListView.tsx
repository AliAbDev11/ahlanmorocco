import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Pencil, Inbox } from 'lucide-react';
import { RoomWithGuest, STATUS_CONFIG } from './types';
import TableActionsMenu, { ActionItem } from '@/components/manager/TableActionsMenu';
import { SortableTableHead, useSorting } from '@/components/manager/SortableTableHead';

interface RoomListViewProps {
  rooms: RoomWithGuest[];
  loading: boolean;
  onViewRoom: (room: RoomWithGuest) => void;
  onEditRoom: (room: RoomWithGuest) => void;
  getActions: (room: RoomWithGuest) => ActionItem[];
  onClearFilters: () => void;
}

const RoomListView = ({
  rooms,
  loading,
  onViewRoom,
  onEditRoom,
  getActions,
  onClearFilters,
}: RoomListViewProps) => {
  const { sortColumn, sortDirection, handleSort, sortedData } = useSorting<RoomWithGuest>(
    rooms,
    'room_number',
    'asc'
  );

  if (loading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {Array(7).fill(0).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5).fill(0).map((_, i) => (
              <TableRow key={i}>
                {Array(7).fill(0).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No rooms found</h3>
        <p className="text-muted-foreground mb-4">
          No rooms match your current filters.
        </p>
        <Button variant="outline" onClick={onClearFilters}>
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <SortableTableHead
              column="room_number"
              label="Room"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            <SortableTableHead
              column="room_type"
              label="Type"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            <SortableTableHead
              column="floor"
              label="Floor"
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
            <TableHead>Guest</TableHead>
            <SortableTableHead
              column="capacity"
              label="Capacity"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            <SortableTableHead
              column="price_per_night"
              label="Price/Night"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((room) => {
            const statusConfig = STATUS_CONFIG[room.status] || STATUS_CONFIG.available;
            return (
              <TableRow
                key={room.id}
                className="hover:bg-muted/30 cursor-pointer"
                onClick={() => onViewRoom(room)}
              >
                <TableCell className="font-bold">{room.room_number}</TableCell>
                <TableCell className="capitalize">{room.room_type}</TableCell>
                <TableCell>{room.floor || '-'}</TableCell>
                <TableCell>
                  <Badge className={`${statusConfig.badgeBg} text-white border-0`}>
                    {statusConfig.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {room.currentGuest ? (
                    <span className="font-medium">{room.currentGuest.full_name}</span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>{room.capacity || 2}</TableCell>
                <TableCell className="font-bold text-accent">
                  ${room.price_per_night}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewRoom(room)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditRoom(room)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <TableActionsMenu actions={getActions(room)} />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default RoomListView;
