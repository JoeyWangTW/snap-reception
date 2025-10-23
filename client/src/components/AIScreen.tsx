import { useHotelStore } from '../store/hotelStore';
import { WorkflowSelector } from './WorkflowSelector';
import { CheckInWorkflow } from './CheckInWorkflow';
import { AvailabilityWorkflow } from './AvailabilityWorkflow';
import { ReservationModificationWorkflow } from './ReservationModificationWorkflow';
import { SpecialRequest } from './SpecialRequest';

interface AIScreenProps {
  onWorkflowChange: (workflow: string) => void;
}

export function AIScreen({ onWorkflowChange }: AIScreenProps) {
  const currentWorkflow = useHotelStore((state) => state.ai.currentWorkflow);
  const lastUpdated = useHotelStore((state) => state.ai.lastUpdated);

  const renderWorkflow = () => {
    switch (currentWorkflow) {
      case 'checkin':
        return <CheckInWorkflow isAI={true} />;
      case 'availability':
        return <AvailabilityWorkflow isAI={true} />;
      case 'modification':
        return <ReservationModificationWorkflow isAI={true} />;
      case 'special_request':
        return <SpecialRequest isAI={true} />;
      default:
        return <div>Unknown workflow</div>;
    }
  };

  return (
    <div className="h-full flex flex-col bg-blue-50">
      <div className="border-b border-blue-200 bg-blue-100 p-4">
        <h2 className="text-xl font-bold text-blue-900">AI Assistant Screen</h2>
        <p className="text-sm text-blue-700">Auto-populated from voice conversation</p>
      </div>

      <div className="p-4">
        <WorkflowSelector
          currentWorkflow={currentWorkflow}
          onWorkflowChange={onWorkflowChange}
          disabled={true}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {renderWorkflow()}
      </div>

      {lastUpdated && (
        <div className="border-t border-blue-200 bg-blue-50 p-2 text-xs text-blue-600 text-center">
          Last updated: {new Date(lastUpdated).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
