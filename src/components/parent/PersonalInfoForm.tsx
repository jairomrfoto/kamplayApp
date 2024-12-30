import React, { useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import type { Camper } from '../../types';

interface Props {
  camper: Camper;
  onSave: (updatedInfo: Pick<Camper, 'nombre' | 'edad' | 'foto'>) => void;
  onCancel: () => void;
}

const PersonalInfoForm = ({ camper, onSave, onCancel }: Props) => {
  const [formData, setFormData] = useState({
    nombre: camper.nombre,
    edad: camper.edad,
    foto: camper.foto || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center">
        <div className="relative mb-4">
          {formData.foto ? (
            <img
              src={formData.foto}
              alt="Preview"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-lg">
              <Camera className="w-12 h-12 text-gray-400" />
            </div>
          )}
          <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full text-white cursor-pointer hover:bg-indigo-700 transition-colors">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormData(prev => ({
                      ...prev,
                      foto: reader.result as string
                    }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <Upload size={16} />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre
        </label>
        <input
          type="text"
          value={formData.nombre}
          onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
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
          value={formData.edad}
          onChange={(e) => setFormData(prev => ({ ...prev, edad: parseInt(e.target.value) || prev.edad }))}
          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
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
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Guardar Cambios
        </button>
      </div>
    </form>
  );
};

export default PersonalInfoForm;