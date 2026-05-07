import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/store';
import { useAuth } from '../../hooks/useAuth';
import { useUserProfile } from '../../hooks/useUserProfile';
import { saveUserProfile, saveCampInfo, saveJoinCodes } from '../../services/firestore';
import { generateJoinCode } from '../../utils/generateJoinCode';
import { updateLocalCamp } from '../../utils/localProfile';
import { Users, Calendar, Package, MapPin, Clock, AlertTriangle, Copy, Check, UserCog, Loader, PlusCircle, RefreshCw, CreditCard, CheckCircle, Star } from 'lucide-react';
import IncidentForm from '../shared/IncidentForm';
import type { Camp } from '../../types/camp';
import type { UserProfile } from '../../types';

const CampOverview = () => {
  const { currentCamp, monitores, campers, actividades, incidencias, isLoading, setCurrentCamp } = useStore();
  const isCampus = currentCamp?.type === 'campus';
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, loading: profileLoading } = useUserProfile();
  const isActive = profile?.subscriptionStatus === 'active' || profile?.subscriptionStatus === 'trialing';
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [copiedMonitor, setCopiedMonitor] = useState(false);
  const [copiedParent, setCopiedParent] = useState(false);
  const [copiedTeacher, setCopiedTeacher] = useState(false);
  const [generatingTeacher, setGeneratingTeacher] = useState(false);

  // Camp creation form state
  const [creating, setCreating] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newCampType, setNewCampType] = useState<'campamento' | 'campus'>('campamento');
  const [campData, setCampData] = useState({
    name: '', location: '', startDate: '', endDate: '',
    maxCampers: 30, monitorsCount: 3,
  });

  const copyToClipboard = async (text: string, type: 'monitor' | 'parent' | 'teacher') => {
    await navigator.clipboard.writeText(text);
    if (type === 'monitor') {
      setCopiedMonitor(true);
      setTimeout(() => setCopiedMonitor(false), 2000);
    } else if (type === 'teacher') {
      setCopiedTeacher(true);
      setTimeout(() => setCopiedTeacher(false), 2000);
    } else {
      setCopiedParent(true);
      setTimeout(() => setCopiedParent(false), 2000);
    }
  };

  const handleGenerateTeacherCode = async () => {
    if (!currentCamp) return;
    setGeneratingTeacher(true);
    const teacherCode = generateJoinCode('PROF');
    const updatedCamp: Camp = {
      ...currentCamp,
      joinCodes: { ...currentCamp.joinCodes, teachers: teacherCode },
    };
    await saveCampInfo(updatedCamp).catch(console.error);
    setCurrentCamp(updatedCamp);
    updateLocalCamp(user?.uid || '', updatedCamp.id, updatedCamp);
    setGeneratingTeacher(false);
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
      teachers: generateJoinCode('PROF'),
    };
    const camp: Camp = {
      id: campId,
      name: campData.name,
      type: newCampType,
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
      await Promise.all([
        saveCampInfo(camp),
        saveUserProfile(profile),
        saveJoinCodes(campId, codes.monitors, codes.families),
      ]);
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

  // Only block the full view with a spinner when there is no camp yet.
  // If currentCamp already exists (e.g. loaded from localStorage), show it
  // immediately — the background data refresh doesn't need to hide the UI.
  if (isLoading && !currentCamp) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size={32} className="animate-spin text-orange-600" />
      </div>
    );
  }

  // No camp yet
  if (!currentCamp) {
    // Still loading profile — wait before deciding which state to show
    if (profileLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader size={32} className="animate-spin text-orange-600" />
        </div>
      );
    }

    // No subscription → show pricing CTA
    if (!isActive) {
      return (
        <div className="max-w-2xl mx-auto mt-8 space-y-6">
          <div className="text-center">
            <div className="text-5xl mb-3">🏕️</div>
            <h2 className="text-2xl font-extrabold text-gray-900">Bienvenido a Kamplay</h2>
            <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
              Para crear y gestionar campamentos o campus elige el plan que mejor se adapte a ti.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Express', price: '9 €', note: 'Hasta 3 días', features: ['1 campamento o campus', 'Acampados, grupos y monitores', 'Actividades y asistencia', 'Editable 2 días post-evento'] },
              { label: 'Estándar', price: '15 €', note: 'Hasta 7 días', popular: true, features: ['1 campamento o campus', 'Actividades, menú e incidencias', 'Escáner de documentos', 'Editable 7 días post-evento'] },
              { label: 'Profesional', price: '30 €/mes', note: 'Ilimitado', features: ['Campamentos ilimitados', 'Sin límite de duración', 'Escáner de documentos', 'Directorio y valoraciones'] },
            ].map(plan => (
              <div
                key={plan.label}
                className={`relative bg-white rounded-2xl border-2 p-5 ${plan.popular ? 'border-orange-400 shadow-md' : 'border-gray-200'}`}
              >
                {plan.popular && (
                  <span className="absolute -top-2.5 left-4 bg-orange-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Star size={10} /> Más popular
                  </span>
                )}
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{plan.label}</p>
                <p className="text-2xl font-extrabold text-gray-900">{plan.price}</p>
                <p className="text-xs text-orange-500 font-semibold mb-4">{plan.note}</p>
                <ul className="space-y-1.5 mb-4">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-gray-600">
                      <CheckCircle size={12} className="text-green-500 flex-shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => navigate('/mi-plan')}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-colors text-sm"
            >
              <CreditCard size={16} /> Ver planes y precios
            </button>
          </div>
          <p className="text-center text-xs text-gray-400">
            Pago único por evento o suscripción mensual · Cancela cuando quieras
          </p>
        </div>
      );
    }

    // Has subscription → show create camp prompt
    return (
      <div className="max-w-lg mx-auto mt-8">
        {!creating ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusCircle size={32} className="text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Aún no tienes ningún programa</h2>
            <p className="text-gray-500 text-sm mb-6">
              Crea tu primer campamento o campus para empezar a gestionar participantes, monitores y actividades.
            </p>
            <button
              onClick={() => navigate('/create-camp')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Crear campamento o campus
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Nuevo programa</h2>
            <p className="text-sm text-gray-500 mb-5">Rellena los datos básicos del campamento o campus</p>

            <form onSubmit={handleCreateCamp} className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Tipo de programa</p>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setNewCampType('campamento')}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                      newCampType === 'campamento' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200'
                    }`}>
                    <span className="text-xl">🏕️</span>
                    <div><p className="font-semibold text-xs text-gray-900">Campamento</p><p className="text-xs text-gray-400">Con pernocta</p></div>
                  </button>
                  <button type="button" onClick={() => setNewCampType('campus')}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                      newCampType === 'campus' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'
                    }`}>
                    <span className="text-xl">🏫</span>
                    <div><p className="font-semibold text-xs text-gray-900">Campus</p><p className="text-xs text-gray-400">Actividades diurnas</p></div>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del programa</label>
                <input type="text" required value={campData.name}
                  onChange={e => setCampData({ ...campData, name: e.target.value })}
                  placeholder="Ej: Campamento Verano 2025 / Campus Arte"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                <input type="text" required value={campData.location}
                  onChange={e => setCampData({ ...campData, location: e.target.value })}
                  placeholder="Ej: Sierra de Gredos, Ávila"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
                  <input type="date" required value={campData.startDate}
                    onChange={e => setCampData({ ...campData, startDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
                  <input type="date" required value={campData.endDate} min={campData.startDate}
                    onChange={e => setCampData({ ...campData, endDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nº acampados</label>
                  <input type="number" min={1} required value={campData.maxCampers}
                    onChange={e => setCampData({ ...campData, maxCampers: parseInt(e.target.value) || 1 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nº monitores</label>
                  <input type="number" min={1} required value={campData.monitorsCount}
                    onChange={e => setCampData({ ...campData, monitorsCount: parseInt(e.target.value) || 1 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              </div>

              {createError && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{createError}</p>}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setCreating(false)}
                  className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={createLoading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                  {createLoading ? <><Loader size={16} className="animate-spin" /> Creando...</> : `Crear ${newCampType === 'campus' ? 'campus' : 'campamento'}`}
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
      <DemoSectionBanner description="Vista general de tu programa: métricas clave, últimas novedades del equipo e incidencias pendientes de resolución. Desde aquí también puedes crear nuevos campamentos o campus." />
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
        <div className="bg-orange-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Users className="text-orange-600" size={20} />
            <div>
              <p className="text-xs text-gray-500">{isCampus ? 'Participantes' : 'Acampados'}</p>
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
          <Package size={18} className="text-orange-600" />
          Códigos de acceso al programa
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Comparte estos códigos para que monitores, familias y profesores puedan acceder a la app.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2 flex items-center gap-1">
              <UserCog size={14} /> Código para monitores
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xl font-mono font-bold text-indigo-900 tracking-widest">
                {currentCamp.joinCodes.monitors}
              </span>
              <button
                onClick={() => copyToClipboard(currentCamp.joinCodes.monitors, 'monitor')}
                className="flex items-center gap-1 text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors shrink-0"
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
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 sm:col-span-2">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1">
              🎓 Código para profesores
            </p>
            {currentCamp.joinCodes.teachers ? (
              <div className="flex items-center justify-between gap-2">
                <span className="text-xl font-mono font-bold text-green-900 tracking-widest">
                  {currentCamp.joinCodes.teachers}
                </span>
                <button
                  onClick={() => copyToClipboard(currentCamp.joinCodes.teachers!, 'teacher')}
                  className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors shrink-0"
                >
                  {copiedTeacher ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-gray-500">Este {isCampus ? 'campus' : 'campamento'} aún no tiene código para profesores.</p>
                <button
                  onClick={handleGenerateTeacherCode}
                  disabled={generatingTeacher}
                  className="flex items-center gap-1.5 text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors shrink-0 whitespace-nowrap"
                >
                  {generatingTeacher
                    ? <><Loader size={12} className="animate-spin" /> Generando...</>
                    : <><RefreshCw size={12} /> Generar código</>
                  }
                </button>
              </div>
            )}
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
