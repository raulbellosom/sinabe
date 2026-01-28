import React, { useState } from 'react';
import classNames from 'classnames';
import { FaBriefcase, FaCalendarAlt, FaHistory } from 'react-icons/fa';
import VerticalModelsDetail from './VerticalModelsDetail';
import MaintenanceAgenda from './MaintenanceAgenda';
import AuditLogHistory from '../common/AuditLogHistory';

const VerticalDetailExtended = ({
  vertical,
  // Props for VerticalModelsDetail
  removeModel,
  refetchVerticals,
  showFullDescription,
  setShowFullDescription,
  shouldExpandInModal,
  selectedDescription,
  showAssign,
  setShowAssign,
  assignModel,
  searchModels,
}) => {
  const [activeTab, setActiveTab] = useState('models');

  const tabs = [
    { id: 'models', label: 'Modelos', icon: FaBriefcase },
    { id: 'agenda', label: 'Agenda', icon: FaCalendarAlt },
    { id: 'history', label: 'Historial', icon: FaHistory },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-sinabe-blue-dark">
          {vertical.name}
        </h2>
        <p className="text-gray-500 text-sm mt-1 whitespace-pre-line">
          {vertical.description}
        </p>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Custom Tabs Header */}
        <div className="flex gap-1 border-b border-gray-200 mb-4 overflow-x-auto overflow-y-hidden scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={classNames(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap flex-shrink-0',
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-2">
          {activeTab === 'models' && (
            <VerticalModelsDetail
              models={vertical.models}
              verticalId={vertical.id}
              removeModel={removeModel}
              refetchVerticals={refetchVerticals}
              showFullDescription={showFullDescription}
              setShowFullDescription={setShowFullDescription}
              shouldExpandInModal={shouldExpandInModal}
              selectedDescription={selectedDescription}
              showAssign={showAssign}
              setShowAssign={setShowAssign}
              assignModel={assignModel}
              searchModels={searchModels}
            />
          )}

          {activeTab === 'agenda' && (
            <MaintenanceAgenda verticalId={vertical.id} />
          )}

          {activeTab === 'history' && (
            <AuditLogHistory entityType="VERTICAL" entityId={vertical.id} />
          )}
        </div>
      </div>
    </div>
  );
};

export default VerticalDetailExtended;
