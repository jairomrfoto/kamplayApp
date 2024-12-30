import React, { useState } from 'react';
import { useStore } from '../store/store';
import type { EvaluacionGrupo } from '../types';

interface Props {
  grupoId: string;
  onSubmit: () => void;
}

const EvaluacionGrupoForm = ({ grupoId, onSubmit }: Props) => {
  const { addEvaluacionGrupo } = useStore();
  const [formData, setFormData] = useState({
    participacion: 3,
    cooperacion: 3,
    comportamiento: 3,
    observaciones: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const evaluacion: EvaluacionGrupo = {
      id: crypto.randomUUID(),
      fecha: new Date(),
      grupoId,
      ...formData,
    };

    addEvaluacionGrupo(evaluacion);
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nivel de Participación (1-5)
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={formData.participacion}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              participacion: parseInt(e.target.value)
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
            Nivel de Cooperación (1-5)
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={formData.cooperacion}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              cooperacion: parseInt(e.target.value)
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
            Comportamiento General (1-5)
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={formData.comportamiento}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              comportamiento: parseInt(e.target.value)
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
            Observaciones
          </label>
          <textarea
            value={formData.observaciones}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              observaciones: e.target.value
            }))}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={4}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Guardar Evaluación
        </button>
      </div>
    </form>
  );
};

export default EvaluacionGrupoForm;