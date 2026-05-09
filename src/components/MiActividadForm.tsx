import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useStore } from '../store/store';
import { useAuth } from '../hooks/useAuth';
import { saveUserActividad } from '../services/firestore';
import { categorias } from '../utils/actividadesConfig';
import type { ActividadPersonal } from '../types';

interface Props {
  initial?: ActividadPersonal;
  onClose: () => void;
}

export default function MiActividadForm({ initial, onClose }: Props) {
  const { addMiActividad, updateMiActividad } = useStore();
  const { user } = useAuth();
  const isEditing = !!initial;

  const [form, setForm] = useState<Omit<ActividadPersonal, 'id' | 'fechaGuardado'>>({
    titulo: initial?.titulo ?? '',
    descripcion: initial?.descripcion ?? '',
    objetivo: initial?.objetivo ?? '',
    categoria: initial?.categoria ?? 'juegos',
    duracion: initial?.duracion ?? 60,
    edadMinima: initial?.edadMinima ?? 6,
    edadMaxima: initial?.edadMaxima ?? 16,
    capacidadMaxima: initial?.capacidadMaxima ?? 20,
    ubicacion: initial?.ubicacion ?? '',
    materiales: initial?.materiales ?? '',
    notas: initial?.notas ?? '',
    campId: initial?.campId,
    campNombre: initial?.campNombre,
  });

  const set = (field: string, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) return;

    const actividad: ActividadPersonal = {
      ...form,
      id: initial?.id ?? crypto.randomUUID(),
      fechaGuardado: new Date(),
    };

    if (isEditing) {
      updateMiActividad(actividad);
    } else {
      addMiActividad(actividad);
      if (user) saveUserActividad(user.uid, actividad).catch(console.error);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">
            {isEditing ? 'Editar actividad' : 'Nueva actividad'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input
              type="text"
              value={form.titulo}
              onChange={e => set('titulo', e.target.value)}
              required
              placeholder="Ej: Gymkana por equipos"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Categoría + Duración */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select
                value={form.categoria}
                onChange={e => set('categoria', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {categorias.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min) *</label>
              <input
                type="number"
                min={5}
                max={480}
                value={form.duracion}
                onChange={e => set('duracion', Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={e => set('descripcion', e.target.value)}
              rows={2}
              placeholder="Breve descripción de la actividad..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>

          {/* Objetivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo</label>
            <input
              type="text"
              value={form.objetivo}
              onChange={e => set('objetivo', e.target.value)}
              placeholder="¿Qué se trabaja con esta actividad?"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Edades + Capacidad */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Edad mín.</label>
              <input
                type="number" min={3} max={99}
                value={form.edadMinima}
                onChange={e => set('edadMinima', Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Edad máx.</label>
              <input
                type="number" min={3} max={99}
                value={form.edadMaxima}
                onChange={e => set('edadMaxima', Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad</label>
              <input
                type="number" min={1}
                value={form.capacidadMaxima}
                onChange={e => set('capacidadMaxima', Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
            <input
              type="text"
              value={form.ubicacion}
              onChange={e => set('ubicacion', e.target.value)}
              placeholder="Ej: Pabellón, piscina, patio exterior..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Materiales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Materiales necesarios</label>
            <input
              type="text"
              value={form.materiales}
              onChange={e => set('materiales', e.target.value)}
              placeholder="Ej: Cuerdas, balones, cartulinas..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas internas</label>
            <textarea
              value={form.notas}
              onChange={e => set('notas', e.target.value)}
              rows={2}
              placeholder="Variantes, consejos, advertencias..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-2.5 text-sm font-bold transition-colors"
            >
              <Save size={15} />
              {isEditing ? 'Guardar cambios' : 'Guardar actividad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
