import React, { useState } from 'react';
import { Tent, LogOut, User, ChevronDown, PlusCircle } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isCoordinator = location.pathname.includes('/coordinator-dashboard');
  const isMonitor = location.pathname.includes('/monitor-dashboard');

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Usuario';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <nav className="bg-indigo-600 text-white p-4 relative">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to={isCoordinator ? '/coordinator-dashboard' : isMonitor ? '/monitor-dashboard' : '/parent-dashboard'}
          className="flex items-center space-x-2"
        >
          <Tent size={24} />
          <h1 className="text-lg lg:text-xl font-bold">Kamplay</h1>
        </Link>

        <Link
          to="/join-camp"
          className="flex items-center gap-1.5 text-sm bg-white text-indigo-600 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          <PlusCircle size={16} />
          <span className="hidden sm:inline">Unirme a campamento</span>
        </Link>

        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">{initial}</span>
            </div>
            <span className="text-sm hidden sm:block">{displayName}</span>
            <ChevronDown size={16} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg py-2 text-gray-900 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="font-medium text-sm">{displayName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              {isCoordinator && (
                <Link
                  to="/coordinator-dashboard/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User size={16} /> Mi perfil
                </Link>
              )}

              <div className="border-t border-gray-100 mt-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 w-full"
                >
                  <LogOut size={16} /> Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showProfileMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
      )}
    </nav>
  );
};

export default Navbar;
