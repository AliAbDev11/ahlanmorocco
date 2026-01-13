import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  DoorOpen, 
  Pencil, 
  Users, 
  DollarSign, 
  Calendar, 
  Phone,
  Bed,
  Building
} from 'lucide-react';
import { RoomWithGuest, STATUS_CONFIG } from './types';
import { format, differenceInDays } from 'date-fns';

interface RoomDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: RoomWithGuest | null;
  onEdit: (room: RoomWithGuest) => void;
}

const RoomDetailsDialog = ({
  open,
  onOpenChange,
  room,
  onEdit,
}: RoomDetailsDialogProps) => {
  if (!room) return null;

  const statusConfig = STATUS_CONFIG[room.status] || STATUS_CONFIG.available;
  
  const getAmenities = (): string[] => {
    if (!room.amenities) return [];
    if (Array.isArray(room.amenities)) return room.amenities.map(a => String(a));
    return Object.keys(room.amenities).filter(key => room.amenities && (room.amenities as Record<string, boolean>)[key]);
  };

  const amenities = getAmenities();

  const stayDuration = room.currentGuest
    ? differenceInDays(
        new Date(room.currentGuest.check_out_date),
        new Date(room.currentGuest.check_in_date)
      )
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <DoorOpen className="w-6 h-6 text-accent" />
              </div>
              <div>
                <DialogTitle className="text-2xl">Room {room.room_number}</DialogTitle>
                <DialogDescription className="capitalize">
                  {room.room_type} Room
                </DialogDescription>
              </div>
            </div>
            <Badge className={`${statusConfig.badgeBg} text-white border-0`}>
              {statusConfig.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Room Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bed className="w-4 h-4" />
                Room Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Room Type</p>
                  <p className="font-medium capitalize">{room.room_type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Floor</p>
                  <p className="font-medium flex items-center gap-1">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    {room.floor || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="font-medium flex items-center gap-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    {room.capacity || 2} guests
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Price per Night</p>
                  <p className="font-bold text-accent text-lg flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {room.price_per_night}
                  </p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={`${statusConfig.badgeBg} text-white border-0`}>
                    {statusConfig.label}
                  </Badge>
                </div>
              </div>
              {room.description && (
                <>
                  <Separator className="my-4" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm">{room.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Current Guest (if occupied) */}
          {room.status === 'occupied' && room.currentGuest && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-blue-900">
                  <Users className="w-4 h-4" />
                  Current Guest
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-blue-700">Guest Name</p>
                    <p className="font-medium text-blue-900">{room.currentGuest.full_name}</p>
                  </div>
                  {room.currentGuest.phone_number && (
                    <div className="space-y-1">
                      <p className="text-sm text-blue-700">Phone</p>
                      <p className="font-medium text-blue-900 flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {room.currentGuest.phone_number}
                      </p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm text-blue-700">Check-in</p>
                    <p className="font-medium text-blue-900 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(room.currentGuest.check_in_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-blue-700">Check-out</p>
                    <p className="font-medium text-blue-900 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(room.currentGuest.check_out_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-sm text-blue-700">Stay Duration</p>
                    <p className="font-medium text-blue-900">{stayDuration} nights</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Amenities */}
          {amenities.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity, index) => (
                    <Badge key={index} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={() => {
                onOpenChange(false);
                onEdit(room);
              }}
            >
              <Pencil className="w-4 h-4" />
              Edit Room
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoomDetailsDialog;
