import React from 'react';
import { AvailabilitySearchData, Room } from '../types/hotel';
import { ConfidenceIndicator } from './ConfidenceIndicator';

interface AvailabilitySearchProps {
  data: AvailabilitySearchData;
  isAI: boolean;
  onUpdate?: (field: string, value: any) => void;
  confidence?: number;
}

export const AvailabilitySearch: React.FC<AvailabilitySearchProps> = ({ 
  data, 
  isAI, 
  onUpdate, 
  confidence = 0 
}) => {
  const handleChange = (field: string, value: any) => {
    if (onUpdate) {
      onUpdate(field, value);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Room Availability Search</h3>
        {isAI && <ConfidenceIndicator confidence={confidence} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-in Date
          </label>
          <input
            type="date"
            value={data.check_in_date}
            onChange={(e) => handleChange('check_in_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isAI}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-out Date
          </label>
          <input
            type="date"
            value={data.check_out_date}
            onChange={(e) => handleChange('check_out_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isAI}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room Type
          </label>
          <select
            value={data.room_type}
            onChange={(e) => handleChange('room_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isAI}
          >
            <option value="any">Any Room Type</option>
            <option value="standard">Standard</option>
            <option value="deluxe">Deluxe</option>
            <option value="suite">Suite</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preferences
          </label>
          <input
            type="text"
            value={data.preferences.join(', ')}
            onChange={(e) => handleChange('preferences', e.target.value.split(', ').filter(p => p.trim()))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ocean view, balcony, etc."
            disabled={isAI}
          />
        </div>
      </div>

      {/* Search Results */}
      {isAI && data.available_rooms.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-800">
              Available Rooms ({data.total_available})
            </h4>
            <span className="text-sm text-green-600">✓ Search completed</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.available_rooms.map((room: Room) => (
              <div key={room.id} className="p-3 border border-gray-200 rounded-md bg-white">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-800">Room {room.room_number}</h5>
                  <span className="text-sm font-medium text-blue-600">
                    {formatPrice(room.price_per_night)}/night
                  </span>
                </div>
                <p className="text-sm text-gray-600 capitalize mb-2">{room.room_type}</p>
                <div className="text-xs text-gray-500">
                  <p>Amenities: {room.amenities.join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isAI && data.available_rooms.length === 0 && data.check_in_date && data.check_out_date && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-md">
          <p className="text-yellow-800">No rooms available for the selected dates.</p>
          <p className="text-sm text-yellow-700 mt-1">Try different dates or room types.</p>
        </div>
      )}
    </div>
  );
};

