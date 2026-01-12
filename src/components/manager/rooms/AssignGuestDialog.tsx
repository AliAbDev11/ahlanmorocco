import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Search, User, Phone, Calendar } from 'lucide-react';
import { RoomWithGuest } from './types';
import { format } from 'date-fns';

interface Guest {
  id: string;
  full_name: string;
  phone_number: string | null;
  room_number: string;
  check_in_date: string;
  check_out_date: string;
  is_active: boolean;
}

interface AssignGuestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: RoomWithGuest | null;
  onSuccess: () => void;
}

const AssignGuestDialog = ({
  open,
  onOpenChange,
  room,
  onSuccess,
}: AssignGuestDialogProps) => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAvailableGuests();
      setSelectedGuest(null);
      setSearchQuery('');
    }
  }, [open]);

  const fetchAvailableGuests = async () => {
    setLoading(true);
    try {
      // Fetch guests who are active but don't have a room assigned (or need reassignment)
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      setGuests(data || []);
    } catch (error) {
      console.error('Error fetching guests:', error);
      toast.error('Failed to load guests');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedGuest || !room) return;

    setIsAssigning(true);
    try {
      // Update the guest's room assignment
      const { error: guestError } = await supabase
        .from('guests')
        .update({ 
          room_number: room.room_number,
          room_id: room.id
        })
        .eq('id', selectedGuest.id);

      if (guestError) throw guestError;

      // Update the room status to occupied
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: 'occupied' })
        .eq('id', room.id);

      if (roomError) throw roomError;

      toast.success(`${selectedGuest.full_name} assigned to Room ${room.room_number}`);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error assigning guest:', error);
      toast.error('Failed to assign guest');
    } finally {
      setIsAssigning(false);
    }
  };

  const filteredGuests = guests.filter(guest =>
    guest.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.phone_number?.includes(searchQuery)
  );

  if (!room) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Guest to Room {room.room_number}</DialogTitle>
          <DialogDescription>
            Select a guest to assign to this room.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search guests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[300px]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredGuests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <User className="w-10 h-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No guests found</p>
              </div>
            ) : (
              <div className="space-y-2 pr-4">
                {filteredGuests.map((guest) => (
                  <Card
                    key={guest.id}
                    className={`p-3 cursor-pointer transition-all ${
                      selectedGuest?.id === guest.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedGuest(guest)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-muted">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{guest.full_name}</p>
                        {guest.phone_number && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {guest.phone_number}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(guest.check_in_date), 'MMM dd')} - {format(new Date(guest.check_out_date), 'MMM dd, yyyy')}
                        </p>
                        {guest.room_number && (
                          <p className="text-xs text-amber-600 mt-1">
                            Currently in Room {guest.room_number}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>

          {selectedGuest && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <Label className="text-xs text-muted-foreground">Selected Guest</Label>
              <p className="font-medium">{selectedGuest.full_name}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isAssigning}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedGuest || isAssigning}
          >
            {isAssigning && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Assign Guest
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignGuestDialog;
