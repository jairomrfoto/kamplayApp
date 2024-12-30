import React from 'react';
import { useStore } from '../store/store';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Dashboard from './Dashboard';
import Calendario from './Calendario';
import Actividades from './Actividades';
import Acampados from './Acampados';
import Materiales from './Materiales';
import Monitores from './Monitores';
import Grupos from './Grupos';
import Cabanas from './Cabanas';
import AreaMedica from './AreaMedica';
import Incidencias from './Incidencias'; 
import Menu from './Menu';
import CoordinatorProfile from '../components/coordinator/CoordinatorProfile';
import CoordinatorManagement from '../components/coordinator/CoordinatorManagement';
import CampOverview from '../components/coordinator/CampOverview';

const CoordinatorDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-6">
          <Routes>
            <Route path="/" element={<CampOverview />} />
            <Route path="/profile" element={<CoordinatorProfile />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/actividades" element={<Actividades />} />
            <Route path="/acampados" element={<Acampados />} />
            <Route path="/materiales" element={<Materiales />} />
            <Route path="/monitores" element={<Monitores />} />
            <Route path="/grupos" element={<Grupos />} />
            <Route path="/cabanas" element={<Cabanas />} />
            <Route path="/area-medica" element={<AreaMedica />} />
            <Route path="/incidencias" element={<Incidencias />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/coordinadores" element={<CoordinatorManagement />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;