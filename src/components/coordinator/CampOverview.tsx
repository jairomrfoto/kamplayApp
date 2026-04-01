import React, { useState } from 'react';
import { useStore } from '../../store/store';
import { useAuth } from '../../hooks/useAuth';
import { saveUserProfile, saveCampInfo } from '../../services/firestore';
import { generateJoinCode } from '../../utils/generateJoinCode';
import { updateLocalCamp } from '../../utils/localProfile';
import { Users, Calendar, Package, MapPin, Clock, AlertTriangle, Copy, Check, UserCog, Loader, PlusCircle } from 'lucide-react';
import IncidentForm from '../shared/IncidentForm';
import type { Camp } from '../../types/camp';
import type { UserProfile } from '../../types';

const CampOverview = () => {
  const { currentCamp, monitores, campers, actividades, incidencias, isLoading, setCurrentCamp } = useStore();
  const { user } = useAuth();
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [copiedMonitor, setCopiedMonitor] = useState(false);
  const [copiedParent, setCopiedParent] = useState(false);

  // Camp creation form state
  const [creating, setCreating] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [campData, setCampData] = useState({
    name: '', location: '', startDate: '', endDate: '',
    maxCampers: 30, monitorsCount: 3,
  });

  const copyToClipboard = async (text: string, type: 'monitor' | 'parent') => {
    await navigator.clipboard.writeText(text);
    if (type === 'monitor') {
      setCopiedMonitor(true);
      setTimeout(() => setCopiedMonitor(false), 2000);
    } else {
      setCopiedParent(true);
      setTimeout(() => setCopiedParent(false), 2000);
    }
  };

  const handleCreateCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setCreateLoading(true);
    setCreateError('');

    const campId = crypto.randomUUID();
    const codes = {
      monitors: generateJoinCode('MON'),
      families: generateJoinCode('PAD'),
    };
    const camp: Camp = {
      id: campId,
      name: campData.name,
      location: campData.location,
      startDate: new Date(campData.startDate),
      endDate: new Date(campData.endDate),
      maxCampers: campData.maxCampers,
      monitorsCount: campData.monitorsCount,
      joinCodes: codes,
      coordinators: [user.uid],
      mainCoordinator: user.uid,
    };
    const profile: UserProfile = {
      uid: user.uid,
      campId,
      role: 'coordinator',
      email: user.email || '',
      nombre: user.displayName || user.email?.split('@')[0] || 'Coordinador',
    };

    try {
      // Save to Firestore first — this is required for other users to find the camp
      await Promise.all([saveCampInfo(camp), saveUserProfile(profile)]);
    } catch (err) {
      console.error('Firestore save error:', err);
      setCreateError('Error al guardar en la base de datos. Comprueba tu conexión e inténtalo de nuevo.');
      setCreateLoading(false);
      return;
    }

    // Only update UI and localStorage after Firestore confirms
    updateLocalCamp(user.uid, campId, camp);
    setCurrentCamp(camp);
    setCreating(false);
    setCreateLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  // No camp yet — show prompt to create one
  if (!currentCamp) {
    return (
      <div className="max-w-lg mx-auto mt-8">
        {!creating ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusCircle size={32} className="text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Aún no tienes ningún campamento</h2>
            <p className="text-gray-500 text-sm mb-6">
              Crea tu primer campamento para empezar a gestionar acampados, monitores y actividades.
            </p>
            <button
              onClick={() => setCreating(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Crear campamento
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Crear campamento</h2>
            <p className="text-sm text-gray-500 mb-5">Rellena los datos básicos del campamento</p>

            <form onSubmit={handleCreateCamp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del campamento</label>
                <input type="text" required value={campData.name}
                  onChange={e => setCampData({ ...campData, name: e.target.value })}
                  placeholder="Ej: Campamento Verano 2025"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                <input type="text" required value={campData.location}
                  onChange={e => setCampData({ ...campData, location: e.target.value })}
                  placeholder="Ej: Sierra de Gredos, Ávila"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
                  <input type="date" required value={campData.startDate}
                    onChange={e => setCampData({ ...campData, startDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
                  <input type="date" required value={campData.endDate} min={campData.startDate}
                    onChange={e => setCampData({ ...campData, endDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nº acampados</label>
                  <input type="number" min={1} required value={campData.maxCampers}
                    onChange={e => setCampData({ ...campData, maxCampers: parseInt(e.target.value) || 1 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nº monitores</label>
                  <input type="number" min={1} required value={campData.monitorsCount}
                    onChange={e => setCampData({ ...campData, monitorsCount: parseInt(e.target.value) || 1 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              {createError && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{createError}</p>}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setCreating(false)}
                  className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={createLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                  {createLoading ? <><Loader size={16} className="animate-spin" /> Creando...</> : 'Crear campamento'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  const formatDate = (d: Date | string) =>
    new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{currentCamp.name}</h1>
          <div className="flex items-center gap-4 mt-1 text-gray-500 text-sm">
            <span className="flex items-center gap-1"><MapPin size={14} /> {currentCamp.location}</span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {formatDate(currentCamp.startDate)} – {formatDate(currentCamp.endDate)}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowIncidentForm(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
        >
          <AlertTriangle size={16} /> Reportar incidencia
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-indigo-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Users className="text-indigo-600" size={20} />
            <div>
              <p className="text-xs text-gray-500">Acampados</p>
              <p className="text-2xl font-bold text-gray-900">{campers.length}</p>
              <p className="text-xs text-gray-400">/ {currentCamp.maxCampers} plazas</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <UserCog className="text-green-600" size={20} />
            <div>
              <p className="text-xs text-gray-500">Monitores</p>
              <p className="text-2xl font-bold text-gray-900">{monitores.length}</p>
              <p className="text-xs text-gray-400">/ {currentCamp.monitorsCount} previstos</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Calendar className="text-purple-600" size={20} />
            <div>
              <p className="text-xs text-gray-500">Actividades</p>
              <p className="text-2xl font-bold text-gray-900">{actividades.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500" size={20} />
            <div>
              <p className="text-xs text-gray-500">Incidencias</p>
              <p className="text-2xl font-bold text-gray-900">{incidencias.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Join codes */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package size={18} className="text-indigo-600" />
          Códigos de acceso al campamento
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Comparte estos códigos para que monitores y familias puedan acceder a la app.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2 flex items-center gap-1">
              <UserCog size={14} /> Código para monitores
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xl font-mono font-bold text-indigo-900 tracking-widest">
                {currentCamp.joinCodes.monitors}
              </span>
              <button
                onClick={() => copyToClipboard(currentCamp.joinCodes.monitors, 'monitor')}
                className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors shrink-0"
              >
                {copiedMonitor ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
              </button>
            </div>
          </div>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Users size={14} /> Código para padres/tutores
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xl font-mono font-bold text-blue-900 tracking-widest">
                {currentCamp.joinCodes.families}
              </span>
              <button
                onClick={() => copyToClipboard(currentCamp.joinCodes.families, 'parent')}
                className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors shrink-0"
              >
                {copiedParent ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent incidents */}
      {incidencias.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Últimas incidencias</h2>
          <div className="space-y-3">
            {incidencias.slice(0, 3).map(inc => (
              <div key={inc.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${
                  inc.tipo === 'grave' ? 'bg-red-500' :
                  inc.tipo === 'moderada' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div>
                  <p className="text-sm text-gray-800">{inc.descripcion}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(inc.fecha).toLocaleDateString('es-ES')} · {inc.estado}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showIncidentForm && <IncidentForm onClose={() => setShowIncidentForm(false)} />}
    </div>
  );
};

export default CampOverview;
