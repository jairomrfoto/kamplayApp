import React, { useState } from 'react';
import { Lock, Loader, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../config/firebase';

const ChangePassword = () => {
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Only show for email/password users
  const isEmailUser = auth.currentUser?.providerData.some(p => p.providerId === 'password');
  if (!isEmailUser) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }
    if (next.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await changePassword(current, next);
      setSuccess(true);
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err: any) {
      setError(
        err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
          ? 'La contraseña actual no es correcta.'
          : err.code === 'auth/too-many-requests'
          ? 'Demasiados intentos. Espera un momento.'
          : 'No se pudo cambiar la contraseña. Inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lock size={18} className="text-indigo-600" />
        <h3 className="font-semibold text-gray-800">Cambiar contraseña</h3>
      </div>

      {success ? (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
          <CheckCircle size={18} />
          Contraseña cambiada correctamente.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
            <input
              type="password"
              required
              value={current}
              onChange={e => { setCurrent(e.target.value); setSuccess(false); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
            <input
              type="password"
              required
              minLength={6}
              value={next}
              onChange={e => setNext(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {loading && <Loader size={14} className="animate-spin" />}
            Guardar nueva contraseña
          </button>
        </form>
      )}
    </div>
  );
};

export default ChangePassword;
