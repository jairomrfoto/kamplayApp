import React, { useState } from 'react';
import { useStore } from '../store/store';
import { Plus, Search, Package, Trash, X, MapPin } from 'lucide-react';
import type { Material } from '../types';
import DemoSectionBanner from '../components/DemoSectionBanner';

const ESTADOS: Material['estado'][] = ['Disponible', 'Pedido'];

const statusColor = (estado: string) => {
  if (estado === 'Disponible') return 'bg-green-100 text-green-800';
  if (estado === 'Pedido')     return 'bg-amber-100 text-amber-800';
  return 'bg-gray-100 text-gray-800';
};

const emptyForm = { nombre: '', cantidad: 1, estado: 'Disponible' as Material['estado'], categoria: '', ubicacion: '' };

const Materiales = () => {
  const { materiales, addMaterial, currentCamp } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const filtered = materiales.filter(m =>
    m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.ubicacion ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCamp) return;
    setSaving(true);
    addMaterial({ id: crypto.randomUUID(), ...form });
    setForm(emptyForm);
    setShowForm(false);
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <DemoSectionBanner description="Inventario del campamento. Controla el stock, la disponibilidad y la ubicación de todos los materiales necesarios para las actividades." />
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Inventario de Materiales</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center gap-2"
        >
          <Plus size={20} /> Nuevo Material
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, categoría o ubicación..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              {materiales.length === 0 ? 'No hay materiales registrados' : 'Sin resultados'}
            </div>
          ) : (
            filtered.map(material => (
              <div key={material.id} className="border rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
                      <Package className="text-orange-600" size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 leading-tight">{material.nombre}</h3>
                      <p className="text-xs text-gray-500">{material.categoria}</p>
                    </div>
                  </div>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(material.estado)}`}>
                    {material.estado}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    Cantidad: <span className="font-medium text-gray-800">{material.cantidad}</span>
                  </span>
                  {material.ubicacion && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={11} className="text-gray-400" />
                      {material.ubicacion}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal añadir material */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold">Añadir material</h3>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input
                  required
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Tiendas de campaña"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <input
                  required
                  value={form.categoria}
                  onChange={e => setForm({ ...form, categoria: e.target.value })}
                  placeholder="Ej: Alojamiento, Deportes..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación <span className="text-gray-400 font-normal">(opcional)</span></label>
                <input
                  value={form.ubicacion}
                  onChange={e => setForm({ ...form, ubicacion: e.target.value })}
                  placeholder="Ej: Almacén A, Caja 3, Sala de monitores..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                  <input
                    type="number" min={1} required
                    value={form.cantidad}
                    onChange={e => setForm({ ...form, cantidad: parseInt(e.target.value) || 1 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={form.estado}
                    onChange={e => setForm({ ...form, estado: e.target.value as Material['estado'] })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    {ESTADOS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50">
                  {saving ? 'Guardando...' : 'Añadir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Materiales;
