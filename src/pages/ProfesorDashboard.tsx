import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Calendar, UtensilsCrossed, Tent, UsersRound, FileText,
  LogOut, ChevronDown, MessageCircle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../store/store';
import CampSwitcher from '../components/CampSwitcher';
import ProfesorAcampados from '../components/profesor/ProfesorAcampados';
import ProfesorActividades from '../components/profesor/ProfesorActividades';
import ProfesorMenu from '../components/profesor/ProfesorMenu';
import ProfesorGrupos from '../components/profesor/ProfesorGrupos';
import ProfesorCabanas from '../components/profesor/ProfesorCabanas';
import ProfesorDocumentacion from '../components/profesor/ProfesorDocumentacion';
import ChatPanel from '../components/chat/ChatPanel';

const TABS = [
  { id: 'acampados',    label: 'Acampados',     icon: Users },
  { id: 'actividades',  label: 'Actividades',   icon: Calendar },
  { id: 'menu',         label: 'Menú',          icon: UtensilsCrossed },
  { id: 'grupos',       label: 'Grupos',        icon: UsersRound },
  { id: 'cabanas',      label: 'Cabañas',       icon: Tent },
  { id: 'documentacion',label: 'Documentación', icon: FileText },
  { id: 'chat',         label: 'Chat',          icon: MessageCircle },
];

export default function ProfesorDashboard() {
  const [activeTab, setActiveTab] = useState('acampados');
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { currentCamp } = useStore();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Profesor';
  const initial = displayName.charAt(0).toUpperCase();

  const profesorName = user?.displayName || user?.email?.split('@')[0] || 'Profesor';

  const renderContent = () => {
    switch (activeTab) {
      case 'acampados':     return <ProfesorAcampados />;
      case 'actividades':   return <ProfesorActividades />;
      case 'menu':          return <ProfesorMenu />;
      case 'grupos':        return <ProfesorGrupos />;
      case 'cabanas':       return <ProfesorCabanas />;
      case 'documentacion': return <ProfesorDocumentacion />;
      case 'chat':          return <ChatPanel userRole="profesor" userName={profesorName} />;
      default:              return null;
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
            <span className="text-green-300 text-sm hidden sm:inline">· Panel de Profesor</span>
          </div>

          <div className="flex items-center gap-3">
            <CampSwitcher variant="header" />

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
              >
                <div className="w-7 h-7 bg-blue-400 rounded-full flex items-center justify-center text-sm font-bold">
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
              Aún no estás vinculado a ningún campamento. Pídele el código PROF- al coordinador.
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
        {currentCamp && (
          <div className="mb-4 bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
            <span className="text-lg">🏕️</span>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{currentCamp.name}</p>
              <p className="text-xs text-gray-400">{currentCamp.location}</p>
            </div>
            <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
              Solo lectura
            </span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
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
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
