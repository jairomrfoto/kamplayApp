import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../../store/store';
import { useProfileLinking } from '../../hooks/useProfileLinking';
import type { Camper } from '../../types';

interface Props {
  onClose: () => void;
  parentProfile?: any;
}

const CamperForm = ({ onClose, parentProfile }: Props) => {
  const { addCamper, grupos } = useStore();
  const { linkedCamper } = useProfileLinking(parentProfile);
  const [formData, setFormData] = useState({
    nombre: linkedCamper?.nombre || '',
    edad: linkedCamper?.edad || 6,
    grupo: '',
    cabana: '',
    infoMedica: {
      alergias: linkedCamper?.infoMedica.alergias || [],
      medicacion: linkedCamper?.infoMedica.medicacion || [],
      notas: linkedCamper?.infoMedica.notas || ''
    },
    evaluaciones: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCamper: Camper = {
      id: crypto.randomUUID(),
      ...formData
    };

    addCamper(newCamper);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Nuevo Acampado</h3>
          <button onClick={onClose}>
            <X className="text-gray-500 hover:text-gray-700" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Edad
            </label>
            <input
              type="number"
              min="6"
              max="18"
              required
              value={formData.edad}
              onChange={(e) => setFormData(prev => ({ ...prev, edad: parseInt(e.target.value) }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grupo
            </label>
            <select
              required
              value={formData.grupo}
              onChange={(e) => setFormData(prev => ({ ...prev, grupo: e.target.value }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Seleccionar grupo</option>
              {grupos.map(grupo => (
                <option key={grupo.id} value={grupo.id}>
                  {grupo.nombre} ({grupo.edadMinima}-{grupo.edadMaxima} años)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cabaña
            </label>
            <input
              type="text"
              value={formData.cabana}
              onChange={(e) => setFormData(prev => ({ ...prev, cabana: e.target.value }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas Médicas
            </label>
            <textarea
              value={formData.infoMedica.notas}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                infoMedica: { ...prev.infoMedica, notas: e.target.value }
              }))}
              rows={3}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Información médica relevante..."
            />
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
              Añadir Acampado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CamperForm;