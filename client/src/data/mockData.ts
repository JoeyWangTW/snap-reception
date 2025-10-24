// Mock data for local frontend development
import { Guest, Room, Reservation, SpecialRequest } from '../types/hotel';

export const mockGuests: Guest[] = [
  {
    id: 'guest-1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0101',
    id_type: 'passport',
    id_number: 'P12345678',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'guest-2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1-555-0102',
    id_type: 'drivers_license',
    id_number: 'DL987654',
    created_at: '2024-02-20T14:30:00Z',
    updated_at: '2024-02-20T14:30:00Z',
  },
  {
    id: 'guest-3',
    name: 'Michael Chen',
    email: 'mchen@email.com',
    phone: '+1-555-0103',
    id_type: 'passport',
    id_number: 'P87654321',
    created_at: '2024-03-10T09:15:00Z',
    updated_at: '2024-03-10T09:15:00Z',
  },
  {
    id: 'guest-4',
    name: 'Emily Rodriguez',
    email: 'emily.r@email.com',
    phone: '+1-555-0104',
    id_type: 'passport',
    id_number: 'P45678912',
    created_at: '2024-03-12T16:45:00Z',
    updated_at: '2024-03-12T16:45:00Z',
  },
];

export const mockRooms: Room[] = [
  {
    id: 'room-1',
    room_number: '101',
    room_type: 'standard',
    amenities: ['wifi', 'tv', 'minibar'],
    price_per_night: 120,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'room-2',
    room_number: '102',
    room_type: 'standard',
    amenities: ['wifi', 'tv', 'minibar'],
    price_per_night: 120,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'room-3',
    room_number: '201',
    room_type: 'deluxe',
    amenities: ['wifi', 'tv', 'minibar', 'balcony', 'jacuzzi'],
    price_per_night: 200,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'room-4',
    room_number: '202',
    room_type: 'deluxe',
    amenities: ['wifi', 'tv', 'minibar', 'balcony', 'jacuzzi'],
    price_per_night: 200,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'room-5',
    room_number: '301',
    room_type: 'suite',
    amenities: ['wifi', 'tv', 'minibar', 'balcony', 'jacuzzi', 'kitchen', 'living_room'],
    price_per_night: 350,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'room-6',
    room_number: '302',
    room_type: 'suite',
    amenities: ['wifi', 'tv', 'minibar', 'balcony', 'jacuzzi', 'kitchen', 'living_room'],
    price_per_night: 350,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'room-7',
    room_number: '103',
    room_type: 'standard',
    amenities: ['wifi', 'tv'],
    price_per_night: 100,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'room-8',
    room_number: '203',
    room_type: 'deluxe',
    amenities: ['wifi', 'tv', 'minibar', 'balcony'],
    price_per_night: 180,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

export const mockReservations: Reservation[] = [
  {
    id: 'res-1',
    guest_id: 'guest-1',
    room_id: 'room-2',
    check_in_date: '2025-10-22',
    check_out_date: '2025-10-25',
    status: 'checked_in',
    special_requests: 'Late checkout requested',
    total_amount: 360,
    created_at: '2025-10-15T10:00:00Z',
    updated_at: '2025-10-22T10:00:00Z',
    guest: mockGuests[0],
    room: mockRooms[1],
  },
  {
    id: 'res-2',
    guest_id: 'guest-2',
    room_id: 'room-4',
    check_in_date: '2025-10-20',
    check_out_date: '2025-10-27',
    status: 'checked_in',
    special_requests: 'Extra pillows',
    total_amount: 1400,
    created_at: '2025-10-10T14:30:00Z',
    updated_at: '2025-10-20T15:00:00Z',
    guest: mockGuests[1],
    room: mockRooms[3],
  },
  {
    id: 'res-3',
    guest_id: 'guest-3',
    room_id: 'room-1',
    check_in_date: '2025-10-25',
    check_out_date: '2025-10-28',
    status: 'confirmed',
    total_amount: 360,
    created_at: '2025-10-18T09:15:00Z',
    updated_at: '2025-10-18T09:15:00Z',
    guest: mockGuests[2],
    room: mockRooms[0],
  },
  {
    id: 'res-4',
    guest_id: 'guest-4',
    room_id: 'room-3',
    check_in_date: '2025-10-23',
    check_out_date: '2025-10-26',
    status: 'confirmed',
    special_requests: 'Quiet room preferred',
    total_amount: 600,
    created_at: '2025-10-16T16:45:00Z',
    updated_at: '2025-10-16T16:45:00Z',
    guest: mockGuests[3],
    room: mockRooms[2],
  },
];

export const mockSpecialRequests: SpecialRequest[] = [
  {
    id: 'req-1',
    reservation_id: 'res-1',
    room_number: '102',
    request_type: 'late_checkout',
    description: 'Guest requests checkout at 2 PM instead of 11 AM',
    status: 'pending',
    created_at: '2024-03-16T10:30:00Z',
    updated_at: '2024-03-16T10:30:00Z',
  },
  {
    id: 'req-2',
    reservation_id: 'res-2',
    room_number: '202',
    request_type: 'extra_towels',
    description: 'Guest needs 4 extra towels',
    status: 'completed',
    created_at: '2024-03-21T08:15:00Z',
    updated_at: '2024-03-21T09:00:00Z',
  },
  {
    id: 'req-3',
    reservation_id: 'res-2',
    room_number: '202',
    request_type: 'room_service',
    description: 'Continental breakfast at 8 AM',
    status: 'approved',
    created_at: '2024-03-22T20:00:00Z',
    updated_at: '2024-03-22T20:15:00Z',
  },
];

// Helper functions for mock data operations
export const mockDatabase = {
  guests: {
    findByName: (name: string): Guest | undefined => {
      return mockGuests.find(g =>
        g.name.toLowerCase().includes(name.toLowerCase())
      );
    },
    findById: (id: string): Guest | undefined => {
      return mockGuests.find(g => g.id === id);
    },
  },

  rooms: {
    findByNumber: (roomNumber: string): Room | undefined => {
      return mockRooms.find(r => r.room_number === roomNumber);
    },
    findAvailable: (checkIn: string, checkOut: string, roomType?: string): Room[] => {
      // Check which rooms have overlapping reservations for the given date range
      if (!checkIn || !checkOut) {
        // If no dates provided, return all rooms filtered by type
        return mockRooms.filter(r => {
          const typeMatch = !roomType || roomType === 'any' || r.room_type === roomType;
          return typeMatch;
        });
      }

      const requestedCheckIn = new Date(checkIn);
      const requestedCheckOut = new Date(checkOut);

      // Get all room IDs that have overlapping reservations
      const occupiedRoomIds = new Set(
        mockReservations
          .filter(reservation => {
            const resCheckIn = new Date(reservation.check_in_date);
            const resCheckOut = new Date(reservation.check_out_date);

            // Check if reservation overlaps with requested dates
            // Overlap occurs when: resCheckIn < requestedCheckOut AND resCheckOut > requestedCheckIn
            return resCheckIn < requestedCheckOut && resCheckOut > requestedCheckIn;
          })
          .map(reservation => reservation.room_id)
      );

      // Return rooms that are NOT occupied during the requested period
      return mockRooms.filter(r => {
        const isAvailable = !occupiedRoomIds.has(r.id);
        const typeMatch = !roomType || roomType === 'any' || r.room_type === roomType;
        return isAvailable && typeMatch;
      });
    },
  },

  reservations: {
    findAll: (): Reservation[] => {
      return mockReservations;
    },
    findByGuestName: (guestName: string): Reservation | undefined => {
      const guest = mockDatabase.guests.findByName(guestName);
      if (!guest) return undefined;
      return mockReservations.find(r => r.guest_id === guest.id);
    },
    findById: (id: string): Reservation | undefined => {
      return mockReservations.find(r => r.id === id);
    },
    findByReservationNumber: (reservationNumber: string): Reservation | undefined => {
      // In real app, reservation_number would be a field, but for mock we use id
      return mockReservations.find(r => r.id === reservationNumber);
    },
  },

  specialRequests: {
    create: (data: Omit<SpecialRequest, 'id' | 'created_at' | 'updated_at'>): SpecialRequest => {
      const newRequest: SpecialRequest = {
        ...data,
        id: `req-${mockSpecialRequests.length + 1}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockSpecialRequests.push(newRequest);
      return newRequest;
    },
  },
};

// Generate AI-like workflow updates for testing
export const generateMockAIUpdate = (workflow: string) => {
  const timestamp = new Date().toISOString();

  switch (workflow) {
    case 'checkin':
      return {
        workflow: 'checkin',
        data: {
          guest_name: 'John Smith',
          reservation_number: 'res-1',
          id_type: 'passport',
          room_number: '102',
        },
        status: 'ready',
        timestamp,
      };

    case 'availability':
      return {
        workflow: 'availability',
        data: {
          check_in_date: '2025-10-24',
          check_out_date: '2025-10-27',
          room_type: 'deluxe',
          available_rooms: mockDatabase.rooms.findAvailable('2025-10-24', '2025-10-27', 'deluxe'),
          total_available: 2,
        },
        status: 'ready',
        timestamp,
      };

    case 'modification':
      return {
        workflow: 'modification',
        data: {
          reservation_id: 'res-1',
          new_check_in_date: '2024-03-15',
          new_check_out_date: '2024-03-20',
          new_room_type: 'deluxe',
          additional_services: ['breakfast'],
          modifications: {
            dates_changed: true,
            room_type_changed: true,
            services_added: true,
          },
        },
        status: 'ready',
        timestamp,
      };

    case 'special_request':
      return {
        workflow: 'special_request',
        data: {
          room_number: '102',
          request_type: 'late_checkout',
          details: 'Guest requests checkout at 2 PM',
        },
        status: 'ready',
        timestamp,
      };

    default:
      return null;
  }
};
