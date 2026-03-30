import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, UserCog, Tent, UserPlus, Loader, Mail } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signInWithGoogle, signInWithEmail } = useAuth();
  const [userType, setUserType] = useState<'parent' | 'monitor' | 'coordinator' | null>(null);
  const [loginMethod, setLoginMethod] = useState<'choose' | 'email'>('choose');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // When Firebase Auth resolves with a user, go to onboarding
  useEffect(() => {
    if (authLoading) return;
    if (user) navigate('/onboarding');
  }, [user, authLoading]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      // onAuthStateChanged fires → useEffect navigates to /onboarding
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Error al iniciar sesión con Google. Inténtalo de nuevo.');
      }
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      await signInWithEmail(email, password);
      // onAuthStateChanged fires → useEffect navigates to /onboarding
    } catch (err: any) {
      const msg =
        err.code === 'auth/wrong-password' ? 'Contraseña incorrecta.' :
        err.code === 'auth/invalid-email' ? 'Correo no válido.' :
        err.code === 'auth/weak-password' ? 'La contraseña debe tener al menos 6 caracteres.' :
        'Error al iniciar sesión. Inténtalo de nuevo.';
      setError(msg);
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center gap-3 mb-8 group">
          <Tent className="h-12 w-12 text-indigo-600 group-hover:scale-110 transition-transform" />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Kamplay</h1>
            <p className="text-indigo-600 font-medium">Tu pasión, su felicidad</p>
          </div>
        </Link>
        <h2 className="text-center text-3xl font-bold text-gray-900">Iniciar sesión</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

          {/* Paso 1: Selección de tipo de usuario */}
          {!userType ? (
            <div className="space-y-4">
              <p className="text-center text-gray-600 mb-6">¿Quién eres?</p>
              <button
                onClick={() => setUserType('coordinator')}
                className="w-full flex items-center justify-center gap-3 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <UserPlus size={20} /> Coordinador
              </button>
              <button
                onClick={() => setUserType('parent')}
                className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Users size={20} /> Padres o Tutores
              </button>
              <button
                onClick={() => setUserType('monitor')}
                className="w-full flex items-center justify-center gap-3 border-2 border-indigo-600 text-indigo-600 px-4 py-3 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <UserCog size={20} /> Monitor
              </button>
            </div>
          ) : (
            /* Paso 2: Método de acceso */
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {userType === 'parent' && 'Acceso para Padres'}
                  {userType === 'monitor' && 'Acceso para Monitores'}
                  {userType === 'coordinator' && 'Acceso para Coordinadores'}
                </h2>
              </div>

              {error && (
                <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
              )}

              {loginMethod === 'choose' && (
                <>
                  {/* Opción Google */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors"
                  >
                    {loading ? (
                      <><Loader size={18} className="animate-spin" /><span>Redirigiendo...</span></>
                    ) : (
                      <><img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" /><span>Continuar con Google</span></>
                    )}
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">o</span>
                    </div>
                  </div>

                  {/* Opción correo */}
                  <button
                    type="button"
                    onClick={() => setLoginMethod('email')}
                    className="w-full flex items-center justify-center gap-3 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Mail size={18} /> Continuar con correo
                  </button>
                </>
              )}

              {loginMethod === 'email' && (
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="tu@correo.com"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? <><Loader size={18} className="animate-spin" /> Entrando...</> : 'Entrar'}
                  </button>
                  <button type="button" onClick={() => setLoginMethod('choose')} className="w-full text-sm text-gray-500 hover:text-gray-700">
                    ← Volver
                  </button>
                </form>
              )}

              {loginMethod === 'choose' && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setUserType(null); setError(''); setLoginMethod('choose'); }}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Volver a selección de usuario
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
