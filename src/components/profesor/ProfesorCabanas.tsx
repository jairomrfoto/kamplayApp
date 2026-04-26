import React from 'react';
import { Tent, Users } from 'lucide-react';
import { useStore } from '../../store/store';

const ESTADO_COLORS: Record<string, string> = {
  'Limpia':             'bg-green-100 text-green-700',
  'Necesita Revisión':  'bg-amber-100 text-amber-700',
  'En Mantenimiento':   'bg-red-100 text-red-700',
};

export default function ProfesorCabanas() {
  const { cabanas, campers, monitores } = useStore();

  if (cabanas.length === 0) {
    return <div className="text-center py-12 text-gray-400 text-sm">Sin cabañas registradas</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cabanas.map(cabana => {
        const ocupantes = campers.filter(c => c.cabanaId === cabana.id);
        const monitor = monitores.find(m => m.id === cabana.monitorId);
        return (
          <div key={cabana.id} className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Tent size={16} className="text-green-600" />
                <h3 className="font-semibold text-gray-900 text-sm">Cabaña {cabana.numero}</h3>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${ESTADO_COLORS[cabana.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                {cabana.estado}
              </span>
            </div>
            <div className="space-y-1 text-xs text-gray-500">
              <p className="flex items-center gap-1.5">
                <Users size={12} />
                {ocupantes.length} / {cabana.capacidad} ocupantes
              </p>
              {monitor && (
                <p>Monitor: {monitor.nombre}</p>
              )}
            </div>
            {ocupantes.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {ocupantes.map(c => (
                  <span key={c.id} className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
                    {c.nombre}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
