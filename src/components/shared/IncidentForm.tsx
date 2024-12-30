import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store/store';

interface Props {
  onClose: () => void;
}

const IncidentForm = ({ onClose }: Props) => {
  const { currentMonitor, currentCoordinator, campers, addIncident } = useStore();
  const [formData, setFormData] = useState({
    tipo: 'leve',
    descripcion: '',
    ubicacion: '',
    acampadosAfectados: [] as string[],
    accionesTomadas: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newIncident = {
      ...formData,
      reportadoPor: currentMonitor?.id || currentCoordinator?.id || '',
      fecha: new Date(),
      estado: 'pendiente',
      seguimiento: []
    };

    addIncident(newIncident);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-600" size={24} />
            <h3 className="text-lg font-semibold">Reportar Incidencia</h3>
          </div>
          <button onClick={onClose}>
            <X className="text-gray-500 hover:text-gray-700" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Incidencia
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="leve">Leve</option>
              <option value="moderada">Moderada</option>
              <option value="grave">Grave</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              required
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Describe lo sucedido..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación
            </label>
            <input
              type="text"
              value={formData.ubicacion}
              onChange={(e) => setFormData(prev => ({ ...prev, ubicacion: e.target.value }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Lugar donde ocurrió..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Acampados Afectados
            </label>
            <select
              multiple
              value={formData.acampadosAfectados}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                acampadosAfectados: Array.from(e.target.selectedOptions, option => option.value)
              }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {campers.map(camper => (
                <option key={camper.id} value={camper.id}>
                  {camper.nombre}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Mantén presionada la tecla Ctrl para seleccionar múltiples acampados
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Acciones Tomadas
            </label>
            <textarea
              value={formData.accionesTomadas}
              onChange={(e) => setFormData(prev => ({ ...prev, accionesTomadas: e.target.value }))}
              rows={2}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Medidas tomadas o a tomar..."
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
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Reportar Incidencia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncidentForm;