import React from 'react';
import { ReservationModificationData } from '../types/hotel';
import { ConfidenceIndicator } from './ConfidenceIndicator';

interface ReservationModificationProps {
  data: ReservationModificationData;
  isAI: boolean;
  onUpdate?: (field: string, value: any) => void;
  confidence?: number;
}

export const ReservationModification: React.FC<ReservationModificationProps> = ({ 
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Reservation Modification</h3>
        {isAI && <ConfidenceIndicator confidence={confidence} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reservation ID / Guest Name
          </label>
          <input
            type="text"
            value={data.reservation_id}
            onChange={(e) => handleChange('reservation_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Reservation ID or guest name"
            disabled={isAI}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Room Type
          </label>
          <select
            value={data.new_room_type}
            onChange={(e) => handleChange('new_room_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isAI}
          >
            <option value="">Keep current room type</option>
            <option value="standard">Standard</option>
            <option value="deluxe">Deluxe</option>
            <option value="suite">Suite</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Check-in Date
          </label>
          <input
            type="date"
            value={data.new_check_in_date}
            onChange={(e) => handleChange('new_check_in_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isAI}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Check-out Date
          </label>
          <input
            type="date"
            value={data.new_check_out_date}
            onChange={(e) => handleChange('new_check_out_date', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isAI}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Services
        </label>
        <input
          type="text"
          value={data.additional_services.join(', ')}
          onChange={(e) => handleChange('additional_services', e.target.value.split(', ').filter(s => s.trim()))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Room service, late checkout, etc."
          disabled={isAI}
        />
      </div>

      {/* Current Reservation Details */}
      {isAI && data.current_reservation && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <h4 className="font-medium text-blue-800 mb-2">Current Reservation</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Guest:</strong> {data.current_reservation.guest?.name || 'N/A'}</p>
            <p><strong>Room:</strong> {data.current_reservation.room?.room_number || 'N/A'} ({data.current_reservation.room?.room_type || 'N/A'})</p>
            <p><strong>Check-in:</strong> {formatDate(data.current_reservation.check_in_date)}</p>
            <p><strong>Check-out:</strong> {formatDate(data.current_reservation.check_out_date)}</p>
            <p><strong>Status:</strong> {data.current_reservation.status}</p>
            <p><strong>Total Amount:</strong> ${data.current_reservation.total_amount}</p>
          </div>
        </div>
      )}

      {/* Modification Summary */}
      {isAI && data.modifications && (
        <div className="mt-4 p-3 bg-green-50 rounded-md">
          <h4 className="font-medium text-green-800 mb-2">Proposed Changes</h4>
          <div className="text-sm text-green-700 space-y-1">
            {data.modifications.dates_changed && (
              <p>✓ Dates will be updated</p>
            )}
            {data.modifications.room_type_changed && (
              <p>✓ Room type will be changed</p>
            )}
            {data.modifications.services_added && (
              <p>✓ Additional services will be added</p>
            )}
            {!data.modifications.dates_changed && !data.modifications.room_type_changed && !data.modifications.services_added && (
              <p>No changes detected</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

