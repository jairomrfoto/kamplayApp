import React, { useState } from 'react';
import { Plus, Trash2, Newspaper } from 'lucide-react';
import { useStore } from '../../store/store';
import { useAuth } from '../../hooks/useAuth';
import NovedadForm from './NovedadForm';
import DemoSectionBanner from '../DemoSectionBanner';
import PendingPermissionAlert from '../PendingPermissionAlert';

interface Props {
  rol?: 'coordinator' | 'monitor' | 'parent';
}

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'Ahora mismo';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  const days = Math.floor(diff / 86400);
  return days === 1 ? 'Ayer' : `Hace ${days} días`;
}

const NovedadesFeed = ({ rol = 'parent' }: Props) => {
  const { novedades, deleteNovedad, currentCamp, currentMonitor } = useStore();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showPendingAlert, setShowPendingAlert] = useState(false);
  const isPendiente = currentMonitor?.pendiente === true;

  const canPost = rol === 'coordinator' || rol === 'monitor';

  const sorted = [...novedades].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  if (!currentCamp) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        Selecciona un campamento para ver las novedades.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DemoSectionBanner description="Canal de comunicación interna del equipo. Comparte avisos, novedades y actualizaciones entre coordinadores y monitores. Todo el equipo ve las publicaciones en tiempo real." />
      {showPendingAlert && <PendingPermissionAlert onClose={() => setShowPendingAlert(false)} />}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800">Novedades 📢</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {rol === 'parent'
              ? 'Lo último del campamento'
              : 'Comparte actualizaciones con las familias'}
          </p>
        </div>
        {canPost && (
          <button
            onClick={() => isPendiente ? setShowPendingAlert(true) : setShowForm(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nueva novedad</span>
            <span className="sm:hidden">Nueva</span>
          </button>
        )}
      </div>

      {/* Feed */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center">
          <Newspaper size={36} className="mx-auto text-gray-200 mb-3" />
          <p className="font-semibold text-gray-500">Aún no hay novedades</p>
          {canPost && (
            <p className="text-sm text-gray-400 mt-1">
              Publica la primera actualización para que las familias estén al día
            </p>
          )}
          {!canPost && (
            <p className="text-sm text-gray-400 mt-1">
              Los monitores y coordinadores publicarán novedades del campamento aquí
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(novedad => (
            <div
              key={novedad.id}
              className="bg-white rounded-2xl border border-stone-100 p-4 sm:p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                {/* Emoji badge */}
                <div className="flex-shrink-0 w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-xl">
                  {novedad.emoji || '📢'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                    {novedad.texto}
                  </p>

                  <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    <span className="text-xs font-semibold text-gray-600">{novedad.autor}</span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      novedad.rol === 'coordinator'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-orange-50 text-orange-700'
                    }`}>
                      {novedad.rol === 'coordinator' ? 'Coordinador' : 'Monitor'}
                    </span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{timeAgo(novedad.fecha)}</span>
                  </div>
                </div>

                {/* Delete button (own posts or coordinator) */}
                {canPost && (novedad.autorId === user?.uid || rol === 'coordinator') && (
                  <button
                    onClick={() => {
                      if (window.confirm('¿Eliminar esta novedad?')) deleteNovedad(novedad.id);
                    }}
                    className="flex-shrink-0 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <NovedadForm
          rol={rol as 'coordinator' | 'monitor'}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default NovedadesFeed;
