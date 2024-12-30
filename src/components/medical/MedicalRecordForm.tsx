import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../../store/store';
import type { Camper } from '../../types';

interface Props {
  onClose: () => void;
}

const MedicalRecordForm = ({ onClose }: Props) => {
  const { campers, updateCamper } = useStore();
  const [selectedCamper, setSelectedCamper] = useState<string>('');
  const [formData, setFormData] = useState({
    medicacion: '',
    horario: '',
    dosis: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const camper = campers.find(c => c.id === selectedCamper);
    if (!camper) return;

    const newMedicacion = {
      id: crypto.randomUUID(),
      nombre: formData.medicacion,
      horario: formData.horario,
      dosis: formData.dosis,
      administrada: false
    };

    const updatedCamper: Camper = {
      ...camper,
      infoMedica: {
        ...camper.infoMedica,
        medicacionProgramada: [
          ...(camper.infoMedica.medicacionProgramada || []),
          newMedicacion
        ]
      }
    };

    updateCamper(updatedCamper);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Nuevo Registro Médico</h3>
          <button onClick={onClose}>
            <X className="text-gray-500 hover:text-gray-700" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Acampado
            </label>
            <select
              required
              value={selectedCamper}
              onChange={(e) => setSelectedCamper(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Seleccionar acampado</option>
              {campers.map(camper => (
                <option key={camper.id} value={camper.id}>
                  {camper.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medicación
            </label>
            <input
              type="text"
              required
              value={formData.medicacion}
              onChange={(e) => setFormData(prev => ({ ...prev, medicacion: e.target.value }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horario
            </label>
            <input
              type="time"
              required
              value={formData.horario}
              onChange={(e) => setFormData(prev => ({ ...prev, horario: e.target.value }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dosis
            </label>
            <input
              type="text"
              required
              value={formData.dosis}
              onChange={(e) => setFormData(prev => ({ ...prev, dosis: e.target.value }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Ej: 1 pastilla, 5ml, etc."
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
              Guardar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicalRecordForm;