import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tent, Users, UserCog, Plus, Calendar, MapPin, ChevronRight, Loader, Trash2, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/store';
import { useAuth } from '../hooks/useAuth';
import { archiveCamp } from '../services/firestore';
import type { Camp } from '../types/camp';

// ── Double-confirmation archive modal ──────────────────────────────────────────
interface ArchiveModalProps {
  camp: Camp;
  onCancel: () => void;
  onConfirmed: () => void;
}

const ArchiveModal = ({ camp, onCancel, onConfirmed }: ArchiveModalProps) => {
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

// ── Main component ─────────────────────────────────────────────────────────────
const MisCampamentos = () => {
  const { userCamps, currentCamp, switchCampFn, campCache, removeCampFromUser } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [archivingCamp, setArchivingCamp] = useState<Camp | null>(null);

  const activeCamps = userCamps.filter(c => c.status !== 'archived');

  const handleSwitch = (campId: string) => {
    switchCampFn?.(campId);
    navigate('/coordinator-dashboard');
  };

  const handleArchiveConfirmed = (campId: string) => {
    removeCampFromUser(campId);
    setArchivingCamp(null);
    if (currentCamp?.id === campId) navigate('/coordinator-dashboard');
  };

  const formatDate = (d: Date | string) => {
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDaysUntil = (d: Date | string) => {
    const date = d instanceof Date ? d : new Date(d);
    return Math.ceil((date.getTime() - Date.now()) / 86_400_000);
  };

  const getStatus = (camp: Camp) => {
    const now = Date.now();
    const start = new Date(camp.startDate).getTime();
    const end = new Date(camp.endDate).getTime();
    if (now < start) return { label: 'En preparación', color: 'bg-amber-100 text-amber-700' };
    if (now <= end)  return { label: 'En curso',        color: 'bg-green-100 text-green-700' };
    return                { label: 'Finalizado',        color: 'bg-gray-100 text-gray-600' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mis programas</h2>
          <p className="text-sm text-gray-500 mt-1">
            {activeCamps.length} {activeCamps.length !== 1 ? 'programas' : 'programa'} · Haz clic para gestionarlos
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/join-camp')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Plus size={16} />
            Unirse
          </button>
          <button
            onClick={() => navigate('/create-camp')}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors"
          >
            <Plus size={16} />
            Nuevo programa
          </button>
        </div>
      </div>

      {activeCamps.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Tent size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium mb-2">Aún no tienes ningún programa</p>
          <p className="text-gray-400 text-sm mb-6">Crea un campamento o campus, o únete con un código</p>
          <button
            onClick={() => navigate('/create-camp')}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Crear mi primer programa
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeCamps.map(camp => {
            const status = getStatus(camp);
            const cached = campCache[camp.id];
            const isActive = camp.id === currentCamp?.id;
            const daysUntil = getDaysUntil(camp.startDate);
            const isOwner = camp.mainCoordinator === user?.uid;

            return (
              <div
                key={camp.id}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all ${
                  isActive ? 'border-indigo-400' : 'border-transparent hover:border-orange-200'
                }`}
              >
                {/* Header */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg leading-tight">{camp.name}</h3>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${status.color}`}>
                        {status.label}
                      </span>
                      {isOwner && (
                        <button
                          onClick={() => setArchivingCamp(camp)}
                          title="Archivar programa"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                  {camp.location && (
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                      <MapPin size={13} />
                      <span>{camp.location}</span>
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} className="text-gray-400" />
                    <span>{formatDate(camp.startDate)} → {formatDate(camp.endDate)}</span>
                  </div>
                  {daysUntil > 0 && (
                    <p className="text-xs text-amber-600 mt-1 font-medium">
                      Comienza en {daysUntil} día{daysUntil !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="px-5 py-3 border-b border-gray-100">
                  {cached ? (
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-xl font-bold text-gray-900">{cached.campers.length}</p>
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                          <Users size={11} />{camp.type === 'campus' ? 'Participantes' : 'Acampados'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-gray-900">{cached.monitores.length}</p>
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                          <UserCog size={11} />Monitores
                        </p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-gray-900">{cached.grupos.length}</p>
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                          <Users size={11} />Grupos
                        </p>
                      </div>
                    </div>
                  ) : isActive ? (
                    <DataFromStore campType={camp.type} />
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-gray-400 text-sm py-1">
                      <Loader size={13} className="animate-spin" />
                      Cargando datos…
                    </div>
                  )}
                </div>

                {/* Action */}
                <div className="p-4">
                  {isActive ? (
                    <button
                      onClick={() => navigate('/coordinator-dashboard')}
                      className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-2 rounded-lg text-sm hover:bg-orange-600 transition-colors"
                    >
                      Gestionar <ChevronRight size={15} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSwitch(camp.id)}
                      className="w-full flex items-center justify-center gap-2 border border-indigo-300 text-orange-600 py-2 rounded-lg text-sm hover:bg-orange-50 transition-colors"
                    >
                      Cambiar a este programa <ChevronRight size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {archivingCamp && (
        <ArchiveModal
          camp={archivingCamp}
          onCancel={() => setArchivingCamp(null)}
          onConfirmed={() => handleArchiveConfirmed(archivingCamp.id)}
        />
      )}
    </div>
  );
};

const DataFromStore = ({ campType }: { campType?: string }) => {
  const { campers, monitores, grupos } = useStore();
  return (
    <div className="grid grid-cols-3 gap-3 text-center">
      <div>
        <p className="text-xl font-bold text-gray-900">{campers.length}</p>
        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
          <Users size={11} />{campType === 'campus' ? 'Participantes' : 'Acampados'}
        </p>
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900">{monitores.length}</p>
        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
          <UserCog size={11} />Monitores
        </p>
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900">{grupos.length}</p>
        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
          <Users size={11} />Grupos
        </p>
      </div>
    </div>
  );
};

export default MisCampamentos;
