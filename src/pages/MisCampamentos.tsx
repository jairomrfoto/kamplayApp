import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tent, Users, UserCog, Plus, Calendar, MapPin, ChevronRight, Loader } from 'lucide-react';
import { useStore } from '../store/store';

const MisCampamentos = () => {
  const { userCamps, currentCamp, switchCampFn, campCache } = useStore();
  const navigate = useNavigate();

  const handleSwitch = (campId: string) => {
    switchCampFn?.(campId);
    navigate('/coordinator-dashboard');
  };

  const formatDate = (d: Date | string) => {
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDaysUntil = (d: Date | string) => {
    const date = d instanceof Date ? d : new Date(d);
    const diff = Math.ceil((date.getTime() - Date.now()) / 86_400_000);
    return diff;
  };

  const getStatus = (camp: typeof userCamps[0]) => {
    const now = Date.now();
    const start = new Date(camp.startDate).getTime();
    const end = new Date(camp.endDate).getTime();
    if (now < start) return { label: 'En preparación', color: 'bg-amber-100 text-amber-700' };
    if (now <= end)  return { label: 'En curso', color: 'bg-green-100 text-green-700' };
    return { label: 'Finalizado', color: 'bg-gray-100 text-gray-600' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mis Campamentos</h2>
          <p className="text-sm text-gray-500 mt-1">
            {userCamps.length} campamento{userCamps.length !== 1 ? 's' : ''} · Haz clic para gestionarlos
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
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} />
            Nuevo campamento
          </button>
        </div>
      </div>

      {userCamps.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Tent size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium mb-2">Aún no tienes campamentos</p>
          <p className="text-gray-400 text-sm mb-6">Crea uno nuevo o únete con un código</p>
          <button
            onClick={() => navigate('/create-camp')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Crear mi primer campamento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {userCamps.map(camp => {
            const status = getStatus(camp);
            const cached = campCache[camp.id];
            const isActive = camp.id === currentCamp?.id;
            const daysUntil = getDaysUntil(camp.startDate);

            return (
              <div
                key={camp.id}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all ${
                  isActive ? 'border-indigo-400' : 'border-transparent hover:border-indigo-200'
                }`}
              >
                {/* Header */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg leading-tight">{camp.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${status.color}`}>
                      {status.label}
                    </span>
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
                          <Users size={11} />Acampados
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
                    // Active camp — data is in store (not in cache)
                    <DataFromStore />
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
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
                    >
                      Gestionar <ChevronRight size={15} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSwitch(camp.id)}
                      className="w-full flex items-center justify-center gap-2 border border-indigo-300 text-indigo-600 py-2 rounded-lg text-sm hover:bg-indigo-50 transition-colors"
                    >
                      Cambiar a este campamento <ChevronRight size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/** Shows stats from the store (for the currently active camp whose data isn't in campCache) */
const DataFromStore = () => {
  const { campers, monitores, grupos } = useStore();
  return (
    <div className="grid grid-cols-3 gap-3 text-center">
      <div>
        <p className="text-xl font-bold text-gray-900">{campers.length}</p>
        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
          <Users size={11} />Acampados
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
