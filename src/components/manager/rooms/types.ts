import { Json } from '@/integrations/supabase/types';

export interface Room {
  id: string;
  room_number: string;
  room_type: string;
  status: string;
  floor: number | null;
  capacity: number | null;
  price_per_night: number;
  amenities: Json | null;
  description: string | null;
  image_url: string | null;
}

export interface RoomWithGuest extends Room {
  currentGuest?: {
    id: string;
    full_name: string;
    phone_number: string | null;
    check_in_date: string;
    check_out_date: string;
  } | null;
}

export interface RoomStats {
  total: number;
  available: number;
  occupied: number;
  maintenance: number;
  cleaning: number;
  occupancyRate: number;
}

export interface RoomFormData {
  room_number: string;
  room_type: string;
  floor: number;
  capacity: number;
  price_per_night: number;
  status: string;
  description: string;
  image_url: string;
  amenities: string[];
}

export const ROOM_TYPES = ['Standard', 'Deluxe', 'Suite'] as const;
export const ROOM_STATUSES = ['available', 'occupied', 'maintenance', 'cleaning'] as const;

export const AMENITIES_LIST = [
  'WiFi',
  'TV',
  'Air Conditioning',
  'Minibar',
  'Balcony',
  'Jacuzzi',
  'Kitchen',
  'Safe',
  'Hair Dryer',
  'Bathtub',
  'Desk',
  'Coffee Maker',
  'Room Service',
  'Ocean View'
] as const;

export const STATUS_CONFIG: Record<string, { 
  label: string; 
  color: string; 
  bgColor: string; 
  borderColor: string;
  badgeBg: string;
}> = {
  available: { 
    label: 'Available', 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-50', 
    borderColor: 'border-emerald-200',
    badgeBg: 'bg-emerald-500'
  },
  occupied: { 
    label: 'Occupied', 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50', 
    borderColor: 'border-blue-200',
    badgeBg: 'bg-blue-500'
  },
  maintenance: { 
    label: 'Maintenance', 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50', 
    borderColor: 'border-orange-200',
    badgeBg: 'bg-orange-500'
  },
  cleaning: { 
    label: 'Cleaning', 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50', 
    borderColor: 'border-yellow-200',
    badgeBg: 'bg-amber-500'
  },
};
