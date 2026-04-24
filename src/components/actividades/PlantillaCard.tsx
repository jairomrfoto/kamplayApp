import React, { useState } from 'react';
import { Clock, Users, MapPin, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { categorias } from '../../utils/actividadesConfig';
import type { ActividadPlantilla } from '../../data/actividadesEjemplo';

const dificultadColor: Record<string, string> = {
  'Fácil':   'bg-green-100 text-green-700',
  'Media':   'bg-amber-100 text-amber-700',
  'Difícil': 'bg-red-100 text-red-700',
};

interface Props {
  plantilla: ActividadPlantilla;
  onUsar: (plantilla: ActividadPlantilla) => void;
}

const PlantillaCard = ({ plantilla, onUsar }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const categoria = categorias.find(c => c.id === plantilla.categoria);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 leading-tight">{plantilla.titulo}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0 ${dificultadColor[plantilla.dificultad]}`}>
            {plantilla.dificultad}
          </span>
        </div>
        <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">
          {categoria?.nombre}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 space-y-3">
        <p className="text-sm text-gray-600 leading-relaxed">
          {expanded ? plantilla.descripcion : `${plantilla.descripcion.slice(0, 120)}…`}
        </p>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1"
        >
          {expanded ? <><ChevronUp size={12} /> Ver menos</> : <><ChevronDown size={12} /> Ver más</>}
        </button>

        <div className="space-y-1.5 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Clock size={14} className="flex-shrink-0" />
            <span>{plantilla.duracion} min</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={14} className="flex-shrink-0" />
            <span>Hasta {plantilla.capacidadMaxima} · {plantilla.edadMinima}–{plantilla.edadMaxima} años</span>
          </div>
          {plantilla.ubicacion && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="flex-shrink-0" />
              <span className="truncate">{plantilla.ubicacion}</span>
            </div>
          )}
        </div>

        {expanded && plantilla.materialesTexto.length > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-700 mb-1">Materiales:</p>
            <ul className="space-y-0.5">
              {plantilla.materialesTexto.map((m, i) => (
                <li key={i} className="text-xs text-gray-500">· {m}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action */}
      <div className="p-4 pt-0">
        <button
          onClick={() => onUsar(plantilla)}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2 rounded-lg transition-colors"
        >
          <Copy size={14} />
          Usar como plantilla
        </button>
      </div>
    </div>
  );
};

export default PlantillaCard;
