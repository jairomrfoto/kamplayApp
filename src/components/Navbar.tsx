import React, { useState } from 'react';
import { LogOut, User, ChevronDown, PlusCircle, Menu } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../store/store';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toggleSidebar } = useStore();
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
    <nav className="bg-green-800 text-white px-4 py-3 relative sticky top-0 z-30">
      <div className="max-w-full flex justify-between items-center gap-2">

        {/* Left: hamburger (mobile) + logo */}
        <div className="flex items-center gap-2 min-w-0">
          {isCoordinator && (
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-1.5 rounded-lg hover:bg-green-700 flex-shrink-0"
              aria-label="Abrir menú"
            >
              <Menu size={22} />
            </button>
          )}
          <Link
            to={isCoordinator ? '/coordinator-dashboard' : isMonitor ? '/monitor-dashboard' : '/parent-dashboard'}
            className="flex items-center gap-2 min-w-0"
          >
            <span className="text-xl flex-shrink-0">🏕️</span>
            <h1 className="text-base lg:text-lg font-extrabold truncate">Kamplay</h1>
          </Link>
        </div>

        {/* Right: join camp + profile */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            to="/join-camp"
            className="flex items-center gap-1.5 text-sm bg-white/15 hover:bg-white/25 text-white font-medium px-3 py-1.5 rounded-lg transition-colors border border-white/20"
          >
            <PlusCircle size={15} />
            <span className="hidden sm:inline">Unirme a campamento</span>
          </Link>

          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
            >
              <div className="w-7 h-7 bg-orange-400 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold">{initial}</span>
              </div>
              <span className="text-sm hidden sm:block max-w-[120px] truncate">{displayName}</span>
              <ChevronDown size={14} />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 text-gray-900 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="font-bold text-sm truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>

                {isCoordinator && (
                  <Link
                    to="/coordinator-dashboard/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <User size={15} /> Mi perfil
                  </Link>
                )}

                <div className="border-t border-gray-100 mt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 w-full"
                  >
                    <LogOut size={15} /> Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showProfileMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
      )}
    </nav>
  );
};

export default Navbar;
