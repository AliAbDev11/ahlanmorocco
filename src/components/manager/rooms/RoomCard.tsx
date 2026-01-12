import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, Pencil, Users, DollarSign, Calendar } from 'lucide-react';
import { RoomWithGuest, STATUS_CONFIG } from './types';
import TableActionsMenu, { ActionItem } from '@/components/manager/TableActionsMenu';
import { format } from 'date-fns';

interface RoomCardProps {
  room: RoomWithGuest;
  onView: (room: RoomWithGuest) => void;
  onEdit: (room: RoomWithGuest) => void;
  actions: ActionItem[];
}

const RoomCard = ({ room, onView, onEdit, actions }: RoomCardProps) => {
  const statusConfig = STATUS_CONFIG[room.status] || STATUS_CONFIG.available;
  
  const getAmenities = (): string[] => {
    if (!room.amenities) return [];
    if (Array.isArray(room.amenities)) return room.amenities;
    return Object.keys(room.amenities).filter(key => room.amenities && (room.amenities as Record<string, boolean>)[key]);
  };

  const amenities = getAmenities();
  const displayAmenities = amenities.slice(0, 3);
  const remainingCount = amenities.length - 3;

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer group ${statusConfig.bgColor} ${statusConfig.borderColor} border-2`}
      onClick={() => onView(room)}
    >
      {/* Status Badge */}
      <div className="absolute top-3 right-3 z-10">
        <Badge className={`${statusConfig.badgeBg} text-white border-0`}>
          {statusConfig.label}
        </Badge>
      </div>

      <div className="p-5">
        {/* Room Number & Type */}
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-foreground mb-1">
            {room.room_number}
          </h3>
          <p className="text-sm text-muted-foreground capitalize">
            {room.room_type} • Floor {room.floor || 'N/A'}
          </p>
        </div>

        {/* Current Guest (if occupied) */}
        {room.status === 'occupied' && room.currentGuest && (
          <div className="mb-4 p-3 rounded-lg bg-blue-100/50 border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {room.currentGuest.full_name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs text-blue-700">
                Check-out: {format(new Date(room.currentGuest.check_out_date), 'MMM dd, yyyy')}
              </span>
            </div>
          </div>
        )}

        {/* Room Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              Capacity
            </span>
            <span className="font-medium">{room.capacity || 2} guests</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <DollarSign className="w-4 h-4" />
              Per Night
            </span>
            <span className="text-lg font-bold text-accent">
              ${room.price_per_night}
            </span>
          </div>
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {displayAmenities.map((amenity, index) => (
              <Badge key={index} variant="secondary" className="text-xs font-normal">
                {amenity}
              </Badge>
            ))}
            {remainingCount > 0 && (
              <Badge variant="outline" className="text-xs font-normal">
                +{remainingCount} more
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-3 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => onView(room)}
          >
            <Eye className="w-4 h-4" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => onEdit(room)}
          >
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
          <TableActionsMenu actions={actions} />
        </div>
      </div>
    </Card>
  );
};

export default RoomCard;
