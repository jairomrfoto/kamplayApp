import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useFirestoreSync } from './hooks/useFirestoreSync';
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
import ProfesorDashboard from './pages/ProfesorDashboard';
import Grupos from './pages/Grupos';
import Cabanas from './pages/Cabanas';
import AreaMedica from './pages/AreaMedica';
import Incidencias from './pages/Incidencias';
import Menu from './pages/Menu';
import CreateCamp from './pages/CreateCamp';
import Onboarding from './pages/Onboarding';
import JoinCamp from './pages/JoinCamp';
import Asistencia from './pages/Asistencia';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-orange-50 p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-8 max-w-md w-full text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Algo salió mal</h2>
            <p className="text-sm text-gray-500 mb-4">Recarga la página para continuar.</p>
            <pre className="text-xs text-left bg-gray-50 rounded-lg p-3 overflow-auto text-red-600 mb-4">
              {(this.state.error as Error).message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppRoutes() {
  useFirestoreSync();

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/benefits" element={<Benefits />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-camp" element={<CreateCamp />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/join-camp" element={<JoinCamp />} />
        <Route path="/parent-dashboard/*" element={<ParentDashboard />} />
        <Route path="/coordinator-dashboard/*" element={<CoordinatorDashboard />} />
        <Route path="/monitor-dashboard/*" element={<MonitorDashboard />} />
        <Route path="/profesor-dashboard/*" element={<ProfesorDashboard />} />
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
                    <Route path="/asistencia" element={<Asistencia />} />
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

function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}

export default App;