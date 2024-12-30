import React from 'react';
import { useStore } from '../store/store';
import ActivityCalendar from '../components/parent/ActivityCalendar';

const ParentCalendar = () => {
  const { actividades } = useStore();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Calendario de Actividades</h2>
      <ActivityCalendar actividades={actividades} />
    </div>
  );
};

export default ParentCalendar;