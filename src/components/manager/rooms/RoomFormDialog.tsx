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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RoomWithGuest, RoomFormData, ROOM_TYPES, ROOM_STATUSES, AMENITIES_LIST } from './types';
import { Loader2 } from 'lucide-react';

interface RoomFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room?: RoomWithGuest | null;
  onSubmit: (data: RoomFormData) => Promise<void>;
  isSubmitting: boolean;
}

const RoomFormDialog = ({
  open,
  onOpenChange,
  room,
  onSubmit,
  isSubmitting,
}: RoomFormDialogProps) => {
  const isEditing = !!room;
  
  const getInitialAmenities = (): string[] => {
    if (!room?.amenities) return [];
    if (Array.isArray(room.amenities)) return room.amenities.map(a => String(a));
    return Object.keys(room.amenities).filter(key => room.amenities && (room.amenities as Record<string, boolean>)[key]);
  };

  const [formData, setFormData] = useState<RoomFormData>({
    room_number: '',
    room_type: 'Standard',
    floor: 1,
    capacity: 2,
    price_per_night: 0,
    status: 'available',
    description: '',
    image_url: '',
    amenities: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RoomFormData, string>>>({});

  useEffect(() => {
    if (room) {
      setFormData({
        room_number: room.room_number,
        room_type: room.room_type,
        floor: room.floor || 1,
        capacity: room.capacity || 2,
        price_per_night: room.price_per_night,
        status: room.status,
        description: room.description || '',
        image_url: room.image_url || '',
        amenities: getInitialAmenities(),
      });
    } else {
      setFormData({
        room_number: '',
        room_type: 'Standard',
        floor: 1,
        capacity: 2,
        price_per_night: 0,
        status: 'available',
        description: '',
        image_url: '',
        amenities: [],
      });
    }
    setErrors({});
  }, [room, open]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof RoomFormData, string>> = {};
    
    if (!formData.room_number.trim()) {
      newErrors.room_number = 'Room number is required';
    }
    if (formData.floor < 1) {
      newErrors.floor = 'Floor must be at least 1';
    }
    if (formData.capacity < 1 || formData.capacity > 10) {
      newErrors.capacity = 'Capacity must be between 1 and 10';
    }
    if (formData.price_per_night <= 0) {
      newErrors.price_per_night = 'Price must be greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit Room ${room?.room_number}` : 'Add New Room'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the room information below.'
              : 'Fill in the details to add a new room.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room_number">Room Number *</Label>
              <Input
                id="room_number"
                value={formData.room_number}
                onChange={(e) => setFormData(prev => ({ ...prev, room_number: e.target.value }))}
                placeholder="e.g., 101"
                disabled={isEditing}
              />
              {errors.room_number && (
                <p className="text-sm text-destructive">{errors.room_number}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor">Floor *</Label>
              <Input
                id="floor"
                type="number"
                min={1}
                value={formData.floor}
                onChange={(e) => setFormData(prev => ({ ...prev, floor: parseInt(e.target.value) || 1 }))}
              />
              {errors.floor && (
                <p className="text-sm text-destructive">{errors.floor}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="room_type">Room Type *</Label>
              <Select
                value={formData.room_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, room_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (guests) *</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                max={10}
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 2 }))}
              />
              {errors.capacity && (
                <p className="text-sm text-destructive">{errors.capacity}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_per_night">Price per Night ($) *</Label>
              <Input
                id="price_per_night"
                type="number"
                min={0}
                step={0.01}
                value={formData.price_per_night}
                onChange={(e) => setFormData(prev => ({ ...prev, price_per_night: parseFloat(e.target.value) || 0 }))}
              />
              {errors.price_per_night && (
                <p className="text-sm text-destructive">{errors.price_per_night}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_STATUSES.filter(s => s !== 'occupied').map((status) => (
                    <SelectItem key={status} value={status} className="capitalize">
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter room description..."
              rows={3}
            />
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              placeholder="https://example.com/room-image.jpg"
            />
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <Label>Amenities</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {AMENITIES_LIST.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                  />
                  <Label htmlFor={amenity} className="text-sm font-normal cursor-pointer">
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Update Room' : 'Add Room'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RoomFormDialog;
