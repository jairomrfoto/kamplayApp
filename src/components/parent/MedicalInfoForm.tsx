import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Camper } from '../../types';

interface Props {
  camper: Camper;
  onSave: (updatedInfo: Camper['infoMedica']) => void;
  onCancel: () => void;
}

const MedicalInfoForm = ({ camper, onSave, onCancel }: Props) => {
  const [alergias, setAlergias] = useState<string[]>(camper.infoMedica.alergias);
  const [medicacion, setMedicacion] = useState<string[]>(camper.infoMedica.medicacion);
  const [notas, setNotas] = useState(camper.infoMedica.notas);
  const [newAlergia, setNewAlergia] = useState('');
  const [newMedicacion, setNewMedicacion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      alergias,
      medicacion,
      notas
    });
  };

  const addAlergia = () => {
    if (newAlergia.trim()) {
      setAlergias([...alergias, newAlergia.trim()]);
      setNewAlergia('');
    }
  };

  const addMedicacion = () => {
    if (newMedicacion.trim()) {
      setMedicacion([...medicacion, newMedicacion.trim()]);
      setNewMedicacion('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Alergias */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alergias
        </label>
        <div className="space-y-2">
          {alergias.map((alergia, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="flex-1 text-gray-900">{alergia}</span>
              <button
                type="button"
                onClick={() => setAlergias(alergias.filter((_, i) => i !== index))}
                className="text-red-500 hover:text-red-700"
              >
                <X size={18} />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newAlergia}
              onChange={(e) => setNewAlergia(e.target.value)}
              className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Nueva alergia..."
            />
            <button
              type="button"
              onClick={addAlergia}
              className="text-indigo-600 hover:text-indigo-800"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Medicación */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Medicación
        </label>
        <div className="space-y-2">
          {medicacion.map((med, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="flex-1 text-gray-900">{med}</span>
              <button
                type="button"
                onClick={() => setMedicacion(medicacion.filter((_, i) => i !== index))}
                className="text-red-500 hover:text-red-700"
              >
                <X size={18} />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newMedicacion}
              onChange={(e) => setNewMedicacion(e.target.value)}
              className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Nueva medicación..."
            />
            <button
              type="button"
              onClick={addMedicacion}
              className="text-indigo-600 hover:text-indigo-800"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notas Médicas
        </label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={4}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Información médica adicional..."
        />
      </div>

      {/* Buttons */}
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

export default MedicalInfoForm;