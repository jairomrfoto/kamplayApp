import React, { useState } from 'react';
import type { Camper } from '../../types';

interface Props {
  camper: Camper;
  onSave: (updatedInfo: any) => void;
  onCancel: () => void;
}

const AdditionalInfoForm = ({ camper, onSave, onCancel }: Props) => {
  const [intereses, setIntereses] = useState(camper.infoAdicional?.intereses || '');
  const [restriccionesDieteticas, setRestriccionesDieteticas] = useState(
    camper.infoAdicional?.restriccionesDieteticas || ''
  );
  const [notasComportamiento, setNotasComportamiento] = useState(
    camper.infoAdicional?.notasComportamiento || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      intereses,
      restriccionesDieteticas,
      notasComportamiento
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Intereses y Aficiones
        </label>
        <textarea
          value={intereses}
          onChange={(e) => setIntereses(e.target.value)}
          rows={3}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Deportes, música, arte..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Restricciones Dietéticas
        </label>
        <textarea
          value={restriccionesDieteticas}
          onChange={(e) => setRestriccionesDieteticas(e.target.value)}
          rows={3}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Preferencias alimentarias, restricciones..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notas de Comportamiento
        </label>
        <textarea
          value={notasComportamiento}
          onChange={(e) => setNotasComportamiento(e.target.value)}
          rows={3}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Aspectos importantes sobre el comportamiento..."
        />
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Guardar Cambios
        </button>
      </div>
    </form>
  );
};

export default AdditionalInfoForm;