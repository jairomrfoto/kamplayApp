import React, { useState } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { UserCircle, Calendar, History, LogOut, ChevronDown, Users, BookOpen, Tent, Newspaper, ClipboardList, MessageCircle, PlusCircle, Clock, Lock, CreditCard } from 'lucide-react';
import Profile from '../components/monitor-dashboard/Profile';
import CurrentCamp from '../components/monitor-dashboard/CurrentCamp';
import Activities from '../components/monitor-dashboard/Activities';
import CampHistory from '../components/monitor-dashboard/CampHistory';
import MisAcampados from '../components/monitor-dashboard/MisAcampados';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../store/store';
import CampSwitcher from '../components/CampSwitcher';
import MisActividades from '../components/MisActividades';
import NovedadesFeed from '../components/novedades/NovedadesFeed';
import Asistencia from './Asistencia';
import ChatPanel from '../components/chat/ChatPanel';

const MonitorDashboard = () => {
  const [activeTab, setActiveTab] = useState('current');
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { currentCamp, currentMonitor } = useStore();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Monitor';
  const initial = displayName.charAt(0).toUpperCase();

  const isCampus = currentCamp?.type === 'campus';
  const isPendiente = currentMonitor?.pendiente === true;

  const hasPermiso = (key: keyof NonNullable<typeof currentMonitor>['permisos']) => {
    if (!currentMonitor) return true;
    return currentMonitor.permisos[key] === true;
  };

  const tabs = [
    { id: 'current',         label: isCampus ? 'Campus' : 'Campamento', icon: isCampus ? Users : Tent },
    { id: 'novedades',       label: 'Novedades',    icon: Newspaper },
    { id: 'chat',            label: 'Chat',         icon: MessageCircle },
    { id: 'acampados',       label: 'Mis Acampados',icon: Users },
    ...(isCampus && hasPermiso('asistencia') ? [{ id: 'asistencia', label: 'Asistencia', icon: ClipboardList }] : []),
    ...(hasPermiso('editarActividades') ? [{ id: 'activities', label: 'Actividades', icon: Calendar }] : []),
    { id: 'mis-actividades', label: 'Mi Biblioteca',icon: BookOpen },
    { id: 'profile',         label: 'Mi Perfil',    icon: UserCircle },
    { id: 'history',         label: 'Historial',    icon: History },
  ];

  const monitorName = user?.displayName || user?.email?.split('@')[0] || 'Monitor';

  const renderContent = () => {
    switch (activeTab) {
      case 'current':         return <CurrentCamp />;
      case 'novedades':       return <NovedadesFeed rol="monitor" />;
      case 'chat':            return <ChatPanel userRole="monitor" userName={monitorName} />;
      case 'acampados':       return <MisAcampados />;
      case 'asistencia':      return <Asistencia />;
      case 'activities':      return <Activities />;
      case 'mis-actividades': return <MisActividades />;
      case 'profile':         return <Profile />;
      case 'history':         return <CampHistory />;
      default:                return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-green-800 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏕️</span>
            <span className="text-lg font-extrabold">Kamplay</span>
            <span className="text-green-300 text-sm hidden sm:inline">· Panel de Monitor</span>
          </div>

          <div className="flex items-center gap-3">
            <CampSwitcher variant="header" />

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
              >
                <div className="w-7 h-7 bg-orange-400 rounded-full flex items-center justify-center text-sm font-bold">
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
                    <Link
                      to="/create-camp"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 w-full font-semibold"
                    >
                      <PlusCircle size={15} /> Crear mi campamento
                    </Link>
                    <Link
                      to="/mi-plan"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 w-full font-medium"
                    >
                      <CreditCard size={15} /> Mi Plan
                    </Link>
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
              Aún no estás vinculado a ningún programa. Pídele el código MON- al coordinador.
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

      {/* Pending permissions banner */}
      {isPendiente && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <Clock size={16} className="text-blue-600 flex-shrink-0" />
            <p className="text-blue-800 text-sm">
              <span className="font-semibold">Acceso pendiente de aprobación.</span>
              {' '}El coordinador revisará tus permisos pronto. Algunas funciones estarán disponibles una vez los active.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs — horizontal scroll on mobile */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <tab.icon size={15} />
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
