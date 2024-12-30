import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import About from './pages/About';
import Benefits from './pages/Benefits';
import Login from './pages/Login';
import ParentDashboard from './pages/ParentDashboard';
import Dashboard from './pages/Dashboard';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import Calendario from './pages/Calendario';
import Actividades from './pages/Actividades';
import Acampados from './pages/Acampados';
import Materiales from './pages/Materiales';
import Monitores from './pages/Monitores';
import MonitorDashboard from './pages/MonitorDashboard';
import Grupos from './pages/Grupos';
import Cabanas from './pages/Cabanas';
import AreaMedica from './pages/AreaMedica';
import Incidencias from './pages/Incidencias';
import Menu from './pages/Menu';
import CreateCamp from './pages/CreateCamp';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/benefits" element={<Benefits />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-camp" element={<CreateCamp />} />
        <Route path="/parent-dashboard/*" element={<ParentDashboard />} />
        <Route path="/coordinator-dashboard/*" element={<CoordinatorDashboard />} />
        <Route path="/monitor-dashboard/*" element={<MonitorDashboard />} />
        <Route
          path="/app/*"
          element={
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
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
                  </Routes>
                </main>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;