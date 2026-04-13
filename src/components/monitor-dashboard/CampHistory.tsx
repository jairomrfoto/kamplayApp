import React from 'react';
import { History } from 'lucide-react';

/**
 * CampHistory — placeholder for past camps a monitor participated in.
 * Future: load from a `historialCampamentos` subcollection on the monitor's profile.
 */
const CampHistory = () => {
  return (
    <div className="p-6 text-center">
      <History size={32} className="text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500 text-sm font-medium">Sin historial de campamentos</p>
      <p className="text-gray-400 text-xs mt-1">Aquí aparecerán los campamentos anteriores en los que hayas participado.</p>
    </div>
  );
};

export default CampHistory;
