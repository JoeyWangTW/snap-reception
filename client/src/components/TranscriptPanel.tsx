import React from 'react';

interface TranscriptPanelProps {
  transcript: string;
  isConnected: boolean;
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ 
  transcript, 
  isConnected 
}) => {
  return (
    <div className="bg-gray-50 border-t border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">Live Transcription</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-500">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-md p-3 min-h-[60px]">
        {transcript ? (
          <p className="text-sm text-gray-800 leading-relaxed">{transcript}</p>
        ) : (
          <p className="text-sm text-gray-400 italic">
            {isConnected ? 'Listening for conversations...' : 'Not connected to voice AI'}
          </p>
        )}
      </div>
      
      {isConnected && (
        <p className="text-xs text-gray-500 mt-2">
          💡 Speak naturally - the AI will extract relevant information and populate forms automatically.
        </p>
      )}
    </div>
  );
};

