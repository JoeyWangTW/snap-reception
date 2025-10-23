import React from 'react';
import { CheckInFormData } from '../types/hotel';
import { ConfidenceIndicator } from './ConfidenceIndicator';

interface CheckInFormProps {
  data: CheckInFormData;
  isAI: boolean;
  onUpdate?: (field: string, value: string) => void;
  confidence?: number;
}

export const CheckInForm: React.FC<CheckInFormProps> = ({ 
  data, 
  isAI, 
  onUpdate, 
  confidence = 0 
}) => {
  const handleChange = (field: string, value: string) => {
    if (onUpdate) {
      onUpdate(field, value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Guest Check-In</h3>
        {isAI && <ConfidenceIndicator confidence={confidence} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Guest Name
          </label>
          <input
            type="text"
            value={data.guest_name}
            onChange={(e) => handleChange('guest_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter guest name"
            disabled={isAI}
          />
          {isAI && data.guest_found && (
            <p className="text-xs text-green-600 mt-1">✓ Guest found in database</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reservation Number
          </label>
          <input
            type="text"
            value={data.reservation_number}
            onChange={(e) => handleChange('reservation_number', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Reservation # or guest name"
            disabled={isAI}
          />
          {isAI && data.reservation_found && (
            <p className="text-xs text-green-600 mt-1">✓ Reservation found</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID Type
          </label>
          <select
            value={data.id_type}
            onChange={(e) => handleChange('id_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isAI}
          >
            <option value="">Select ID type</option>
            <option value="driver_license">Driver's License</option>
            <option value="passport">Passport</option>
            <option value="state_id">State ID</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room Number
          </label>
          <input
            type="text"
            value={data.room_number}
            onChange={(e) => handleChange('room_number', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Room assignment"
            disabled={isAI}
          />
        </div>
      </div>

      {/* Guest and Reservation Details */}
      {isAI && (data.guest_data || data.reservation_data) && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <h4 className="font-medium text-blue-800 mb-2">Additional Information</h4>
          {data.guest_data && (
            <div className="text-sm text-blue-700">
              <p><strong>Email:</strong> {data.guest_data.email || 'N/A'}</p>
              <p><strong>Phone:</strong> {data.guest_data.phone || 'N/A'}</p>
            </div>
          )}
          {data.reservation_data && (
            <div className="text-sm text-blue-700 mt-2">
              <p><strong>Check-in:</strong> {data.reservation_data.check_in_date}</p>
              <p><strong>Check-out:</strong> {data.reservation_data.check_out_date}</p>
              <p><strong>Total Amount:</strong> ${data.reservation_data.total_amount}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

