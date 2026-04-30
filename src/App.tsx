import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useFirestoreSync } from './hooks/useFirestoreSync';
import { Loader } from 'lucide-react';

// Eager — needed immediately on first paint
import Landing from './pages/Landing';
import About from './pages/About';
import Benefits from './pages/Benefits';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Lazy — only loaded when the user navigates to these routes
const ParentDashboard      = lazy(() => import('./pages/ParentDashboard'));
const Dashboard            = lazy(() => import('./pages/Dashboard'));
const CoordinatorDashboard = lazy(() => import('./pages/CoordinatorDashboard'));
const Calendario           = lazy(() => import('./pages/Calendario'));
const Actividades          = lazy(() => import('./pages/Actividades'));
const Acampados            = lazy(() => import('./pages/Acampados'));
const Materiales           = lazy(() => import('./pages/Materiales'));
const Monitores            = lazy(() => import('./pages/Monitores'));
const MonitorDashboard     = lazy(() => import('./pages/MonitorDashboard'));
const ProfesorDashboard    = lazy(() => import('./pages/ProfesorDashboard'));
const Grupos               = lazy(() => import('./pages/Grupos'));
const Cabanas              = lazy(() => import('./pages/Cabanas'));
const AreaMedica           = lazy(() => import('./pages/AreaMedica'));
const Incidencias          = lazy(() => import('./pages/Incidencias'));
const Menu                 = lazy(() => import('./pages/Menu'));
const CreateCamp           = lazy(() => import('./pages/CreateCamp'));
const JoinCamp             = lazy(() => import('./pages/JoinCamp'));
const Asistencia           = lazy(() => import('./pages/Asistencia'));
const AdminDashboard       = lazy(() => import('./pages/AdminDashboard'));
const CampDirectory        = lazy(() => import('./pages/CampDirectory'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-stone-50">
    <Loader size={28} className="animate-spin text-orange-500" />
  </div>
);

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
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/benefits" element={<Benefits />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-camp" element={<CreateCamp />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/join-camp" element={<JoinCamp />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/directorio" element={<CampDirectory />} />
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
      </Suspense>
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