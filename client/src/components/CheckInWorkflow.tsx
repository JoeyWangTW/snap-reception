import React from 'react';
import { useHotelStore } from '../store/hotelStore';
import { mockDatabase } from '../data/mockData';
import { Reservation } from '../types/hotel';

interface CheckInWorkflowProps {
  isAI: boolean;
}

export const CheckInWorkflow: React.FC<CheckInWorkflowProps> = ({ isAI }) => {
  const screen = isAI ? 'ai' : 'manual';

  // Read from global state - NO LOCAL STATE!
  const { searchQuery, filteredReservations, selectedReservation } = useHotelStore(
    (state) => state[screen].checkinUI
  );

  // Actions from store
  const setCheckInSearch = useHotelStore((state) => state.setCheckInSearch);
  const selectCheckInReservation = useHotelStore((state) => state.selectCheckInReservation);

  const performSearch = (query: string) => {
    if (!query.trim()) {
      setCheckInSearch(screen, query, []);
      return;
    }

    const results = mockDatabase.reservations.findAll().filter((reservation) => {
      const guestNameMatch = reservation.guest?.name
        .toLowerCase()
        .includes(query.toLowerCase());
      const reservationIdMatch = reservation.id.toLowerCase().includes(query.toLowerCase());
      const roomMatch = reservation.room?.room_number.includes(query);

      return guestNameMatch || reservationIdMatch || roomMatch;
    });

    setCheckInSearch(screen, query, results);

    // Auto-select first result for AI
    if (isAI && results.length > 0 && !selectedReservation) {
      selectCheckInReservation(screen, results[0]);
    }
  };

  const handleSearchChange = (value: string) => {
    performSearch(value);
  };

  const handleSelectReservation = (reservation: Reservation) => {
    selectCheckInReservation(screen, reservation);
  };

  const handleCheckIn = () => {
    if (selectedReservation) {
      alert(
        `Checking in ${selectedReservation.guest?.name} to room ${selectedReservation.room?.room_number}`
      );
    }
  };

  // Auto-search when data is populated (for AI screen)
  React.useEffect(() => {
    if (isAI && searchQuery && filteredReservations.length === 0) {
      performSearch(searchQuery);
    }
  }, [searchQuery, isAI]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Check-In - Find Reservation</h3>

      {/* Search Bar */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search by Guest Name, Reservation ID, or Room Number
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter guest name, reservation ID, or room number..."
          disabled={isAI}
        />
      </div>

      {/* Search Results */}
      {filteredReservations.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Found {filteredReservations.length} reservation
            {filteredReservations.length !== 1 ? 's' : ''}
          </h4>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredReservations.map((reservation) => (
              <div
                key={reservation.id}
                onClick={() => !isAI && handleSelectReservation(reservation)}
                className={`p-3 border rounded-md transition-all ${
                  selectedReservation?.id === reservation.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                } ${!isAI ? 'cursor-pointer' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-800">{reservation.guest?.name}</h5>
                    <p className="text-sm text-gray-600">
                      Room {reservation.room?.room_number} • {reservation.room?.room_type}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {reservation.check_in_date} → {reservation.check_out_date}
                    </p>
                    {reservation.special_requests && (
                      <p className="text-xs text-gray-500 italic mt-1">
                        "{reservation.special_requests}"
                      </p>
                    )}
                  </div>
                  <div className="ml-4">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        reservation.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : reservation.status === 'checked_in'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {reservation.status}
                    </span>
                    <p className="text-sm font-medium text-gray-800 mt-2">
                      ${reservation.total_amount}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {searchQuery && filteredReservations.length === 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800">No reservations found for "{searchQuery}"</p>
          <p className="text-sm text-yellow-700 mt-1">
            Try searching by guest name or reservation ID
          </p>
        </div>
      )}

      {/* Selected Reservation Details */}
      {selectedReservation && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <h4 className="font-semibold text-green-800 mb-3">Selected Reservation</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Guest Name</p>
              <p className="font-medium">{selectedReservation.guest?.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{selectedReservation.guest?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">Phone</p>
              <p className="font-medium">{selectedReservation.guest?.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-600">ID Type</p>
              <p className="font-medium capitalize">
                {selectedReservation.guest?.id_type?.replace('_', ' ') || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Room Number</p>
              <p className="font-medium">{selectedReservation.room?.room_number}</p>
            </div>
            <div>
              <p className="text-gray-600">Room Type</p>
              <p className="font-medium capitalize">{selectedReservation.room?.room_type}</p>
            </div>
            <div>
              <p className="text-gray-600">Check-in Date</p>
              <p className="font-medium">{selectedReservation.check_in_date}</p>
            </div>
            <div>
              <p className="text-gray-600">Check-out Date</p>
              <p className="font-medium">{selectedReservation.check_out_date}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-600">Total Amount</p>
              <p className="font-medium text-lg">${selectedReservation.total_amount}</p>
            </div>
          </div>

          {!isAI && selectedReservation.status === 'confirmed' && (
            <button
              onClick={handleCheckIn}
              className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
            >
              Complete Check-In
            </button>
          )}
        </div>
      )}
    </div>
  );
};
