import React, { useState } from 'react';
import { useStore } from '../store/store';
import type { EncuestaMonitor } from '../types';

interface Props {
  monitorId: string;
  onSubmit: () => void;
}

const EncuestaMonitorForm = ({ monitorId, onSubmit }: Props) => {
  const { addEncuestaMonitor } = useStore();
  const [formData, setFormData] = useState({
    estadoPersonal: 3,
    nivelEnergia: 3,
    desafios: '',
    logros: '',
    necesidades: '',
    observaciones: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const encuesta: EncuestaMonitor = {
      id: crypto.randomUUID(),
      fecha: new Date(),
      monitorId,
      ...formData,
    };

    addEncuestaMonitor(encuesta);
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado Personal (1-5)
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={formData.estadoPersonal}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              estadoPersonal: parseInt(e.target.value)
            }))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>Bajo</span>
            <span>Alto</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nivel de Energía (1-5)
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={formData.nivelEnergia}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              nivelEnergia: parseInt(e.target.value)
            }))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>Bajo</span>
            <span>Alto</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Desafíos Encontrados
          </label>
          <textarea
            value={formData.desafios}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              desafios: e.target.value
            }))}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Logros del Día
          </label>
          <textarea
            value={formData.logros}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              logros: e.target.value
            }))}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Necesidades o Recursos
          </label>
          <textarea
            value={formData.necesidades}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              necesidades: e.target.value
            }))}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observaciones Adicionales
          </label>
          <textarea
            value={formData.observaciones}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              observaciones: e.target.value
            }))}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Guardar Encuesta
        </button>
      </div>
    </form>
  );
};

export default EncuestaMonitorForm;