import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { archiveCamp } from '../../services/firestore';
import type { Camp } from '../../types/camp';

interface Props {
  camp: Camp;
  onCancel: () => void;
  onConfirmed: () => void;
}

const ArchiveCampModal = ({ camp, onCancel, onConfirmed }: Props) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFinalConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await archiveCamp(camp.id);
      onConfirmed();
    } catch (e: any) {
      setError(e?.message || 'Error al archivar. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 p-2 rounded-full flex-shrink-0">
            <AlertTriangle className="text-red-600" size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            {step === 1 ? 'Archivar programa' : '¿Seguro? Esta acción no se puede deshacer'}
          </h3>
        </div>

        {step === 1 ? (
          <>
            <p className="text-gray-600 text-sm mb-1">
              Vas a archivar <span className="font-semibold">"{camp.name}"</span>.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              El programa dejará de aparecer en tu lista. Los datos se conservarán en la base de datos y podrás recuperarlo contactando con soporte.
            </p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-red-500 text-white py-2.5 rounded-xl text-sm hover:bg-red-600 transition-colors"
              >
                Archivar programa
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-600 text-sm mb-1">
              Confirma que quieres archivar <span className="font-semibold">"{camp.name}"</span>.
            </p>
            <p className="text-red-600 text-sm font-medium mb-6">
              Monitores, familias y profesores perderán el acceso al programa.
            </p>
            {error && (
              <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                disabled={loading}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleFinalConfirm}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {loading ? 'Archivando...' : 'Sí, archivar definitivamente'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ArchiveCampModal;
