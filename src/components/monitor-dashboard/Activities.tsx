import React, { useState } from 'react';
import { useStore } from '../../store/store';
import { Plus, Search } from 'lucide-react';
import ActividadCard from '../actividades/ActividadCard';
import ActividadForm from '../actividades/ActividadForm';

const Activities = () => {
  const { actividades, currentMonitor } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const monitorActivities = actividades.filter(
    act => currentMonitor && act.monitores.includes(currentMonitor.id)
  );

  const filteredActivities = monitorActivities.filter(
    act => act.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Mis Actividades</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Actividad
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar actividades..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No hay actividades creadas
          </div>
        ) : (
          filteredActivities.map((actividad) => (
            <ActividadCard key={actividad.id} actividad={actividad} />
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <ActividadForm onClose={() => setShowForm(false)} />
        </div>
      )}
    </div>
  );
};

export default Activities;