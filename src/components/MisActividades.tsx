import React, { useState } from 'react';
import { BookOpen, Search, Plus, Clock, Users, MapPin, Pencil, Trash2, Target, Package } from 'lucide-react';
import { useStore } from '../store/store';
import { categorias } from '../utils/actividadesConfig';
import type { ActividadPersonal } from '../types';
import DemoSectionBanner from './DemoSectionBanner';
import MiActividadForm from './MiActividadForm';

export default function MisActividades() {
  const { misActividades, deleteMiActividad, addActividad, currentCamp } = useStore();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('todas');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ActividadPersonal | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = misActividades.filter(a => {
    const matchesSearch = !search ||
      a.titulo.toLowerCase().includes(search.toLowerCase()) ||
      (a.descripcion || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.objetivo || '').toLowerCase().includes(search.toLowerCase());
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

  const catNombre = (id: string) =>
    categorias.find(c => c.id === id)?.nombre || id;

  return (
    <div className="space-y-5">
      <DemoSectionBanner description="Tu biblioteca personal de actividades. Crea plantillas propias que puedas reutilizar en cualquier campamento o campus sin empezar desde cero." />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800">Mi Biblioteca</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {misActividades.length} actividad{misActividades.length !== 1 ? 'es' : ''} guardada{misActividades.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <Plus size={16} />
          Nueva actividad
        </button>
      </div>

      {/* Filters — only when there are activities */}
      {misActividades.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Buscar por título, descripción u objetivo..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <select
            value={catFilter}
            onChange={e => setCatFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="todas">Todas las categorías</option>
            {categorias.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
      )}

      {/* Empty state */}
      {misActividades.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
            <BookOpen size={28} className="text-orange-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-1">Tu biblioteca está vacía</p>
            <p className="text-sm text-gray-400 max-w-xs">
              Crea plantillas de actividades que puedas reutilizar en cualquier campamento.
            </p>
          </div>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            <Plus size={16} />
            Crear primera actividad
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-8">No hay actividades que coincidan con la búsqueda.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(a => (
            <div key={a.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              {/* Card header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gray-800 line-clamp-2 flex-1 text-sm leading-snug">{a.titulo}</h3>
                <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                  {catNombre(a.categoria)}
                </span>
              </div>

              {a.descripcion && (
                <p className="text-xs text-gray-500 line-clamp-2 mb-2">{a.descripcion}</p>
              )}

              {a.objetivo && (
                <div className="flex items-start gap-1.5 mb-2">
                  <Target size={11} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500 line-clamp-1">{a.objetivo}</p>
                </div>
              )}

              {/* Meta chips */}
              <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-3">
                <span className="flex items-center gap-1"><Clock size={11} />{a.duracion} min</span>
                <span className="flex items-center gap-1"><Users size={11} />{a.edadMinima}-{a.edadMaxima} años · max {a.capacidadMaxima}</span>
                {a.ubicacion && <span className="flex items-center gap-1"><MapPin size={11} />{a.ubicacion}</span>}
                {a.materiales && <span className="flex items-center gap-1"><Package size={11} />{a.materiales}</span>}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-50 mt-auto">
                {currentCamp && (
                  <button
                    onClick={() => handleAddToCamp(a)}
                    className="flex-1 text-xs bg-orange-50 text-orange-700 hover:bg-orange-100 px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    + Añadir al campamento
                  </button>
                )}
                <button
                  onClick={() => { setEditing(a); setShowForm(true); }}
                  className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setConfirmDelete(a.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl text-center">
            <Trash2 size={28} className="mx-auto text-red-500 mb-3" />
            <h3 className="font-bold text-gray-800 mb-1">¿Eliminar actividad?</h3>
            <p className="text-sm text-gray-500 mb-5">Se borrará de tu biblioteca. Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => { deleteMiActividad(confirmDelete); setConfirmDelete(null); }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 text-sm font-bold"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit form */}
      {showForm && (
        <MiActividadForm
          initial={editing ?? undefined}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
