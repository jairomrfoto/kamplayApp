import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tent, Loader, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getCampByCode, addUserCampId, firestoreMonitores } from '../services/firestore';
import { addLocalCamp } from '../utils/localProfile';
import { useStore } from '../store/store';

const JoinCamp = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setCurrentCamp, addCampToUser } = useStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const trimmed = code.trim().toUpperCase();
      const isMonitor  = trimmed.startsWith('MON-');
      const isParent   = trimmed.startsWith('PAD-');
      const isProfesor = trimmed.startsWith('PROF-');

      if (!isMonitor && !isParent && !isProfesor) {
        setError('Código no válido. Los códigos empiezan por MON- (monitores), PAD- (familias) o PROF- (profesores).');
        setLoading(false);
        return;
      }

      const type = isMonitor ? 'monitor' : isProfesor ? 'teacher' : 'family';
      const camp = await getCampByCode(trimmed, type);

      if (!camp) {
        setError('Código no encontrado. Comprueba que es correcto.');
        setLoading(false);
        return;
      }

      const role = isMonitor ? 'monitor' : isProfesor ? 'profesor' : 'parent';

      const nombre = user.displayName || user.email?.split('@')[0] || 'Monitor';

      // Update store + localStorage immediately
      setCurrentCamp(camp);
      addCampToUser(camp);
      addLocalCamp(user.uid, camp.id, camp, role);

      if (isMonitor) navigate('/monitor-dashboard');
      else if (isProfesor) navigate('/profesor-dashboard');
      else navigate('/parent-dashboard');

      // Sync to Firestore in background (adds campId to campIds[] without replacing others)
      addUserCampId(user.uid, camp.id).catch(err => console.error('Error saving profile:', err));

      // Register monitor in the camp's monitors subcollection so the coordinator sees them
      if (isMonitor) {
        firestoreMonitores.save(camp.id, {
          id: user.uid,
          nombre,
          especialidad: '',
          grupoAsignado: '',
          cabanaAsignada: '',
          encuestas: [],
          permisos: {
            editarActividades: false,
            editarMateriales: false,
            editarGrupos: false,
            editarCabanas: false,
            editarAreaMedica: false,
          },
          email: user.email || '',
        }).catch(err => console.error('Error registering monitor:', err));
      }
    } catch (err) {
      console.error(err);
      setError('Error al unirse al campamento. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Tent className="h-10 w-10 text-orange-600" />
          <h1 className="text-2xl font-bold text-gray-900">Kamplay</h1>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-xl">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-6"
          >
            <ArrowLeft size={16} /> Volver
          </button>

          <h2 className="text-xl font-bold text-gray-900 mb-1">Unirme con código</h2>
          <p className="text-sm text-gray-500 mb-6">
            Introduce el código que te ha dado el coordinador del campamento o campus.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de acceso
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="MON-XXXXXX · PAD-XXXXXX · PROF-XXXXXX"
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-400 uppercase"
              />
              <p className="text-xs text-gray-400 mt-1">
                Monitores: MON-&nbsp;·&nbsp;Familias: PAD-&nbsp;·&nbsp;Profesores: PROF-
              </p>
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || code.length < 4}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <><Loader size={18} className="animate-spin" /> Verificando...</> : 'Acceder con código'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinCamp;
