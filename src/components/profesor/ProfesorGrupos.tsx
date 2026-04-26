import React from 'react';
import { Users } from 'lucide-react';
import { useStore } from '../../store/store';

export default function ProfesorGrupos() {
  const { grupos, campers } = useStore();

  if (grupos.length === 0) {
    return <div className="text-center py-12 text-gray-400 text-sm">Sin grupos creados</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {grupos.map(grupo => {
        const miembros = campers.filter(c => c.grupoId === grupo.id);
        return (
          <div key={grupo.id} className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Users size={15} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">{grupo.nombre}</h3>
            </div>
            {(grupo.edadMinima || grupo.edadMaxima) && (
              <p className="text-xs text-gray-400 mb-2">
                Edad: {grupo.edadMinima}–{grupo.edadMaxima} años
              </p>
            )}
            <div className="space-y-1">
              {miembros.length === 0 ? (
                <p className="text-xs text-gray-300">Sin acampados asignados</p>
              ) : (
                miembros.slice(0, 6).map(c => (
                  <div key={c.id} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs flex items-center justify-center font-bold flex-shrink-0">
                      {c.nombre.charAt(0)}
                    </div>
                    <span className="text-xs text-gray-600 truncate">{c.nombre}</span>
                  </div>
                ))
              )}
              {miembros.length > 6 && (
                <p className="text-xs text-gray-400">+{miembros.length - 6} más</p>
              )}
            </div>
            <p className="text-xs text-gray-300 mt-3">{miembros.length} acampados</p>
          </div>
        );
      })}
    </div>
  );
}
