import React from 'react';
import { useStore } from '../store/store';
import EditableChildInfo from '../components/parent/EditableChildInfo';
import DailySummary from '../components/parent/DailySummary';

const ParentHome = () => {
  const { campers, updateCamper } = useStore();
  const camper = campers[0]; // For demo purposes

  return (
    <div className="space-y-6">
      <DailySummary />
      <EditableChildInfo 
        camper={camper} 
        onUpdate={(updatedCamper) => updateCamper(updatedCamper)}
      />
    </div>
  );
};

export default ParentHome;