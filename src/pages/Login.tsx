import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, UserCog, Tent, UserPlus, Loader } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const [userType, setUserType] = useState<'parent' | 'monitor' | 'coordinator' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // When Firebase Auth resolves with a user, go to onboarding
  // Onboarding will handle routing to the correct dashboard
  useEffect(() => {
    if (authLoading) return;
    if (user) {
      navigate('/onboarding');
    }
  }, [user, authLoading]);

  const handleGoogleSignIn = async () => {
    if (!userType) return;
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      // Page redirects to Google — nothing runs after this
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError('Error al iniciar sesión. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          to="/"
          className="flex items-center justify-center gap-3 mb-8 group"
        >
          <Tent className="h-12 w-12 text-indigo-600 group-hover:scale-110 transition-transform" />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Kamplay</h1>
            <p className="text-indigo-600 font-medium">Tu pasión, su felicidad</p>
          </div>
        </Link>
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Iniciar sesión
        </h2>
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
                <UserPlus size={20} />
                Coordinador
              </button>
              <button
                onClick={() => setUserType('parent')}
                className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Users size={20} />
                Padres o Tutores
              </button>
              <button
                onClick={() => setUserType('monitor')}
                className="w-full flex items-center justify-center gap-3 border-2 border-indigo-600 text-indigo-600 px-4 py-3 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <UserCog size={20} />
                Monitor
              </button>
            </div>
          ) : (
            /* Paso 2: Login con Google */
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {userType === 'parent' && 'Acceso para Padres'}
                  {userType === 'monitor' && 'Acceso para Monitores'}
                  {userType === 'coordinator' && 'Acceso para Coordinadores'}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {userType === 'parent' && 'Accede para ver el progreso de tus hijos'}
                  {userType === 'monitor' && 'Accede para gestionar tus actividades'}
                  {userType === 'coordinator' && 'Accede para coordinar el campamento'}
                </p>
              </div>

              {error && (
                <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
              )}

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <img
                      src="https://www.google.com/favicon.ico"
                      alt="Google"
                      className="w-5 h-5"
                    />
                    <span>Continuar con Google</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setUserType(null); setError(''); }}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Volver a selección de usuario
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
