import React, { useState } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { UserCircle, Tent, Calendar, History, PlusCircle, LogOut, ChevronDown, Users } from 'lucide-react';
import Profile from '../components/monitor-dashboard/Profile';
import CurrentCamp from '../components/monitor-dashboard/CurrentCamp';
import Activities from '../components/monitor-dashboard/Activities';
import CampHistory from '../components/monitor-dashboard/CampHistory';
import MisAcampados from '../components/monitor-dashboard/MisAcampados';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../store/store';
import CampSwitcher from '../components/CampSwitcher';

const MonitorDashboard = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { currentCamp } = useStore();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Monitor';
  const initial = displayName.charAt(0).toUpperCase();

  const tabs = [
    { id: 'current', label: 'Campamento', icon: Tent },
    { id: 'acampados', label: 'Mis Acampados', icon: Users },
    { id: 'activities', label: 'Actividades', icon: Calendar },
    { id: 'profile', label: 'Mi Perfil', icon: UserCircle },
    { id: 'history', label: 'Historial', icon: History },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'current': return <CurrentCamp />;
      case 'acampados': return <MisAcampados />;
      case 'activities': return <Activities />;
      case 'profile': return <Profile />;
      case 'history': return <CampHistory />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-indigo-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tent size={22} />
            <span className="text-lg font-bold">Kamplay</span>
            <span className="text-indigo-300 text-sm hidden sm:inline">· Panel de Monitor</span>
          </div>

          <div className="flex items-center gap-3">
            <CampSwitcher variant="header" />

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-indigo-700"
              >
                <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-medium">
                  {initial}
                </div>
                <ChevronDown size={14} />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg py-2 text-gray-900 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium">{displayName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 w-full"
                    >
                      <LogOut size={15} /> Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* No camp banner */}
      {!currentCamp && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-amber-800 text-sm">
              Aún no estás vinculado a ningún campamento. Pídele el código al coordinador.
            </p>
            <Link
              to="/join-camp"
              className="text-sm bg-amber-600 text-white px-4 py-1.5 rounded-lg hover:bg-amber-700 whitespace-nowrap"
            >
              Introducir código
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <Routes>
            <Route path="/" element={renderContent()} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default MonitorDashboard;
