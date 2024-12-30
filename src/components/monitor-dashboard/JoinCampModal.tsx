import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../../store/store';
import { useNavigate } from 'react-router-dom';

interface Props {
  onClose: () => void;
}

const JoinCampModal = ({ onClose }: Props) => {
  const navigate = useNavigate();
  const { joinCamp } = useStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('El código es requerido');
      return;
    }
    
    const success = joinCamp(code.trim().toUpperCase(), 'monitor');
    if (success) {
      navigate('/monitor-dashboard');
    } else {
      setError('Código inválido o campamento no encontrado');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Unirse a un Campamento</h3>
          <button onClick={onClose}>
            <X className="text-gray-500 hover:text-gray-700" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código del Campamento
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="Ej: ABC123"
              maxLength={6}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 uppercase"
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
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
              Unirse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinCampModal;