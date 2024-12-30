import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { UserCircle, Tent, Calendar, LogOut, History, Home } from 'lucide-react';
import Profile from '../components/monitor-dashboard/Profile';
import CurrentCamp from '../components/monitor-dashboard/CurrentCamp';
import Activities from '../components/monitor-dashboard/Activities';
import CampHistory from '../components/monitor-dashboard/CampHistory';
import Calendario from './Calendario';
import Actividades from './Actividades';
import Acampados from './Acampados';
import Materiales from './Materiales';
import Monitores from './Monitores';
import Grupos from './Grupos';
import Cabanas from './Cabanas';
import AreaMedica from './AreaMedica';
import Incidencias from './Incidencias';

const MonitorDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  const handleHomeClick = () => {
    setActiveTab('current');
    navigate('/monitor-dashboard');
  };

  const tabs = [
    { id: 'profile', label: 'Mi Perfil', icon: UserCircle },
    { id: 'current', label: 'Campamento Actual', icon: Tent },
    { id: 'activities', label: 'Mis Actividades', icon: Calendar },
    { id: 'history', label: 'Historial', icon: History }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <Profile />;
      case 'current':
        return <CurrentCamp />;
      case 'activities':
        return <Activities />;
      case 'history':
        return <CampHistory />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleHomeClick}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-700"
            >
              <Home size={20} />
              <span>Inicio</span>
            </button>
            <h1 className="text-xl font-bold">Panel de Monitor</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-700 text-white"
            >
              <LogOut size={20} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap justify-center gap-4 mb-8 mt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={20} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <Routes>
            <Route path="/" element={renderContent()} />
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/actividades" element={<Actividades />} />
            <Route path="/acampados" element={<Acampados />} />
            <Route path="/materiales" element={<Materiales />} />
            <Route path="/monitores" element={<Monitores />} />
            <Route path="/grupos" element={<Grupos />} />
            <Route path="/cabanas" element={<Cabanas />} />
            <Route path="/area-medica" element={<AreaMedica />} />
            <Route path="/incidencias" element={<Incidencias />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default MonitorDashboard;