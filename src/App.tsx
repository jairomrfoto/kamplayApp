import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useFirestoreSync } from './hooks/useFirestoreSync';
import { Loader } from 'lucide-react';
import DemoModeBanner from './components/DemoModeBanner';

// Eager — needed immediately on first paint
import Landing from './pages/Landing';
import About from './pages/About';
import Benefits from './pages/Benefits';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CookieBanner from './components/CookieBanner';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';

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
const MiPlan               = lazy(() => import('./pages/MiPlan'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-stone-50">
    <Loader size={28} className="animate-spin text-orange-500" />
  </div>
);

const CHUNK_RELOAD_KEY = 'chunk_reload_attempted';

function isChunkError(err: Error) {
  return (
    err.name === 'ChunkLoadError' ||
    err.message?.includes('Failed to fetch dynamically imported module') ||
    err.message?.includes('Importing a module script failed')
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    if (isChunkError(error)) {
      const alreadyRetried = sessionStorage.getItem(CHUNK_RELOAD_KEY);
      if (!alreadyRetried) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
        window.location.reload();
        return { error: null };
      }
    }
    return { error };
  }

  componentDidUpdate() {
    if (!this.state.error) sessionStorage.removeItem(CHUNK_RELOAD_KEY);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-orange-50 p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-8 max-w-md w-full text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Algo salió mal</h2>
            <p className="text-sm text-gray-500 mb-4">Recarga la página para continuar.</p>
            <button
              onClick={() => { sessionStorage.removeItem(CHUNK_RELOAD_KEY); window.location.reload(); }}
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

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 px-6 text-center">
    <div className="text-6xl mb-4">🏕️</div>
    <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Página no encontrada</h1>
    <p className="text-gray-500 mb-6 max-w-sm">La URL que buscas no existe o ha cambiado de dirección.</p>
    <Link to="/" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors">
      Volver al inicio
    </Link>
  </div>
);

function AppRoutes() {
  useFirestoreSync();

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <DemoModeBanner />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/benefits" element={<Benefits />} />
          <Route path="/privacidad" element={<PrivacyPolicy />} />
          <Route path="/terminos" element={<TermsOfService />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-camp" element={<CreateCamp />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/join-camp" element={<JoinCamp />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/mi-plan" element={<MiPlan />} />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
      <CookieBanner />
    </ErrorBoundary>
  );
}

export default App;