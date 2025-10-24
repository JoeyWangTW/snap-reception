import { useEffect } from 'react';
import { useHotelStore } from './store/hotelStore';
import { usePipecatHotel } from './hooks/usePipecatHotel';
import { ManualScreen } from './components/ManualScreen';
import { AIScreen } from './components/AIScreen';
import { PullButton } from './components/PullButton';
import { TranscriptPanel } from './components/TranscriptPanel';
import { DataBrowser } from './components/DataBrowser';
import { generateMockAIUpdate } from './data/mockData';

function HotelApp() {
  const {
    pullFromAI,
    isAIDataReady,
    setManualWorkflow,
    updateAI
  } = useHotelStore();

  const { connectionState, connect, disconnect } = usePipecatHotel();

  // Test function to populate AI data - accessible via console
  const populateTestData = (workflow: string) => {
    const mockUpdate = generateMockAIUpdate(workflow);
    if (mockUpdate) {
      updateAI(mockUpdate.workflow, mockUpdate.data);
    }
  };

  // Expose test function to console
  useEffect(() => {
    (window as any).testPopulateData = populateTestData;
    return () => {
      delete (window as any).testPopulateData;
    };
  }, [updateAI]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.includes('Mac');
      const isCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey;
      
      if (isCtrlOrCmd && event.key === 'p' && event.shiftKey) {
        event.preventDefault();
        if (isAIDataReady) {
          pullFromAI();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [pullFromAI, isAIDataReady]);

  const handleManualWorkflowChange = (workflow: string) => {
    setManualWorkflow(workflow as any);
  };

  const handleAIWorkflowChange = (_workflow: string) => {
    // AI workflow changes are handled by the backend
    // This is just for UI consistency
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Hotel Front Desk AI Assistant</h1>
            <p className="text-sm text-gray-600">Split-screen interface with voice AI support</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <PullButton
              onPull={pullFromAI}
              isAIDataReady={isAIDataReady}
            />

            <div className="flex items-center space-x-2">
              <button
                onClick={connectionState.isConnected ? disconnect : connect}
                disabled={connectionState.isConnecting}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  connectionState.isConnected
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                } ${connectionState.isConnecting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {connectionState.isConnecting ? 'Connecting...' :
                 connectionState.isConnected ? 'Disconnect' : 'Connect'}
              </button>

              <div className={`w-2 h-2 rounded-full ${
                connectionState.isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
            </div>
          </div>
        </div>
        
        {connectionState.error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">Error: {connectionState.error}</p>
          </div>
        )}
      </header>

      {/* Main Content - Split Screen */}
      <main className="flex-1 flex min-h-0">
        {/* Left Panel - Manual Control */}
        <div className="w-1/2 border-r border-gray-200">
          <ManualScreen onWorkflowChange={handleManualWorkflowChange} />
        </div>
        
        {/* Right Panel - AI Assistant */}
        <div className="w-1/2">
          <AIScreen onWorkflowChange={handleAIWorkflowChange} />
        </div>
      </main>

      {/* Bottom Panel - Transcription */}
      <TranscriptPanel
        transcript={connectionState.transcript}
        isConnected={connectionState.isConnected}
      />

      {/* Data Browser Modal */}
      <DataBrowser />
    </div>
  );
}

export default function App() {
  return <HotelApp />;
}
