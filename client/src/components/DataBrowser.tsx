import { useState } from 'react';
import { mockGuests, mockRooms, mockReservations, mockSpecialRequests } from '../data/mockData';

type DataView = 'guests' | 'rooms' | 'reservations' | 'requests';

export function DataBrowser() {
  const [currentView, setCurrentView] = useState<DataView>('guests');
  const [isExpanded, setIsExpanded] = useState(false);

  const renderGuests = () => (
    <div className="space-y-2">
      {mockGuests.map((guest) => (
        <div key={guest.id} className="p-3 bg-white border border-gray-200 rounded-md hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-gray-800">{guest.name}</h4>
              <p className="text-sm text-gray-600">{guest.email}</p>
              <p className="text-sm text-gray-600">{guest.phone}</p>
            </div>
            <div className="text-xs text-gray-500">
              <p>{guest.id_type}: {guest.id_number}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderRooms = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {mockRooms.map((room) => (
        <div key={room.id} className="p-3 bg-white border border-gray-200 rounded-md hover:shadow-sm transition-shadow">
          <div className="mb-2">
            <h4 className="font-semibold text-gray-800">Room {room.room_number}</h4>
            <p className="text-sm text-gray-600 capitalize">{room.room_type}</p>
          </div>
          <p className="text-sm font-medium text-blue-600">${room.price_per_night}/night</p>
          <p className="text-xs text-gray-500 mt-1">
            Amenities: {room.amenities.join(', ')}
          </p>
        </div>
      ))}
    </div>
  );

  const renderReservations = () => (
    <div className="space-y-2">
      {mockReservations.map((reservation) => (
        <div key={reservation.id} className="p-3 bg-white border border-gray-200 rounded-md hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-semibold text-gray-800">{reservation.guest?.name}</h4>
              <p className="text-sm text-gray-600">Room {reservation.room?.room_number} ({reservation.room?.room_type})</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded ${
              reservation.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
              reservation.status === 'checked_in' ? 'bg-green-100 text-green-800' :
              reservation.status === 'checked_out' ? 'bg-gray-100 text-gray-800' :
              'bg-red-100 text-red-800'
            }`}>
              {reservation.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div>
              <p className="text-xs text-gray-500">Check-in</p>
              <p>{reservation.check_in_date}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Check-out</p>
              <p>{reservation.check_out_date}</p>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-800 mt-2">
            Total: ${reservation.total_amount}
          </p>
          {reservation.special_requests && (
            <p className="text-xs text-gray-500 mt-1 italic">
              "{reservation.special_requests}"
            </p>
          )}
        </div>
      ))}
    </div>
  );

  const renderRequests = () => (
    <div className="space-y-2">
      {mockSpecialRequests.map((request) => (
        <div key={request.id} className="p-3 bg-white border border-gray-200 rounded-md hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-semibold text-gray-800">Room {request.room_number}</h4>
              <p className="text-sm text-gray-600 capitalize">{request.request_type.replace('_', ' ')}</p>
            </div>
            <span className={`px-2 py-1 text-xs rounded ${
              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              request.status === 'approved' ? 'bg-blue-100 text-blue-800' :
              request.status === 'completed' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {request.status}
            </span>
          </div>
          <p className="text-sm text-gray-600">{request.description}</p>
          <p className="text-xs text-gray-500 mt-2">
            Created: {new Date(request.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'guests':
        return renderGuests();
      case 'rooms':
        return renderRooms();
      case 'reservations':
        return renderReservations();
      case 'requests':
        return renderRequests();
      default:
        return null;
    }
  };

  const getCounts = () => ({
    guests: mockGuests.length,
    rooms: mockRooms.length,
    reservations: mockReservations.length,
    requests: mockSpecialRequests.length,
  });

  const counts = getCounts();

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsExpanded(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <span>📊</span>
          <span>View Database ({counts.guests + counts.rooms + counts.reservations + counts.requests} records)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-50 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white p-4 rounded-t-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Mock Database Browser</h2>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentView('guests')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                currentView === 'guests'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Guests ({counts.guests})
            </button>
            <button
              onClick={() => setCurrentView('rooms')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                currentView === 'rooms'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Rooms ({counts.rooms})
            </button>
            <button
              onClick={() => setCurrentView('reservations')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                currentView === 'reservations'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Reservations ({counts.reservations})
            </button>
            <button
              onClick={() => setCurrentView('requests')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                currentView === 'requests'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Special Requests ({counts.requests})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white p-3 rounded-b-lg">
          <p className="text-xs text-gray-500 text-center">
            Mock data for local development - No real database connection
          </p>
        </div>
      </div>
    </div>
  );
}
