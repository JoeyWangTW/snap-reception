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
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-blue-900">AI Assistant Screen</h2>
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never'}
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-blue-200">
        <WorkflowSelector
          currentWorkflow={currentWorkflow}
          onWorkflowChange={onWorkflowChange}
          disabled={true}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {renderWorkflow()}
      </div>
    </div>
  );
}
