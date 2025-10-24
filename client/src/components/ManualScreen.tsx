import React from 'react';
import { useHotelStore } from '../store/hotelStore';
import { WorkflowSelector } from './WorkflowSelector';
import { CheckInWorkflow } from './CheckInWorkflow';
import { AvailabilityWorkflow } from './AvailabilityWorkflow';
import { ReservationModificationWorkflow } from './ReservationModificationWorkflow';
import { SpecialRequest } from './SpecialRequest';

interface ManualScreenProps {
  onWorkflowChange: (workflow: string) => void;
}

export const ManualScreen: React.FC<ManualScreenProps> = ({ onWorkflowChange }) => {
  const currentWorkflow = useHotelStore((state) => state.manual.currentWorkflow);
  const lastUpdated = useHotelStore((state) => state.manual.lastUpdated);

  const renderWorkflowForm = () => {
    switch (currentWorkflow) {
      case 'checkin':
        return <CheckInWorkflow isAI={false} />;
      case 'availability':
        return <AvailabilityWorkflow isAI={false} />;
      case 'modification':
        return <ReservationModificationWorkflow isAI={false} />;
      case 'special_request':
        return <SpecialRequest isAI={false} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Manual Control</h2>
        </div>
      </div>

      {/* Workflow Selector */}
      <div className="p-4 border-b border-gray-200">
        <WorkflowSelector
          currentWorkflow={currentWorkflow}
          onWorkflowChange={onWorkflowChange}
        />
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-auto p-4">
        {renderWorkflowForm()}
      </div>
    </div>
  );
};

