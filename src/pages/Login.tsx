import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Tent, Loader } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signInWithEmail, signInWithGoogle, sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (user) navigate('/onboarding');
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size={32} className="animate-spin text-orange-600" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      const msg =
        err.code === 'auth/wrong-password' ? 'Contraseña incorrecta.' :
        err.code === 'auth/weak-password' ? 'La contraseña debe tener al menos 6 caracteres.' :
        err.code === 'auth/too-many-requests' ? 'Demasiados intentos. Espera un momento.' :
        'Error al iniciar sesión. Comprueba tu correo y contraseña.';
      setError(msg);
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('No se pudo iniciar sesión con Google. Inténtalo de nuevo.');
      }
      setGoogleLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    try {
      await sendPasswordReset(resetEmail);
      setResetSent(true);
    } catch (err: any) {
      setResetError(
        err.code === 'auth/user-not-found' ? 'No existe ninguna cuenta con ese correo.' :
        err.code === 'auth/invalid-email' ? 'Correo no válido.' :
        'No se pudo enviar el correo. Inténtalo de nuevo.'
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <Tent className="h-12 w-12 text-orange-600" />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Kamplay</h1>
            <p className="text-orange-600 font-medium">Tu pasión, su felicidad</p>
          </div>
        </Link>
        <h2 className="text-center text-3xl font-bold text-gray-900">Entrar a Kamplay</h2>
        <p className="text-center text-gray-500 mt-2 text-sm">
          Si no tienes cuenta, se crea automáticamente
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-xl">

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 transition-colors mb-6"
          >
            {googleLoading ? <Loader size={18} className="animate-spin" /> : <GoogleIcon />}
            Continuar con Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-gray-400">o con correo electrónico</span>
            </div>
          </div>

          {/* Email form */}
          {!showReset ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => { setShowReset(true); setResetEmail(email); setError(''); }}
                    className="text-xs text-orange-600 hover:text-orange-800"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader size={18} className="animate-spin" /> Entrando...</>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>
          ) : (
            /* Forgot password panel */
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-1">Recuperar contraseña</h3>
              <p className="text-sm text-gray-500 mb-4">
                Escribe tu correo y te enviaremos un enlace para restablecer la contraseña.
              </p>

              {resetSent ? (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 text-sm">
                  Correo enviado a <strong>{resetEmail}</strong>. Revisa tu bandeja de entrada.
                </div>
              ) : (
                <form onSubmit={handleReset} className="space-y-4">
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  {resetError && (
                    <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{resetError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {resetLoading ? <Loader size={16} className="animate-spin" /> : null}
                    Enviar enlace
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={() => { setShowReset(false); setResetSent(false); setResetError(''); }}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Volver al inicio de sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
