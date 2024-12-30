import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Material } from '../../types';

interface Props {
  existingMaterials: Material[];
  selectedMaterials: string[];
  onMaterialsChange: (materials: string[]) => void;
  onAddNewMaterial: (material: Omit<Material, 'id'>) => void;
}

const MaterialInput = ({ 
  existingMaterials, 
  selectedMaterials, 
  onMaterialsChange,
  onAddNewMaterial 
}: Props) => {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    nombre: '',
    cantidad: 1,
    categoria: '',
    estado: 'Disponible' as const
  });

  const handleAddNew = () => {
    onAddNewMaterial(newMaterial);
    setNewMaterial({
      nombre: '',
      cantidad: 1,
      categoria: '',
      estado: 'Disponible'
    });
    setShowNewForm(false);
  };

  return (
    <div className="space-y-4">
      <select
        multiple
        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        value={selectedMaterials}
        onChange={(e) => onMaterialsChange(
          Array.from(e.target.selectedOptions, option => option.value)
        )}
      >
        {existingMaterials.map(material => (
          <option key={material.id} value={material.id}>
            {material.nombre} ({material.cantidad} disponibles)
          </option>
        ))}
      </select>

      {!showNewForm ? (
        <button
          type="button"
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
        >
          <Plus size={18} />
          <span>Añadir nuevo material</span>
        </button>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Nuevo Material</span>
            <button
              type="button"
              onClick={() => setShowNewForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              required
              value={newMaterial.nombre}
              onChange={(e) => setNewMaterial(prev => ({
                ...prev,
                nombre: e.target.value
              }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                required
                value={newMaterial.cantidad}
                onChange={(e) => setNewMaterial(prev => ({
                  ...prev,
                  cantidad: parseInt(e.target.value) || 1
                }))}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <input
                type="text"
                required
                value={newMaterial.categoria}
                onChange={(e) => setNewMaterial(prev => ({
                  ...prev,
                  categoria: e.target.value
                }))}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddNew}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Añadir Material
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialInput;