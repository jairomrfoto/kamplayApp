import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useStore } from '../../store/store';
import MaterialInput from './MaterialInput';
import { categorias } from '../../utils/actividadesConfig';
import ActividadSelector from './ActividadSelector';
import type { Actividad } from '../../types';

interface Props {
  onClose: () => void;
}

const ActividadForm = ({ onClose }: Props) => {
  const { addActividad, materiales, addMaterial, currentMonitor, actividades } = useStore();
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [showMonitorActivities, setShowMonitorActivities] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    inicio: new Date(),
    fin: new Date(),
    imagen: '',
    categoria: '',
    duracion: 60,
    materialesIds: [] as string[],
    capacidadMaxima: 20,
    edadMinima: 6,
    edadMaxima: 16,
    ubicacion: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const nuevaActividad: Actividad = {
      id: crypto.randomUUID(),
      ...formData,
      inicio: formData.inicio,
      fin: formData.fin,
      grupo: '',
      monitores: [],
      materiales: formData.materialesIds,
    };

    addActividad(nuevaActividad);
    onClose();
  };

  const handleSelectMonitorActivity = (activity: any) => {
    setFormData(prev => ({
      ...prev,
      titulo: activity.titulo,
      descripcion: activity.descripcion,
      categoria: activity.categoria,
      duracion: activity.duracion,
      materialesIds: activity.materiales,
      capacidadMaxima: activity.capacidadMaxima,
      edadMinima: activity.edadMinima,
      edadMaxima: activity.edadMaxima,
      ubicacion: activity.ubicacion
    }));
    setShowMonitorActivities(false);
  };

  const handleSelectExistingActivity = (actividad: Actividad) => {
    setFormData(prev => ({
      ...prev,
      titulo: actividad.titulo,
      descripcion: actividad.descripcion || '',
      imagen: actividad.imagen || '',
      categoria: actividad.categoria || '',
      duracion: actividad.duracion || 60,
      materialesIds: actividad.materiales || [],
      capacidadMaxima: actividad.capacidadMaxima || 20,
      edadMinima: actividad.edadMinima || 6,
      edadMaxima: actividad.edadMaxima || 16,
      ubicacion: actividad.ubicacion || ''
    }));
    setMode('new'); // Cambiamos a modo edición después de seleccionar
  };

  const handleAddNewMaterial = (newMaterial: Omit<Material, 'id'>) => {
    const material = {
      id: crypto.randomUUID(),
      ...newMaterial
    };
    addMaterial(material);
    setFormData(prev => ({
      ...prev,
      materialesIds: [...prev.materialesIds, material.id]
    }));
  };

  return (
    <div className="bg-white rounded-xl max-w-2xl w-full p-4 lg:p-6 mx-4 lg:mx-0">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Nueva Actividad</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>

      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <button
            type="button"
            onClick={() => setMode('new')}
            className={`flex-1 py-2 px-4 rounded-lg ${
              mode === 'new'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Crear Nueva Actividad
          </button>
          <button
            type="button"
            onClick={() => setMode('existing')}
            className={`flex-1 py-2 px-4 rounded-lg ${
              mode === 'existing'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Usar Actividad Existente
          </button>
        </div>

        {mode === 'existing' && (
          <ActividadSelector
            actividades={actividades}
            onSelect={handleSelectExistingActivity}
          />
        )}
      </div>

      {currentMonitor?.actividades && (
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowMonitorActivities(!showMonitorActivities)}
            className="w-full bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100"
          >
            Usar una de mis actividades anteriores
          </button>

          {showMonitorActivities && (
            <div className="mt-4 border rounded-lg p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar en mis actividades..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {currentMonitor.actividades.map((activity: any) => (
                  <div
                    key={activity.id}
                    onClick={() => handleSelectMonitorActivity(activity)}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <h4 className="font-medium">{activity.titulo}</h4>
                    <p className="text-sm text-gray-600">{activity.descripcion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título
          </label>
          <input
            type="text"
            required
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.titulo}
            onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows={3}
            value={formData.descripcion}
            onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Imagen de la actividad
          </label>
          <div className="flex items-center gap-4">
            {formData.imagen && (
              <img
                src={formData.imagen}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
            <input
              type="file"
              accept="image/*"
              className="text-sm text-gray-600"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormData(prev => ({
                      ...prev,
                      imagen: reader.result as string
                    }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Sube una imagen representativa de la actividad
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              required
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.categoria}
              onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duración (minutos)
            </label>
            <input
              type="number"
              min="15"
              step="15"
              required
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.duracion}
              onChange={(e) => setFormData(prev => ({ ...prev, duracion: parseInt(e.target.value) }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha y hora de inicio
            </label>
            <DatePicker
              selected={formData.inicio}
              onChange={(date) => {
                if (date) {
                  setFormData(prev => {
                    const fin = new Date(date.getTime() + prev.duracion * 60000);
                    return { ...prev, inicio: date, fin };
                  });
                }
              }}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy HH:mm"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha y hora de fin
            </label>
            <DatePicker
              selected={formData.fin}
              onChange={(date) => date && setFormData(prev => ({ ...prev, fin: date }))}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="dd/MM/yyyy HH:mm"
              minDate={formData.inicio}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Materiales Necesarios
          </label>
          <MaterialInput
            existingMaterials={materiales}
            selectedMaterials={formData.materialesIds}
            onMaterialsChange={(materials) => setFormData(prev => ({
              ...prev,
              materialesIds: materials
            }))}
            onAddNewMaterial={handleAddNewMaterial}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacidad Máxima
            </label>
            <input
              type="number"
              min="1"
              required
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={formData.capacidadMaxima}
              onChange={(e) => setFormData(prev => ({ ...prev, capacidadMaxima: parseInt(e.target.value) }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rango de Edad
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="6"
                max="16"
                required
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.edadMinima}
                onChange={(e) => setFormData(prev => ({ ...prev, edadMinima: parseInt(e.target.value) }))}
              />
              <span>-</span>
              <input
                type="number"
                min="6"
                max="16"
                required
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={formData.edadMaxima}
                onChange={(e) => setFormData(prev => ({ ...prev, edadMaxima: parseInt(e.target.value) }))}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ubicación
          </label>
          <input
            type="text"
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={formData.ubicacion}
            onChange={(e) => setFormData(prev => ({ ...prev, ubicacion: e.target.value }))}
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
            Crear Actividad
          </button>
        </div>
      </form>
    </div>
  );
};

export default ActividadForm;