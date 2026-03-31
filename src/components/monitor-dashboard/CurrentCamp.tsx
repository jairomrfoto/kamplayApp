import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/store';
import { useAuth } from '../../hooks/useAuth';
import { MapPin, Calendar, Users, UserCog, AlertTriangle, Tent } from 'lucide-react';
import IncidentForm from '../shared/IncidentForm';

const CurrentCamp = () => {
  const { currentCamp, campers, monitores, grupos } = useStore();
  const { user } = useAuth();
  const [showIncidentForm, setShowIncidentForm] = React.useState(false);

  const formatDate = (d: Date | string) =>
    new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  if (!currentCamp) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Tent size={32} className="text-amber-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin campamento vinculado</h3>
        <p className="text-gray-500 text-sm mb-4">
          Usa el botón "Unirme a campamento" de arriba para introducir tu código MON-XXXXXX.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Camp info card */}
      <div className="bg-indigo-50 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{currentCamp.name}</h2>
            <div className="flex flex-wrap gap-4 mt-2 text-gray-600 text-sm">
              <span className="flex items-center gap-1">
                <MapPin size={14} className="text-indigo-500" />
                {currentCamp.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} className="text-indigo-500" />
                {formatDate(currentCamp.startDate)} – {formatDate(currentCamp.endDate)}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowIncidentForm(true)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm shrink-0"
          >
            <AlertTriangle size={16} /> Reportar incidencia
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <Users size={20} className="text-indigo-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{campers.length}</p>
          <p className="text-xs text-gray-500">Acampados</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <UserCog size={20} className="text-green-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{monitores.length}</p>
          <p className="text-xs text-gray-500">Monitores</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <Users size={20} className="text-purple-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900">{grupos.length}</p>
          <p className="text-xs text-gray-500">Grupos</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Accesos rápidos</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Acampados', path: '/coordinator-dashboard/acampados' },
            { label: 'Actividades', path: '/coordinator-dashboard/actividades' },
            { label: 'Grupos', path: '/coordinator-dashboard/grupos' },
            { label: 'Cabañas', path: '/coordinator-dashboard/cabanas' },
            { label: 'Menú', path: '/coordinator-dashboard/menu' },
            { label: 'Incidencias', path: '/coordinator-dashboard/incidencias' },
          ].map(link => (
            <Link
              key={link.path}
              to={link.path}
              className="text-center bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {showIncidentForm && <IncidentForm onClose={() => setShowIncidentForm(false)} />}
    </div>
  );
};

export default CurrentCamp;
