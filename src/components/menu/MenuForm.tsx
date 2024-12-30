import React, { useState } from 'react';
import { X, Plus, Trash } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useStore } from '../../store/store';
import type { MenuItem } from '../../types';

interface Props {
  menu?: MenuItem;
  onClose: () => void;
}

const MenuForm = ({ menu, onClose }: Props) => {
  const { addMenu, updateMenu } = useStore();
  const [formData, setFormData] = useState({
    fecha: menu?.fecha || new Date(),
    comidas: {
      desayuno: menu?.comidas.desayuno || [''],
      almuerzo: menu?.comidas.almuerzo || {
        primerPlato: '',
        segundoPlato: '',
        postre: ''
      },
      merienda: menu?.comidas.merienda || [''],
      cena: menu?.comidas.cena || {
        primerPlato: '',
        segundoPlato: '',
        postre: ''
      }
    },
    alergenos: menu?.alergenos || [],
    observaciones: menu?.observaciones || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (menu) {
      updateMenu({
        ...menu,
        ...formData
      });
    } else {
      const newMenu: MenuItem = {
        id: crypto.randomUUID(),
        ...formData
      };
      addMenu(newMenu);
    }
    onClose();
  };

  const handleArrayChange = (field: 'desayuno' | 'merienda', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      comidas: {
        ...prev.comidas,
        [field]: prev.comidas[field].map((item, i) => i === index ? value : item)
      }
    }));
  };

  const addArrayItem = (field: 'desayuno' | 'merienda') => {
    setFormData(prev => ({
      ...prev,
      comidas: {
        ...prev.comidas,
        [field]: [...prev.comidas[field], '']
      }
    }));
  };

  const removeArrayItem = (field: 'desayuno' | 'merienda', index: number) => {
    setFormData(prev => ({
      ...prev,
      comidas: {
        ...prev.comidas,
        [field]: prev.comidas[field].filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">
            {menu ? 'Editar Menú' : 'Nuevo Menú'}
          </h3>
          <button onClick={onClose}>
            <X className="text-gray-500 hover:text-gray-700" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <DatePicker
              selected={formData.fecha}
              onChange={(date) => setFormData(prev => ({ ...prev, fecha: date || new Date() }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              dateFormat="dd/MM/yyyy"
            />
          </div>

          {/* Desayuno */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Desayuno
              </label>
              <button
                type="button"
                onClick={() => addArrayItem('desayuno')}
                className="text-indigo-600 hover:text-indigo-700"
              >
                <Plus size={20} />
              </button>
            </div>
            {formData.comidas.desayuno.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange('desayuno', index, e.target.value)}
                  className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Añadir elemento del desayuno"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('desayuno', index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash size={20} />
                </button>
              </div>
            ))}
          </div>

          {/* Almuerzo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Almuerzo
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={formData.comidas.almuerzo.primerPlato}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  comidas: {
                    ...prev.comidas,
                    almuerzo: {
                      ...prev.comidas.almuerzo,
                      primerPlato: e.target.value
                    }
                  }
                }))}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Primer plato"
              />
              <input
                type="text"
                value={formData.comidas.almuerzo.segundoPlato}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  comidas: {
                    ...prev.comidas,
                    almuerzo: {
                      ...prev.comidas.almuerzo,
                      segundoPlato: e.target.value
                    }
                  }
                }))}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Segundo plato"
              />
              <input
                type="text"
                value={formData.comidas.almuerzo.postre}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  comidas: {
                    ...prev.comidas,
                    almuerzo: {
                      ...prev.comidas.almuerzo,
                      postre: e.target.value
                    }
                  }
                }))}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Postre"
              />
            </div>
          </div>

          {/* Merienda */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Merienda
              </label>
              <button
                type="button"
                onClick={() => addArrayItem('merienda')}
                className="text-indigo-600 hover:text-indigo-700"
              >
                <Plus size={20} />
              </button>
            </div>
            {formData.comidas.merienda.map((item, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange('merienda', index, e.target.value)}
                  className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Añadir elemento de la merienda"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('merienda', index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash size={20} />
                </button>
              </div>
            ))}
          </div>

          {/* Cena */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cena
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={formData.comidas.cena.primerPlato}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  comidas: {
                    ...prev.comidas,
                    cena: {
                      ...prev.comidas.cena,
                      primerPlato: e.target.value
                    }
                  }
                }))}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Primer plato"
              />
              <input
                type="text"
                value={formData.comidas.cena.segundoPlato}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  comidas: {
                    ...prev.comidas,
                    cena: {
                      ...prev.comidas.cena,
                      segundoPlato: e.target.value
                    }
                  }
                }))}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Segundo plato"
              />
              <input
                type="text"
                value={formData.comidas.cena.postre}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  comidas: {
                    ...prev.comidas,
                    cena: {
                      ...prev.comidas.cena,
                      postre: e.target.value
                    }
                  }
                }))}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Postre"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Observaciones adicionales..."
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
              {menu ? 'Guardar Cambios' : 'Crear Menú'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenuForm;