import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, UserCog, Tent, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const [userType, setUserType] = useState<'parent' | 'monitor' | 'coordinator' | null>(null);
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        // Solo redirigir si tenemos un usuario (en caso de popup)
        if (userType === 'monitor') {
          navigate('/monitor-dashboard');
        } else if (userType === 'coordinator') {
          navigate('/coordinator-dashboard');
        } else if (userType === 'parent') {
          navigate('/parent-dashboard');
        }
      }
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userType === 'monitor') {
      navigate('/monitor-dashboard');
    } else if (userType === 'coordinator') {
      navigate('/coordinator-dashboard');
    } else if (userType === 'parent') {
      navigate('/parent-dashboard');
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
          {!userType ? (
            <div className="space-y-4">
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
            <form onSubmit={handleLogin} className="space-y-6">
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

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Iniciar sesión
                </button>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  <img 
                    src="https://www.google.com/favicon.ico" 
                    alt="Google" 
                    className="w-5 h-5"
                  />
                  <span>Continuar con Google</span>
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setUserType(null)}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Volver a selección de usuario
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;