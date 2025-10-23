import React from 'react';

interface WorkflowSelectorProps {
  currentWorkflow: string;
  onWorkflowChange: (workflow: string) => void;
  disabled?: boolean;
}

export const WorkflowSelector: React.FC<WorkflowSelectorProps> = ({ 
  currentWorkflow, 
  onWorkflowChange, 
  disabled = false 
}) => {
  const workflows = [
    { id: 'checkin', label: 'Check-In', icon: '🏨' },
    { id: 'availability', label: 'Availability', icon: '🔍' },
    { id: 'modification', label: 'Modification', icon: '✏️' },
    { id: 'special_request', label: 'Special Request', icon: '📋' },
  ];

  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
      {workflows.map((workflow) => (
        <button
          key={workflow.id}
          onClick={() => onWorkflowChange(workflow.id)}
          disabled={disabled}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            currentWorkflow === workflow.id
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="mr-1">{workflow.icon}</span>
          {workflow.label}
        </button>
      ))}
    </div>
  );
};

