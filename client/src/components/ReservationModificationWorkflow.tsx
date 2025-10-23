import React from 'react';
import { useHotelStore } from '../store/hotelStore';
import { mockReservations } from '../data/mockData';

interface ReservationModificationWorkflowProps {
  isAI: boolean;
}

export const ReservationModificationWorkflow: React.FC<ReservationModificationWorkflowProps> = ({
  isAI,
}) => {
  const screen = isAI ? 'ai' : 'manual';
  const { searchQuery, filteredReservations, selectedReservation, editMode, editedData } = useHotelStore(
    (state) => state[screen].modificationUI
  );
  const setModificationSearch = useHotelStore((state) => state.setModificationSearch);
  const selectModificationReservation = useHotelStore((state) => state.selectModificationReservation);
  const setModificationEditMode = useHotelStore((state) => state.setModificationEditMode);
  const updateModificationEdit = useHotelStore((state) => state.updateModificationEdit);

  const handleSearch = (query: string) => {
    const results = mockReservations.filter(
      (r) =>
        r.id.toLowerCase().includes(query.toLowerCase()) ||
        r.guest?.name.toLowerCase().includes(query.toLowerCase()) ||
        r.room?.room_number.includes(query)
    );
    setModificationSearch(screen, query, results);
  };

  const handleEditField = (field: string, value: string) => {
    updateModificationEdit(screen, { [field]: value });
  };

  const handleSaveChanges = () => {
    console.log('Saving reservation changes:', editedData);
    setModificationEditMode(screen, false);
    // In a real app, this would send data to backend
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Reservation Modification</h3>

      {/* Search */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Search by Reservation ID, Guest Name, or Room Number
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Enter reservation ID, guest name, or room number..."
          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Search Results */}
      {searchQuery && filteredReservations.length > 0 && !selectedReservation && (
        <div>
          <h4 className="font-medium mb-2">Search Results</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredReservations.map((reservation) => (
              <div
                key={reservation.id}
                onClick={() => selectModificationReservation(screen, reservation)}
                className="p-3 border rounded hover:bg-blue-50 cursor-pointer"
              >
                <p className="font-medium">{reservation.guest?.name}</p>
                <p className="text-sm text-gray-600">
                  Reservation: {reservation.id} | Room: {reservation.room?.room_number}
                </p>
                <p className="text-sm text-gray-500">
                  {reservation.check_in_date} to {reservation.check_out_date}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Reservation */}
      {selectedReservation && (
        <div className="border rounded p-4 bg-gray-50">
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-medium">Selected Reservation</h4>
            <button
              onClick={() => selectModificationReservation(screen, null)}
              className="text-sm text-blue-600 hover:underline"
            >
              Clear Selection
            </button>
          </div>

          {!editMode ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Guest</p>
                  <p>{selectedReservation.guest?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Reservation ID</p>
                  <p>{selectedReservation.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Room</p>
                  <p>
                    {selectedReservation.room?.room_number} ({selectedReservation.room?.room_type})
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className="capitalize">{selectedReservation.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Check-in</p>
                  <p>{selectedReservation.check_in_date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Check-out</p>
                  <p>{selectedReservation.check_out_date}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-600">Special Requests</p>
                  <p>{selectedReservation.special_requests || 'None'}</p>
                </div>
              </div>

              <button
                onClick={() => setModificationEditMode(screen, true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit Reservation
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Check-in Date</label>
                  <input
                    type="date"
                    value={editedData.check_in_date || ''}
                    onChange={(e) => handleEditField('check_in_date', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Check-out Date</label>
                  <input
                    type="date"
                    value={editedData.check_out_date || ''}
                    onChange={(e) => handleEditField('check_out_date', e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Special Requests</label>
                  <textarea
                    value={editedData.special_requests || ''}
                    onChange={(e) => handleEditField('special_requests', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveChanges}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setModificationEditMode(screen, false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {searchQuery && filteredReservations.length === 0 && (
        <p className="text-gray-500 text-sm">No reservations found matching "{searchQuery}"</p>
      )}
    </div>
  );
};
