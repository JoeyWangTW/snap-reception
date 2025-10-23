import React from 'react';
import { useHotelStore } from '../store/hotelStore';
import { mockDatabase } from '../data/mockData';

interface AvailabilityWorkflowProps {
  isAI: boolean;
}

export const AvailabilityWorkflow: React.FC<AvailabilityWorkflowProps> = ({ isAI }) => {
  const screen = isAI ? 'ai' : 'manual';
  const { filters, filteredRooms } = useHotelStore((state) => state[screen].availabilityUI);
  const setAvailabilityFilters = useHotelStore((state) => state.setAvailabilityFilters);
  const setFilteredRooms = useHotelStore((state) => state.setFilteredRooms);

  const handleFilterChange = (field: string, value: string) => {
    const newFilters = { [field]: value };
    setAvailabilityFilters(screen, newFilters);

    // Perform search with updated filters
    const updatedFilters = { ...filters, ...newFilters };
    const results = mockDatabase.rooms.findAvailable(
      updatedFilters.check_in_date,
      updatedFilters.check_out_date,
      updatedFilters.room_type
    );

    // Apply additional filters
    const filtered = results.filter((room) => {
      const statusMatch = updatedFilters.status === 'all' || room.status === updatedFilters.status;
      const minPriceMatch = !updatedFilters.min_price || room.price_per_night >= parseFloat(updatedFilters.min_price);
      const maxPriceMatch = !updatedFilters.max_price || room.price_per_night <= parseFloat(updatedFilters.max_price);
      return statusMatch && minPriceMatch && maxPriceMatch;
    });

    setFilteredRooms(screen, filtered);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Room Availability Search</h3>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Check-in Date</label>
          <input
            type="date"
            value={filters.check_in_date}
            onChange={(e) => handleFilterChange('check_in_date', e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Check-out Date</label>
          <input
            type="date"
            value={filters.check_out_date}
            onChange={(e) => handleFilterChange('check_out_date', e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Room Type</label>
          <select
            value={filters.room_type}
            onChange={(e) => handleFilterChange('room_type', e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="any">Any</option>
            <option value="standard">Standard</option>
            <option value="deluxe">Deluxe</option>
            <option value="suite">Suite</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Min Price</label>
          <input
            type="number"
            value={filters.min_price}
            onChange={(e) => handleFilterChange('min_price', e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Max Price</label>
          <input
            type="number"
            value={filters.max_price}
            onChange={(e) => handleFilterChange('max_price', e.target.value)}
            placeholder="999"
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Results */}
      <div>
        <h4 className="font-medium mb-2">Available Rooms ({filteredRooms.length})</h4>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredRooms.length === 0 ? (
            <p className="text-gray-500 text-sm">No rooms match your criteria. Try adjusting the filters.</p>
          ) : (
            filteredRooms.map((room) => (
              <div key={room.id} className="p-3 border rounded hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Room {room.room_number}</p>
                    <p className="text-sm text-gray-600 capitalize">{room.room_type}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Amenities: {room.amenities.join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">${room.price_per_night}/night</p>
                    <p className={`text-xs px-2 py-1 rounded mt-1 ${
                      room.status === 'available' ? 'bg-green-100 text-green-800' :
                      room.status === 'occupied' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {room.status}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
