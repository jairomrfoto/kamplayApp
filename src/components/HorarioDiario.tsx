import React from 'react';
import { useStore } from '../store/store';
import { Clock, MapPin } from 'lucide-react';

const HorarioDiario = ({ fecha }: { fecha: Date }) => {
  const { horariosDiarios } = useStore();
  
  const horarioDelDia = horariosDiarios.find(
    h => h.dia.toDateString() === fecha.toDateString()
  );

  const formatHora = (fecha: Date) => {
    return fecha.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">
        Horario del {fecha.toLocaleDateString('es-ES', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        })}
      </h3>

      {!horarioDelDia || horarioDelDia.actividades.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          No hay actividades programadas para este día
        </p>
      ) : (
        <div className="space-y-4">
          {horarioDelDia.actividades
            .sort((a, b) => a.inicio.getTime() - b.inicio.getTime())
            .map((actividad) => (
              <div 
                key={actividad.id} 
                className={`p-4 rounded-lg border-l-4 ${
                  actividad.tipo === 'especial' 
                    ? 'border-l-indigo-500 bg-indigo-50' 
                    : 'border-l-gray-500 bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-800">{actividad.titulo}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <span>
                      {formatHora(actividad.inicio)} - {formatHora(actividad.fin)}
                    </span>
                  </div>
                </div>

                {actividad.descripcion && (
                  <p className="text-sm text-gray-600 mb-2">
                    {actividad.descripcion}
                  </p>
                )}

                {actividad.ubicacion && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span>{actividad.ubicacion}</span>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default HorarioDiario;