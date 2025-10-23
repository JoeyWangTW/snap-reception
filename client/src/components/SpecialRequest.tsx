import React, { useState } from 'react';
import { useHotelStore } from '../store/hotelStore';

interface SpecialRequestProps {
  isAI: boolean;
}

export const SpecialRequest: React.FC<SpecialRequestProps> = ({ isAI }) => {
  const screen = isAI ? 'ai' : 'manual';
  const { request_type, room_number, details } = useHotelStore(
    (state) => state[screen].specialRequestUI
  );
  const requestCreated = useHotelStore((state) => state[screen].specialRequestData.request_created);
  const updateSpecialRequestUI = useHotelStore((state) => state.updateSpecialRequestUI);
  const submitSpecialRequest = useHotelStore((state) => state.submitSpecialRequest);

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitSpecialRequest(screen);
    setSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      updateSpecialRequestUI(screen, {
        request_type: '',
        room_number: '',
        details: '',
      });
      setSubmitted(false);
    }, 3000);
  };

  const isFormValid = request_type && room_number && details;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Special Request</h3>

      {submitted && (
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800 font-medium">Request submitted successfully!</p>
          <p className="text-sm text-green-600 mt-1">
            Your request has been sent to the staff and will be processed shortly.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Room Number *</label>
          <input
            type="text"
            value={room_number}
            onChange={(e) => updateSpecialRequestUI(screen, { room_number: e.target.value })}
            placeholder="e.g., 101, 202"
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Request Type *</label>
          <select
            value={request_type}
            onChange={(e) =>
              updateSpecialRequestUI(screen, {
                request_type: e.target.value as any,
              })
            }
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a request type</option>
            <option value="late_checkout">Late Checkout</option>
            <option value="extra_towels">Extra Towels</option>
            <option value="room_service">Room Service</option>
            <option value="maintenance">Maintenance</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Details *</label>
          <textarea
            value={details}
            onChange={(e) => updateSpecialRequestUI(screen, { details: e.target.value })}
            placeholder="Please provide details about your request..."
            rows={5}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Please be as specific as possible to help us fulfill your request.
          </p>
        </div>

        <button
          type="submit"
          disabled={!isFormValid || submitted}
          className={`w-full px-4 py-2 rounded font-medium ${
            isFormValid && !submitted
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {submitted ? 'Request Submitted' : 'Submit Request'}
        </button>
      </form>

      {/* Request Type Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h4 className="font-medium text-blue-900 mb-2">Request Type Information</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>Late Checkout:</strong> Request to extend checkout time</li>
          <li><strong>Extra Towels:</strong> Request additional towels or linens</li>
          <li><strong>Room Service:</strong> Order food, drinks, or amenities</li>
          <li><strong>Maintenance:</strong> Report issues needing repair</li>
          <li><strong>Other:</strong> Any other special request</li>
        </ul>
      </div>
    </div>
  );
};
