import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tent, Users, UserCog, UserPlus, ArrowLeft, Loader, Copy, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { saveUserProfile, saveCampInfo, getCampByCode, getUserProfile } from '../services/firestore';
import { generateJoinCode } from '../utils/generateJoinCode';
import type { UserProfile } from '../types';
import type { Camp } from '../types/camp';

type Role = 'coordinator' | 'monitor' | 'parent';
type Step = 'role' | 'coordinator-setup' | 'join-camp' | 'codes-created';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [error, setError] = useState('');
  const [copiedMonitor, setCopiedMonitor] = useState(false);
  const [copiedParent, setCopiedParent] = useState(false);
  const [createdCodes, setCreatedCodes] = useState<{ monitors: string; families: string } | null>(null);

  const [campData, setCampData] = useState({
    name: '',
    location: '',
    startDate: '',
    endDate: '',
    maxCampers: 30,
    monitorsCount: 3,
  });

  const [joinCode, setJoinCode] = useState('');

  // Redirect to login if not authenticated; redirect to dashboard if already has profile
  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }

    const checkProfile = async () => {
      try {
        const profile = await getUserProfile(user.uid);
        if (profile?.role) {
          if (profile.role === 'coordinator') navigate('/coordinator-dashboard');
          else if (profile.role === 'monitor') navigate('/monitor-dashboard');
          else navigate('/parent-dashboard');
          return;
        }
      } catch { /* stay on onboarding */ }
      setCheckingProfile(false);
    };
    checkProfile();
  }, [user, authLoading]);

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

  // ── Role selection ──────────────────────────────────────────────────────────
  const handleRoleSelect = async (selectedRole: Role) => {
    if (!user) return;
    setRole(selectedRole);
    setLoading(true);

    try {
      await saveUserProfile({
        uid: user.uid,
        campId: '',
        role: selectedRole,
        email: user.email || '',
        nombre: user.displayName || user.email?.split('@')[0] || '',
      });
      if (selectedRole === 'coordinator') navigate('/coordinator-dashboard');
      else if (selectedRole === 'monitor') navigate('/monitor-dashboard');
      else navigate('/parent-dashboard');
    } catch (err) {
      console.error(err);
      setError('Error al guardar tu perfil. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  // ── Coordinator: create camp ────────────────────────────────────────────────
  const handleCreateCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');

    try {
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

      await Promise.all([saveCampInfo(camp), saveUserProfile(profile)]);
      setCreatedCodes(codes);
      setStep('codes-created');
    } catch (err) {
      console.error(err);
      setError('Error al crear el campamento. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // ── Monitor / Parent: join with code ───────────────────────────────────────
  const handleJoinCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !role) return;
    setLoading(true);
    setError('');

    try {
      const code = joinCode.trim().toUpperCase();
      const isMonitor = code.startsWith('MON-');
      const isParent = code.startsWith('PAD-');

      if (!isMonitor && !isParent) {
        setError('Código inválido. Los códigos de monitor empiezan por MON- y los de padres por PAD-.');
        setLoading(false);
        return;
      }

      const type = isMonitor ? 'monitor' : 'family';
      const camp = await getCampByCode(code, type);

      if (!camp) {
        setError('Código no encontrado. Pídele el código al coordinador del campamento.');
        setLoading(false);
        return;
      }

      const assignedRole: Role = isMonitor ? 'monitor' : 'parent';
      const profile: UserProfile = {
        uid: user.uid,
        campId: camp.id,
        role: assignedRole,
        email: user.email || '',
        nombre: user.displayName || user.email?.split('@')[0] || '',
      };

      await saveUserProfile(profile);

      if (assignedRole === 'monitor') navigate('/monitor-dashboard');
      else navigate('/parent-dashboard');
    } catch (err) {
      console.error(err);
      setError('Error al unirse. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  if (authLoading || checkingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Tent className="h-12 w-12 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kamplay</h1>
            <p className="text-indigo-600 font-medium text-sm">Tu pasión, su felicidad</p>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-xl">

          {/* STEP 1: Role selection */}
          {step === 'role' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">¡Bienvenido!</h2>
                <p className="mt-2 text-gray-600">¿Cuál es tu rol en el campamento?</p>
              </div>
              <button onClick={() => { setRole('coordinator'); setStep('coordinator-setup'); }}
                className="w-full flex items-center gap-4 bg-green-50 border-2 border-green-200 hover:border-green-500 text-gray-800 px-5 py-4 rounded-xl transition-all">
                <div className="bg-green-100 p-2 rounded-lg"><UserPlus size={24} className="text-green-600" /></div>
                <div className="text-left">
                  <p className="font-semibold">Coordinador</p>
                  <p className="text-sm text-gray-500">Creo y gestiono campamentos</p>
                </div>
              </button>
              <button onClick={() => handleRoleSelect('monitor')}
                className="w-full flex items-center gap-4 bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-500 text-gray-800 px-5 py-4 rounded-xl transition-all">
                <div className="bg-indigo-100 p-2 rounded-lg"><UserCog size={24} className="text-indigo-600" /></div>
                <div className="text-left">
                  <p className="font-semibold">Monitor</p>
                  <p className="text-sm text-gray-500">Accedo a mi panel y me uno al campamento</p>
                </div>
              </button>
              <button onClick={() => handleRoleSelect('parent')}
                className="w-full flex items-center gap-4 bg-blue-50 border-2 border-blue-200 hover:border-blue-500 text-gray-800 px-5 py-4 rounded-xl transition-all">
                <div className="bg-blue-100 p-2 rounded-lg"><Users size={24} className="text-blue-600" /></div>
                <div className="text-left">
                  <p className="font-semibold">Padre / Tutor</p>
                  <p className="text-sm text-gray-500">Accedo a mi panel y me uno al campamento</p>
                </div>
              </button>
            </div>
          )}

          {/* STEP 2A: Coordinator — create camp */}
          {step === 'coordinator-setup' && (
            <form onSubmit={handleCreateCamp} className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <button type="button" onClick={() => setStep('role')} className="text-gray-400 hover:text-gray-600">
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Crear tu campamento</h2>
                  <p className="text-sm text-gray-500">Rellena los datos básicos</p>
                </div>
              </div>

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

              {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                {loading ? <><Loader size={18} className="animate-spin" /> Creando campamento...</> : 'Crear campamento'}
              </button>
            </form>
          )}

          {/* STEP 2B: Monitor / Parent — join with code */}
          {step === 'join-camp' && (
            <form onSubmit={handleJoinCamp} className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <button type="button" onClick={() => setStep('role')} className="text-gray-400 hover:text-gray-600">
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {role === 'monitor' ? 'Acceso como monitor' : 'Acceso de padre/tutor'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {role === 'monitor' ? 'Código que empieza por MON-' : 'Código que empieza por PAD-'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código de acceso</label>
                <input type="text" required value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  placeholder={role === 'monitor' ? 'MON-XXXXXX' : 'PAD-XXXXXX'}
                  maxLength={10}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase" />
              </div>

              {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

              <button type="submit" disabled={loading || joinCode.length < 4}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                {loading ? <><Loader size={18} className="animate-spin" /> Verificando...</> : 'Unirme al campamento'}
              </button>

              <p className="text-center text-sm text-gray-500">
                El coordinador del campamento te da este código
              </p>
            </form>
          )}

          {/* STEP 3: Codes display after camp creation */}
          {step === 'codes-created' && createdCodes && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl mb-3">🎉</div>
                <h2 className="text-2xl font-bold text-gray-900">¡Campamento creado!</h2>
                <p className="mt-2 text-gray-600 text-sm">
                  Comparte estos códigos con monitores y familias para que accedan a la app
                </p>
              </div>

              {/* Monitor code */}
              <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-indigo-700 mb-2 flex items-center gap-2">
                  <UserCog size={16} /> Código para MONITORES
                </p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-2xl font-mono font-bold text-indigo-900 tracking-widest">
                    {createdCodes.monitors}
                  </span>
                  <button
                    onClick={() => copyToClipboard(createdCodes.monitors, 'monitor')}
                    className="flex items-center gap-1 text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {copiedMonitor ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
                  </button>
                </div>
              </div>

              {/* Parent code */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
                  <Users size={16} /> Código para PADRES / TUTORES
                </p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-2xl font-mono font-bold text-blue-900 tracking-widest">
                    {createdCodes.families}
                  </span>
                  <button
                    onClick={() => copyToClipboard(createdCodes.families, 'parent')}
                    className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {copiedParent ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Guarda estos códigos. También los encontrarás en el panel de coordinador.
              </p>

              <button
                onClick={() => navigate('/coordinator-dashboard')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Ir al panel de coordinador →
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Onboarding;
