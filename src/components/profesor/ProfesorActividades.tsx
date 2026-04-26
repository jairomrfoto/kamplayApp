import React from 'react';
import { Clock, Users, MapPin } from 'lucide-react';
import { useStore } from '../../store/store';

export default function ProfesorActividades() {
  const { actividades } = useStore();

  if (actividades.length === 0) {
    return <div className="text-center py-12 text-gray-400 text-sm">Sin actividades programadas</div>;
  }

  return (
    <div className="space-y-3">
      {actividades.map(act => (
        <div key={act.id} className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-sm">{act.nombre}</h3>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
              {act.categoria}
            </span>
          </div>
          {act.descripcion && (
            <p className="text-xs text-gray-500 mt-1">{act.descripcion}</p>
          )}
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
            {act.duracion && (
              <span className="flex items-center gap-1">
                <Clock size={12} /> {act.duracion} min
              </span>
            )}
            {act.ubicacion && (
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {act.ubicacion}
              </span>
            )}
            {act.capacidadMaxima && (
              <span className="flex items-center gap-1">
                <Users size={12} /> Máx. {act.capacidadMaxima}
              </span>
            )}
          </div>
        </div>
      ))}
      <p className="text-xs text-gray-400 text-center pt-1">Vista de solo lectura</p>
    </div>
  );
}
