import React, { useState } from 'react';
import { Search, User } from 'lucide-react';
import { useStore } from '../../store/store';

export default function ProfesorAcampados() {
  const { campers, grupos, cabanas } = useStore();
  const [search, setSearch] = useState('');

  const filtered = campers.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const grupoNombre = (id: string) => grupos.find(g => g.id === id)?.nombre || id;
  const cabanaNombre = (id: string) => cabanas.find(c => c.id === id)?.numero || id;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar acampado..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">Sin acampados registrados</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(camper => (
            <div key={camper.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center flex-shrink-0 text-sm">
                {camper.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{camper.nombre}</p>
                <p className="text-xs text-gray-500">{camper.edad} años</p>
                {camper.grupoId && (
                  <p className="text-xs text-gray-400 mt-0.5">Grupo: {grupoNombre(camper.grupoId)}</p>
                )}
                {camper.cabanaId && (
                  <p className="text-xs text-gray-400">Cabaña: {cabanaNombre(camper.cabanaId)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center pt-2">
        {filtered.length} acampado{filtered.length !== 1 ? 's' : ''} · Vista de solo lectura
      </p>
    </div>
  );
}
