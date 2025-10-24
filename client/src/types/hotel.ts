// TypeScript interfaces for hotel management system

export interface Guest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  id_type?: string;
  id_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  room_number: string;
  room_type: 'standard' | 'deluxe' | 'suite';
  amenities: string[];
  price_per_night: number;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: string;
  guest_id: string;
  room_id: string;
  check_in_date: string;
  check_out_date: string;
  status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  special_requests?: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  guest?: Guest;
  room?: Room;
}

export interface SpecialRequest {
  id: string;
  reservation_id: string;
  room_number: string;
  request_type: 'late_checkout' | 'extra_towels' | 'room_service' | 'maintenance' | 'other';
  description: string;
  status: 'pending' | 'approved' | 'completed' | 'denied';
  created_at: string;
  updated_at: string;
}

// Workflow form data structures with UI state
export interface CheckInFormData {
  guest_name: string;
  reservation_number: string;
  id_type: string;
  room_number: string;
  guest_found?: boolean;
  reservation_found?: boolean;
  guest_data?: Guest;
  reservation_data?: Reservation;
}

// Check-in UI state
export interface CheckInUIState {
  searchQuery: string;
  filteredReservations: Reservation[];
  selectedReservation: Reservation | null;
}

export interface AvailabilitySearchData {
  check_in_date: string;
  check_out_date: string;
  room_type: string;
  available_rooms: Room[];
  total_available: number;
}

// Availability UI state
export interface AvailabilityUIState {
  filters: {
    check_in_date: string;
    check_out_date: string;
    room_type: string;
    min_price: string;
    max_price: string;
  };
  filteredRooms: Room[];
}

export interface ReservationModificationData {
  reservation_id: string;
  current_reservation?: Reservation;
  new_check_in_date: string;
  new_check_out_date: string;
  new_room_type: string;
  additional_services: string[];
  modifications: {
    dates_changed: boolean;
    room_type_changed: boolean;
    services_added: boolean;
  };
}

// Modification UI state
export interface ModificationUIState {
  searchQuery: string;
  filteredReservations: Reservation[];
  selectedReservation: Reservation | null;
  editMode: boolean;
  editedData: Partial<Reservation>;
}

export interface SpecialRequestData {
  room_number: string;
  request_type: string;
  details: string;
  request_created?: boolean;
  request_id?: string;
}

// Special Request UI state
export interface SpecialRequestUIState {
  request_type: 'late_checkout' | 'extra_towels' | 'room_service' | 'maintenance' | 'other' | '';
  room_number: string;
  details: string;
}

// Workflow state
export interface WorkflowState {
  currentWorkflow: 'checkin' | 'availability' | 'modification' | 'special_request';
  checkin: CheckInFormData;
  availability: AvailabilitySearchData;
  modification: ReservationModificationData;
  special_request: SpecialRequestData;
  lastUpdated: string;
}

// AI workflow update message
export interface WorkflowUpdateMessage {
  type: 'workflow_update';
  screen: 'ai';
  workflow: string;
  data: any;
  status: string;
  timestamp: string;
}

// Connection state
export interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error?: string;
  transcript: string;
}

