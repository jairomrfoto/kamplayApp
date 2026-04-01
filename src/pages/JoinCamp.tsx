import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tent, Loader, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getCampByCode, saveUserProfile, getUserProfile } from '../services/firestore';
import { updateLocalCamp } from '../utils/localProfile';

const JoinCamp = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
      const isMonitor = trimmed.startsWith('MON-');
      const isParent = trimmed.startsWith('PAD-');

      if (!isMonitor && !isParent) {
        setError('Código no válido. Los códigos de monitor empiezan por MON- y los de padres por PAD-.');
        setLoading(false);
        return;
      }

      const type = isMonitor ? 'monitor' : 'family';
      const camp = await getCampByCode(trimmed, type);

      if (!camp) {
        setError('Código no encontrado. Comprueba que es correcto.');
        setLoading(false);
        return;
      }

      const role = isMonitor ? 'monitor' : 'parent';

      // Save locally and navigate immediately — no waiting for Firestore
      updateLocalCamp(user.uid, camp.id, camp);
      if (isMonitor) navigate('/monitor-dashboard');
      else navigate('/parent-dashboard');

      // Sync to Firestore in background
      getUserProfile(user.uid).then(currentProfile => {
        saveUserProfile({
          uid: user.uid,
          campId: camp.id,
          role,
          email: user.email || '',
          nombre: currentProfile?.nombre || user.email?.split('@')[0] || '',
        }).catch(err => console.error('Error saving profile to Firestore:', err));
      }).catch(() => {
        saveUserProfile({
          uid: user.uid,
          campId: camp.id,
          role,
          email: user.email || '',
          nombre: user.email?.split('@')[0] || '',
        }).catch(err => console.error('Error saving profile to Firestore:', err));
      });
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
          <Tent className="h-10 w-10 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-900">Kamplay</h1>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-xl">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-6"
          >
            <ArrowLeft size={16} /> Volver
          </button>

          <h2 className="text-xl font-bold text-gray-900 mb-1">Unirme a un campamento</h2>
          <p className="text-sm text-gray-500 mb-6">
            Introduce el código que te ha dado el coordinador del campamento.
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
                placeholder="MON-XXXXXX  o  PAD-XXXXXX"
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
              />
              <p className="text-xs text-gray-400 mt-1">
                Monitores: código MON-&nbsp;&nbsp;·&nbsp;&nbsp;Padres/tutores: código PAD-
              </p>
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || code.length < 4}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <><Loader size={18} className="animate-spin" /> Verificando...</> : 'Unirme al campamento'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinCamp;
