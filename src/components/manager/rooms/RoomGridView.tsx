import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { RoomWithGuest } from './types';
import RoomCard from './RoomCard';
import { ActionItem } from '@/components/manager/TableActionsMenu';
import { Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RoomGridViewProps {
  rooms: RoomWithGuest[];
  loading: boolean;
  onViewRoom: (room: RoomWithGuest) => void;
  onEditRoom: (room: RoomWithGuest) => void;
  getActions: (room: RoomWithGuest) => ActionItem[];
  onClearFilters: () => void;
}

const RoomGridView = ({
  rooms,
  loading,
  onViewRoom,
  onEditRoom,
  getActions,
  onClearFilters,
}: RoomGridViewProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array(8).fill(0).map((_, i) => (
          <Card key={i} className="p-5">
            <Skeleton className="h-6 w-20 mb-2" />
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-16 w-full mb-4" />
            <Skeleton className="h-10 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          onView={onViewRoom}
          onEdit={onEditRoom}
          actions={getActions(room)}
        />
      ))}
    </div>
  );
};

export default RoomGridView;
