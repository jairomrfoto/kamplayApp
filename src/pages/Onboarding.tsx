import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tent, Users, UserCog, UserPlus, ArrowLeft, Loader } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { saveUserProfile, saveCampInfo, getCampByCode } from '../services/firestore';
import { generateJoinCode } from '../utils/generateJoinCode';
import type { UserProfile } from '../types';
import type { Camp } from '../types/camp';

type Role = 'coordinator' | 'monitor' | 'parent';
type Step = 'role' | 'coordinator-setup' | 'join-camp';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Datos para coordinador
  const [campData, setCampData] = useState({
    name: '',
    location: '',
    startDate: '',
    endDate: '',
    maxCampers: 30,
    monitorsCount: 3,
  });

  // Datos para monitor / padre
  const [joinCode, setJoinCode] = useState('');

  // ── Selección de rol ─────────────────────────────────────────────────────

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setStep(selectedRole === 'coordinator' ? 'coordinator-setup' : 'join-camp');
  };

  // ── Coordinador: crear campamento ────────────────────────────────────────

  const handleCreateCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const campId = crypto.randomUUID();

      const camp: Camp = {
        id: campId,
        name: campData.name,
        location: campData.location,
        startDate: new Date(campData.startDate),
        endDate: new Date(campData.endDate),
        maxCampers: campData.maxCampers,
        monitorsCount: campData.monitorsCount,
        joinCodes: {
          monitors: generateJoinCode(),
          families: generateJoinCode(),
        },
        coordinators: [user.uid],
        mainCoordinator: user.uid,
      };

      const profile: UserProfile = {
        uid: user.uid,
        campId,
        role: 'coordinator',
        email: user.email || '',
        nombre: user.displayName || '',
      };

      // Guardar campamento y perfil en Firestore en paralelo
      await Promise.all([
        saveCampInfo(camp),
        saveUserProfile(profile),
      ]);

      navigate('/coordinator-dashboard');
    } catch (err) {
      console.error(err);
      setError('Error al crear el campamento. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // ── Monitor / Padre: unirse con código ───────────────────────────────────

  const handleJoinCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !role) return;
    setLoading(true);
    setError('');

    try {
      const type = role === 'monitor' ? 'monitor' : 'family';
      const camp = await getCampByCode(joinCode.trim().toUpperCase(), type);

      if (!camp) {
        setError('Código incorrecto. Pídele el código al coordinador del campamento.');
        setLoading(false);
        return;
      }

      const profile: UserProfile = {
        uid: user.uid,
        campId: camp.id,
        role,
        email: user.email || '',
        nombre: user.displayName || '',
      };

      await saveUserProfile(profile);

      if (role === 'monitor') {
        navigate('/monitor-dashboard');
      } else {
        navigate('/parent-dashboard');
      }
    } catch (err) {
      console.error(err);
      setError('Error al unirse al campamento. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // ── UI ───────────────────────────────────────────────────────────────────

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

          {/* ── PASO 1: Selección de rol ── */}
          {step === 'role' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">¡Bienvenido!</h2>
                <p className="mt-2 text-gray-600">¿Cuál es tu rol en el campamento?</p>
              </div>

              <button
                onClick={() => handleRoleSelect('coordinator')}
                className="w-full flex items-center gap-4 bg-green-50 border-2 border-green-200 hover:border-green-500 text-gray-800 px-5 py-4 rounded-xl transition-all"
              >
                <div className="bg-green-100 p-2 rounded-lg">
                  <UserPlus size={24} className="text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Coordinador</p>
                  <p className="text-sm text-gray-500">Creo y gestiono campamentos</p>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('monitor')}
                className="w-full flex items-center gap-4 bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-500 text-gray-800 px-5 py-4 rounded-xl transition-all"
              >
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <UserCog size={24} className="text-indigo-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Monitor</p>
                  <p className="text-sm text-gray-500">Trabajo en un campamento</p>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('parent')}
                className="w-full flex items-center gap-4 bg-blue-50 border-2 border-blue-200 hover:border-blue-500 text-gray-800 px-5 py-4 rounded-xl transition-all"
              >
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users size={24} className="text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Padre / Tutor</p>
                  <p className="text-sm text-gray-500">Mi hijo va a un campamento</p>
                </div>
              </button>
            </div>
          )}

          {/* ── PASO 2A: Coordinador — crear campamento ── */}
          {step === 'coordinator-setup' && (
            <form onSubmit={handleCreateCamp} className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setStep('role')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Crear tu campamento</h2>
                  <p className="text-sm text-gray-500">Rellena los datos básicos</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del campamento
                </label>
                <input
                  type="text"
                  required
                  value={campData.name}
                  onChange={e => setCampData({ ...campData, name: e.target.value })}
                  placeholder="Ej: Campamento Verano 2025"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  required
                  value={campData.location}
                  onChange={e => setCampData({ ...campData, location: e.target.value })}
                  placeholder="Ej: Sierra de Gredos, Ávila"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha inicio
                  </label>
                  <input
                    type="date"
                    required
                    value={campData.startDate}
                    onChange={e => setCampData({ ...campData, startDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha fin
                  </label>
                  <input
                    type="date"
                    required
                    value={campData.endDate}
                    min={campData.startDate}
                    onChange={e => setCampData({ ...campData, endDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nº acampados
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={campData.maxCampers}
                    onChange={e => setCampData({ ...campData, maxCampers: parseInt(e.target.value) || 1 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nº monitores
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={campData.monitorsCount}
                    onChange={e => setCampData({ ...campData, monitorsCount: parseInt(e.target.value) || 1 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Creando campamento...
                  </>
                ) : (
                  'Crear campamento'
                )}
              </button>
            </form>
          )}

          {/* ── PASO 2B: Monitor / Padre — código de unión ── */}
          {step === 'join-camp' && (
            <form onSubmit={handleJoinCamp} className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setStep('role')}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {role === 'monitor' ? 'Unirte como monitor' : 'Seguir a tu hijo'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {role === 'monitor'
                      ? 'Introduce el código que te dio el coordinador'
                      : 'Introduce el código que te dio el campamento'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código de acceso
                </label>
                <input
                  type="text"
                  required
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Ej: MON123"
                  maxLength={10}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || joinCode.length < 3}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Verificando código...
                  </>
                ) : (
                  'Unirme al campamento'
                )}
              </button>

              <p className="text-center text-sm text-gray-500">
                {role === 'monitor'
                  ? 'El código te lo proporciona el coordinador del campamento'
                  : 'El código te lo envía el campamento por email o WhatsApp'}
              </p>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default Onboarding;
