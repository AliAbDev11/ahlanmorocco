import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { RoomWithGuest } from './types';

interface DeleteRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: RoomWithGuest | null;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

const DeleteRoomDialog = ({
  open,
  onOpenChange,
  room,
  onConfirm,
  isDeleting,
}: DeleteRoomDialogProps) => {
  if (!room) return null;

  const isOccupied = room.status === 'occupied';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-destructive">
              Delete Room {room.room_number}?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {isOccupied ? (
              <span className="text-destructive font-medium">
                This room is currently occupied. Please check out the guest before deleting.
              </span>
            ) : (
              <>
                Are you sure you want to delete Room {room.room_number}? This action cannot be undone 
                and will permanently remove all room data.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isOccupied || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Delete Room
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteRoomDialog;
