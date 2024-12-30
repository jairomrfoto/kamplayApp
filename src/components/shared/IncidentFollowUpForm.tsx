import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../../store/store';

interface Props {
  incidentId: string;
  onClose: () => void;
}

const IncidentFollowUpForm = ({ incidentId, onClose }: Props) => {
  const { currentMonitor, currentCoordinator, addIncidentFollowUp } = useStore();
  const [comentario, setComentario] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addIncidentFollowUp(incidentId, {
      comentario,
      realizadoPor: currentMonitor?.id || currentCoordinator?.id || ''
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Añadir Seguimiento</h3>
          <button onClick={onClose}>
            <X className="text-gray-500 hover:text-gray-700" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comentario
            </label>
            <textarea
              required
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={4}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Escribe tu comentario de seguimiento..."
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
              Añadir Seguimiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncidentFollowUpForm;