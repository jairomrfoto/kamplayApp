import React, { useState } from 'react';
import { Search } from 'lucide-react';
import type { Actividad } from '../../types';

interface Props {
  actividades: Actividad[];
  onSelect: (actividad: Actividad) => void;
}

const ActividadSelector = ({ actividades, onSelect }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredActividades = actividades.filter(act => 
    act.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    act.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar actividades..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="max-h-60 overflow-y-auto space-y-2">
        {filteredActividades.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No se encontraron actividades</p>
        ) : (
          filteredActividades.map((actividad) => (
            <div
              key={actividad.id}
              onClick={() => onSelect(actividad)}
              className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <h4 className="font-medium text-gray-900">{actividad.titulo}</h4>
              {actividad.descripcion && (
                <p className="text-sm text-gray-600 mt-1">{actividad.descripcion}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>Duración: {actividad.duracion} min</span>
                {actividad.ubicacion && <span>Ubicación: {actividad.ubicacion}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActividadSelector;