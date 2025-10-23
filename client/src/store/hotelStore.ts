import { create } from 'zustand';
import {
  CheckInFormData,
  AvailabilitySearchData,
  ReservationModificationData,
  SpecialRequestData,
  CheckInUIState,
  AvailabilityUIState,
  ModificationUIState,
  SpecialRequestUIState,
  Reservation,
  Room
} from '../types/hotel';
import { mockReservations } from '../data/mockData';

// Combined workflow state with UI state
interface WorkflowWithUI {
  currentWorkflow: 'checkin' | 'availability' | 'modification' | 'special_request';

  // Data
  checkinData: CheckInFormData;
  availabilityData: AvailabilitySearchData;
  modificationData: ReservationModificationData;
  specialRequestData: SpecialRequestData;

  // UI State
  checkinUI: CheckInUIState;
  availabilityUI: AvailabilityUIState;
  modificationUI: ModificationUIState;
  specialRequestUI: SpecialRequestUIState;

  lastUpdated: string;
}

interface HotelStore {
  // State separation
  manual: WorkflowWithUI;
  ai: WorkflowWithUI;

  // Actions
  setManualWorkflow: (workflow: 'checkin' | 'availability' | 'modification' | 'special_request') => void;

  // Check-in actions
  setCheckInSearch: (screen: 'manual' | 'ai', query: string, results: Reservation[]) => void;
  selectCheckInReservation: (screen: 'manual' | 'ai', reservation: Reservation | null) => void;

  // Availability actions
  setAvailabilityFilters: (screen: 'manual' | 'ai', filters: Partial<AvailabilityUIState['filters']>) => void;
  setFilteredRooms: (screen: 'manual' | 'ai', rooms: Room[]) => void;

  // Modification actions
  setModificationSearch: (screen: 'manual' | 'ai', query: string, results: Reservation[]) => void;
  selectModificationReservation: (screen: 'manual' | 'ai', reservation: Reservation | null) => void;
  setModificationEditMode: (screen: 'manual' | 'ai', editMode: boolean) => void;
  updateModificationEdit: (screen: 'manual' | 'ai', data: Partial<Reservation>) => void;

  // Special Request actions
  updateSpecialRequestUI: (screen: 'manual' | 'ai', data: Partial<SpecialRequestUIState>) => void;
  submitSpecialRequest: (screen: 'manual' | 'ai') => void;

  // AI update (from backend)
  updateAI: (workflow: string, data: any) => void;

  // Pull from AI
  pullFromAI: () => void;

  // Reset
  resetStates: () => void;

  // UI state
  isAIDataReady: boolean;
  setAIDataReady: (ready: boolean) => void;
}

const initialWorkflowState: WorkflowWithUI = {
  currentWorkflow: 'checkin',

  checkinData: {
    guest_name: '',
    reservation_number: '',
    id_type: '',
    room_number: '',
  },
  availabilityData: {
    check_in_date: '',
    check_out_date: '',
    room_type: 'any',
    preferences: [],
    available_rooms: [],
    total_available: 0,
  },
  modificationData: {
    reservation_id: '',
    new_check_in_date: '',
    new_check_out_date: '',
    new_room_type: '',
    additional_services: [],
    modifications: {
      dates_changed: false,
      room_type_changed: false,
      services_added: false,
    },
  },
  specialRequestData: {
    room_number: '',
    request_type: '',
    details: '',
  },

  checkinUI: {
    searchQuery: '',
    filteredReservations: [],
    selectedReservation: null,
  },
  availabilityUI: {
    filters: {
      check_in_date: '',
      check_out_date: '',
      room_type: 'any',
      status: 'available',
      min_price: '',
      max_price: '',
    },
    filteredRooms: [],
  },
  modificationUI: {
    searchQuery: '',
    filteredReservations: [],
    selectedReservation: null,
    editMode: false,
    editedData: {},
  },
  specialRequestUI: {
    request_type: '',
    room_number: '',
    details: '',
  },

  lastUpdated: '',
};

export const useHotelStore = create<HotelStore>((set, get) => ({
  // Initial state
  manual: { ...initialWorkflowState },
  ai: { ...initialWorkflowState },
  isAIDataReady: false,

  // Set manual workflow
  setManualWorkflow: (workflow) => {
    set((state) => ({
      manual: {
        ...state.manual,
        currentWorkflow: workflow,
        lastUpdated: new Date().toISOString(),
      },
    }));
  },

  // Check-in actions
  setCheckInSearch: (screen, query, results) => {
    set((state) => ({
      [screen]: {
        ...state[screen],
        checkinUI: {
          ...state[screen].checkinUI,
          searchQuery: query,
          filteredReservations: results,
        },
        checkinData: {
          ...state[screen].checkinData,
          guest_name: query,
        },
        lastUpdated: new Date().toISOString(),
      },
    }));
  },

  selectCheckInReservation: (screen, reservation) => {
    set((state) => ({
      [screen]: {
        ...state[screen],
        checkinUI: {
          ...state[screen].checkinUI,
          selectedReservation: reservation,
        },
        checkinData: {
          ...state[screen].checkinData,
          reservation_number: reservation?.id || '',
          guest_name: reservation?.guest?.name || '',
          room_number: reservation?.room?.room_number || '',
        },
        lastUpdated: new Date().toISOString(),
      },
    }));
  },

  // Availability actions
  setAvailabilityFilters: (screen, filters) => {
    set((state) => ({
      [screen]: {
        ...state[screen],
        availabilityUI: {
          ...state[screen].availabilityUI,
          filters: {
            ...state[screen].availabilityUI.filters,
            ...filters,
          },
        },
        availabilityData: {
          ...state[screen].availabilityData,
          check_in_date: filters.check_in_date || state[screen].availabilityData.check_in_date,
          check_out_date: filters.check_out_date || state[screen].availabilityData.check_out_date,
          room_type: filters.room_type || state[screen].availabilityData.room_type,
        },
        lastUpdated: new Date().toISOString(),
      },
    }));
  },

  setFilteredRooms: (screen, rooms) => {
    set((state) => ({
      [screen]: {
        ...state[screen],
        availabilityUI: {
          ...state[screen].availabilityUI,
          filteredRooms: rooms,
        },
        availabilityData: {
          ...state[screen].availabilityData,
          available_rooms: rooms,
          total_available: rooms.length,
        },
        lastUpdated: new Date().toISOString(),
      },
    }));
  },

  // Modification actions
  setModificationSearch: (screen, query, results) => {
    set((state) => ({
      [screen]: {
        ...state[screen],
        modificationUI: {
          ...state[screen].modificationUI,
          searchQuery: query,
          filteredReservations: results,
        },
        modificationData: {
          ...state[screen].modificationData,
          reservation_id: query,
        },
        lastUpdated: new Date().toISOString(),
      },
    }));
  },

  selectModificationReservation: (screen, reservation) => {
    set((state) => ({
      [screen]: {
        ...state[screen],
        modificationUI: {
          ...state[screen].modificationUI,
          selectedReservation: reservation,
          editedData: reservation ? {
            check_in_date: reservation.check_in_date,
            check_out_date: reservation.check_out_date,
            room_id: reservation.room_id,
            special_requests: reservation.special_requests,
          } : {},
        },
        modificationData: {
          ...state[screen].modificationData,
          current_reservation: reservation || undefined,
        },
        lastUpdated: new Date().toISOString(),
      },
    }));
  },

  setModificationEditMode: (screen, editMode) => {
    set((state) => ({
      [screen]: {
        ...state[screen],
        modificationUI: {
          ...state[screen].modificationUI,
          editMode,
        },
      },
    }));
  },

  updateModificationEdit: (screen, data) => {
    set((state) => ({
      [screen]: {
        ...state[screen],
        modificationUI: {
          ...state[screen].modificationUI,
          editedData: {
            ...state[screen].modificationUI.editedData,
            ...data,
          },
        },
        lastUpdated: new Date().toISOString(),
      },
    }));
  },

  // Special Request actions
  updateSpecialRequestUI: (screen, data) => {
    set((state) => ({
      [screen]: {
        ...state[screen],
        specialRequestUI: {
          ...state[screen].specialRequestUI,
          ...data,
        },
        specialRequestData: {
          ...state[screen].specialRequestData,
          ...data,
        },
        lastUpdated: new Date().toISOString(),
      },
    }));
  },

  submitSpecialRequest: (screen) => {
    const { specialRequestUI } = get()[screen];
    console.log('Submitting special request:', specialRequestUI);
    // In a real app, this would send the request to the backend
    set((state) => ({
      [screen]: {
        ...state[screen],
        specialRequestData: {
          ...state[screen].specialRequestData,
          request_created: true,
          request_id: `req-${Date.now()}`,
        },
      },
    }));
  },

  // Update AI state (from backend)
  updateAI: (workflow, data) => {
    set((state) => {
      const newState = { ...state.ai };
      newState.currentWorkflow = workflow as any;
      newState.lastUpdated = new Date().toISOString();

      // Update data and populate UI state based on workflow
      if (workflow === 'checkin') {
        newState.checkinData = { ...state.ai.checkinData, ...data };
        // Auto-populate UI state for checkin
        if (data.guest_name) {
          const { reservations } = get().manual; // Use manual's mock database access
          const results = mockReservations.filter(r =>
            r.guest?.name.toLowerCase().includes(data.guest_name.toLowerCase())
          );
          newState.checkinUI = {
            searchQuery: data.guest_name,
            filteredReservations: results,
            selectedReservation: results.find(r => r.id === data.reservation_number) || results[0] || null,
          };
        }
      } else if (workflow === 'availability') {
        newState.availabilityData = { ...state.ai.availabilityData, ...data };
        // Auto-populate UI state for availability
        newState.availabilityUI = {
          filters: {
            check_in_date: data.check_in_date || '',
            check_out_date: data.check_out_date || '',
            room_type: data.room_type || 'any',
            status: 'available',
            min_price: '',
            max_price: '',
          },
          filteredRooms: data.available_rooms || [],
        };
      } else if (workflow === 'modification') {
        newState.modificationData = { ...state.ai.modificationData, ...data };
        // Auto-populate UI state for modification
        if (data.reservation_id) {
          const reservation = mockReservations.find(r => r.id === data.reservation_id);
          newState.modificationUI = {
            searchQuery: data.reservation_id,
            filteredReservations: reservation ? [reservation] : [],
            selectedReservation: reservation || null,
            editMode: false,
            editedData: reservation ? {
              check_in_date: data.new_check_in_date || reservation.check_in_date,
              check_out_date: data.new_check_out_date || reservation.check_out_date,
              room_id: reservation.room_id,
              special_requests: reservation.special_requests,
            } : {},
          };
        }
      } else if (workflow === 'special_request') {
        newState.specialRequestData = { ...state.ai.specialRequestData, ...data };
        // Auto-populate UI state for special request
        newState.specialRequestUI = {
          request_type: data.request_type || '',
          room_number: data.room_number || '',
          details: data.details || '',
        };
      }

      return {
        ai: newState,
        isAIDataReady: true,
      };
    });
  },

  // Pull from AI - ONE LINE!
  pullFromAI: () => {
    const { ai } = get();
    set({
      manual: { ...ai },
      isAIDataReady: false
    });
  },

  // Reset states
  resetStates: () => {
    set({
      manual: { ...initialWorkflowState },
      ai: { ...initialWorkflowState },
      isAIDataReady: false,
    });
  },

  // Set AI data ready state
  setAIDataReady: (ready) => {
    set({ isAIDataReady: ready });
  },
}));
