import React from 'react';
import { useHotelStore } from '../store/hotelStore';

interface PullButtonProps {
  onPull: () => void;
  isAIDataReady: boolean;
}

export const PullButton: React.FC<PullButtonProps> = ({ onPull, isAIDataReady }) => {
  const handlePull = () => {
    if (isAIDataReady) {
      onPull();
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={handlePull}
        disabled={!isAIDataReady}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          isAIDataReady
            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        <span className="mr-2">⬅️</span>
        Pull from AI
      </button>
      
      <div className="text-xs text-gray-500">
        <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">
          {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+P
        </kbd>
      </div>
      
      {isAIDataReady && (
        <div className="flex items-center text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          <span className="text-xs font-medium">AI Data Ready</span>
        </div>
      )}
    </div>
  );
};

