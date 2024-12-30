import React from 'react';
import { Clock, Users, MapPin, Package } from 'lucide-react';
import { useStore } from '../../store/store';
import type { Actividad } from '../../types';
import { categorias } from '../../utils/actividadesConfig';

interface Props {
  actividad: Actividad;
}

const ActividadCard = ({ actividad }: Props) => {
  const { materiales } = useStore();
  const categoria = categorias.find(cat => cat.id === actividad.categoria);

  const materialesUsados = materiales.filter(
    material => actividad.materiales.includes(material.id)
  );

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden p-4 lg:p-6">
        {actividad.imagen && (
          <div className="mb-4 -mx-4 -mt-4 lg:-mx-6 lg:-mt-6">
            <img 
              src={actividad.imagen} 
              alt={actividad.titulo}
              className="w-full h-48 object-cover"
            />
          </div>
        )}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg lg:text-xl font-semibold text-gray-800">{actividad.titulo}</h3>
          <span className="text-xs lg:text-sm px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">
            {categoria?.nombre}
          </span>
        </div>

        {actividad.descripcion && (
          <p className="text-gray-600 mb-4">{actividad.descripcion}</p>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={18} />
            <span className="text-sm">{actividad.duracion} minutos</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Users size={18} />
            <span className="text-sm">
              Máx. {actividad.capacidadMaxima} participantes ({actividad.edadMinima}-{actividad.edadMaxima} años)
            </span>
          </div>

          {actividad.ubicacion && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={18} />
              <span className="text-sm">{actividad.ubicacion}</span>
            </div>
          )}

          {materialesUsados.length > 0 && (
            <div className="border-t pt-3 mt-3">
              <div className="flex items-center gap-2 mb-2">
                <Package size={16} className="text-indigo-600" />
                <span className="font-medium text-sm">Materiales necesarios:</span>
              </div>
              <ul className="pl-6 space-y-1">
                {materialesUsados.map(material => (
                  <li key={material.id} className="text-xs lg:text-sm text-gray-600">
                    • {material.nombre}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
    </div>
  );
};

export default ActividadCard;