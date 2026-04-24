import React, { useState } from 'react';
import { BookOpen, Search, Plus, Clock, Users, MapPin, Calendar } from 'lucide-react';
import { useStore } from '../store/store';
import { categorias } from '../utils/actividadesConfig';
import type { ActividadPersonal } from '../types';

const MisActividades = () => {
  const { misActividades, addActividad, currentCamp } = useStore();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('todas');

  const filtered = misActividades.filter(a => {
    const matchesSearch = !search ||
      a.titulo.toLowerCase().includes(search.toLowerCase()) ||
      (a.descripcion || '').toLowerCase().includes(search.toLowerCase());
    const matchesCat = catFilter === 'todas' || a.categoria === catFilter;
    return matchesSearch && matchesCat;
  });

  const handleAddToCamp = (a: ActividadPersonal) => {
    if (!currentCamp) return;
    addActividad({
      id: crypto.randomUUID(),
      titulo: a.titulo,
      descripcion: a.descripcion,
      inicio: new Date(),
      fin: new Date(Date.now() + a.duracion * 60_000),
      grupo: '',
      monitores: [],
      materiales: [],
      tipo: 'regular',
      categoria: a.categoria,
      duracion: a.duracion,
      capacidadMaxima: a.capacidadMaxima,
      edadMinima: a.edadMinima,
      edadMaxima: a.edadMaxima,
      ubicacion: a.ubicacion,
    });
  };

  if (misActividades.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium mb-1">Tu biblioteca personal está vacía</p>
        <p className="text-gray-400 text-sm">
          Cada actividad que crees en cualquier campamento se guardará aquí automáticamente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Buscar actividades..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="todas">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      <p className="text-xs text-gray-400">{filtered.length} actividad{filtered.length !== 1 ? 'es' : ''} guardada{filtered.length !== 1 ? 's' : ''}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(a => (
          <div key={a.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-gray-800 line-clamp-2 flex-1">{a.titulo}</h3>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                {categorias.find(c => c.id === a.categoria)?.nombre || a.categoria}
              </span>
            </div>

            {a.descripcion && (
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{a.descripcion}</p>
            )}

            <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1"><Clock size={12} />{a.duracion} min</span>
              <span className="flex items-center gap-1"><Users size={12} />{a.edadMinima}-{a.edadMaxima} años</span>
              {a.ubicacion && (
                <span className="flex items-center gap-1"><MapPin size={12} />{a.ubicacion}</span>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar size={11} />
                <span>{a.campNombre}</span>
              </div>
              {currentCamp && (
                <button
                  onClick={() => handleAddToCamp(a)}
                  className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2.5 py-1 rounded-lg"
                >
                  <Plus size={12} />
                  Añadir al campamento
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MisActividades;
