import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../../store/store';
import type { Cabana } from '../../types';

interface Props {
  cabana?: Cabana;
  onClose: () => void;
}

const CabanaForm = ({ cabana, onClose }: Props) => {
  const { monitores, addCabana, updateCabana } = useStore();
  const [formData, setFormData] = useState({
    numero: cabana?.numero || '',
    capacidad: cabana?.capacidad || 4,
    monitorEncargado: cabana?.monitorEncargado || '',
    estado: cabana?.estado || 'Limpia',
    ocupantes: cabana?.ocupantes || [],
    ultimaRevision: cabana?.ultimaRevision || new Date()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cabana) {
      updateCabana({
        ...cabana,
        ...formData
      });
    } else {
      const newCabana: Cabana = {
        id: crypto.randomUUID(),
        ...formData
      };
      addCabana(newCabana);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">
            {cabana ? 'Editar Cabaña' : 'Nueva Cabaña'}
          </h3>
          <button onClick={onClose}>
            <X className="text-gray-500 hover:text-gray-700" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Cabaña
            </label>
            <input
              type="text"
              required
              value={formData.numero}
              onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacidad
            </label>
            <input
              type="number"
              min="1"
              required
              value={formData.capacidad}
              onChange={(e) => setFormData(prev => ({ ...prev, capacidad: parseInt(e.target.value) }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monitor Encargado
            </label>
            <select
              value={formData.monitorEncargado}
              onChange={(e) => setFormData(prev => ({ ...prev, monitorEncargado: e.target.value }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Sin monitor asignado</option>
              {monitores.map(monitor => (
                <option key={monitor.id} value={monitor.id}>
                  {monitor.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              required
              value={formData.estado}
              onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="Limpia">Limpia</option>
              <option value="Necesita Revisión">Necesita Revisión</option>
              <option value="En Mantenimiento">En Mantenimiento</option>
            </select>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              {cabana ? 'Guardar Cambios' : 'Crear Cabaña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CabanaForm;