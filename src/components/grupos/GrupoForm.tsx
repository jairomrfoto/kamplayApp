import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../../store/store';
import type { Grupo } from '../../types';

interface Props {
  onClose: () => void;
}

const GrupoForm = ({ onClose }: Props) => {
  const { addGrupo, monitores } = useStore();
  const [formData, setFormData] = useState({
    nombre: '',
    edadMinima: 6,
    edadMaxima: 16,
    monitores: [] as string[],
    acampados: [] as string[],
    evaluaciones: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newGrupo: Grupo = {
      id: crypto.randomUUID(),
      ...formData
    };

    addGrupo(newGrupo);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Nuevo Grupo</h3>
          <button onClick={onClose}>
            <X className="text-gray-500 hover:text-gray-700" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del grupo
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Edad mínima
              </label>
              <input
                type="number"
                min="6"
                max="16"
                required
                value={formData.edadMinima}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  edadMinima: parseInt(e.target.value) 
                }))}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Edad máxima
              </label>
              <input
                type="number"
                min="6"
                max="16"
                required
                value={formData.edadMaxima}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  edadMaxima: parseInt(e.target.value) 
                }))}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monitores asignados
            </label>
            <select
              multiple
              value={formData.monitores}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                monitores: Array.from(e.target.selectedOptions, option => option.value)
              }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {monitores.map(monitor => (
                <option key={monitor.id} value={monitor.id}>
                  {monitor.nombre} - {monitor.especialidad}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Mantén presionado Ctrl (Cmd en Mac) para seleccionar varios monitores
            </p>
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
              Crear Grupo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GrupoForm;