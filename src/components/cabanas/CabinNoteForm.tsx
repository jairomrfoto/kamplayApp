import React, { useState } from 'react';
import { X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useStore } from '../../store/store';
import type { CabinNote } from '../../types';

interface Props {
  cabanaId: string;
  onClose: () => void;
}

const CabinNoteForm = ({ cabanaId, onClose }: Props) => {
  const { currentMonitor, updateCabana, cabanas } = useStore();
  const cabana = cabanas.find(c => c.id === cabanaId);

  const [formData, setFormData] = useState<Omit<CabinNote, 'id'>>({
    fecha: new Date(),
    valoracion: 5,
    estadoLimpieza: 'Bueno',
    observaciones: '',
    monitor: currentMonitor?.id || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cabana) return;

    const newNote: CabinNote = {
      id: crypto.randomUUID(),
      ...formData
    };

    updateCabana({
      ...cabana,
      notas: [...(cabana.notas || []), newNote]
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Nueva Nota de Limpieza</h3>
          <button onClick={onClose}>
            <X className="text-gray-500 hover:text-gray-700" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de revisión
            </label>
            <DatePicker
              selected={formData.fecha}
              onChange={(date) => setFormData(prev => ({
                ...prev,
                fecha: date || new Date()
              }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              dateFormat="dd/MM/yyyy"
              maxDate={new Date()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valoración (1-10)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={formData.valoracion}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  valoracion: parseInt(e.target.value)
                }))}
                className="flex-1"
              />
              <span className="text-lg font-semibold text-indigo-600 min-w-[2.5rem] text-center">
                {formData.valoracion}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado de Limpieza
            </label>
            <select
              required
              value={formData.estadoLimpieza}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                estadoLimpieza: e.target.value as CabinNote['estadoLimpieza']
              }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="Excelente">Excelente</option>
              <option value="Bueno">Bueno</option>
              <option value="Regular">Regular</option>
              <option value="Necesita Atención">Necesita Atención</option>
            </select>
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
              rows={4}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Detalles sobre la limpieza, mantenimiento necesario, etc..."
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
              Guardar Nota
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CabinNoteForm;