import React, { useEffect, useState } from 'react';
import { Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, PlusCircle, Loader, RefreshCw } from 'lucide-react';
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
import MisCampamentos from './MisCampamentos';
import MisActividades from '../components/MisActividades';
import NovedadesFeed from '../components/novedades/NovedadesFeed';
import Asistencia from './Asistencia';
import ChatPanel from '../components/chat/ChatPanel';
import CampListingEditor from '../components/coordinator/CampListingEditor';
import DemoModeBanner from '../components/DemoModeBanner';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { useStore } from '../store/store';

const CoordinatorChat = () => {
  const { user } = useAuth();
  const name = user?.displayName || user?.email?.split('@')[0] || 'Coordinador';
  return <ChatPanel userRole="coordinator" userName={name} />;
};

function PaymentSuccessBanner() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile, loading, refresh } = useUserProfile();
  const { currentCamp } = useStore();

  const subscriptionSuccess = params.get('subscription') === 'success';
  const eventSuccess        = params.get('event') === 'success';
  const campId              = params.get('campId');

  const [polling, setPolling] = useState(false);
  const [ready, setReady]     = useState(false);

  // Poll Firestore until subscription status is active (webhook may be delayed a few seconds)
  useEffect(() => {
    if (!subscriptionSuccess || loading) return;
    const isActive = profile?.subscriptionStatus === 'active' || profile?.subscriptionStatus === 'trialing';
    if (isActive) { setReady(true); return; }

    setPolling(true);
    const id = setInterval(() => {
      refresh();
    }, 2000);

    return () => clearInterval(id);
  }, [subscriptionSuccess, profile, loading]);

  useEffect(() => {
    if (!subscriptionSuccess || !profile) return;
    const isActive = profile.subscriptionStatus === 'active' || profile.subscriptionStatus === 'trialing';
    if (isActive) { setReady(true); setPolling(false); }
  }, [profile, subscriptionSuccess]);

  const dismiss = () => {
    params.delete('subscription');
    params.delete('event');
    params.delete('campId');
    params.delete('session_id');
    setParams(params, { replace: true });
  };

  if (subscriptionSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          {ready
            ? <CheckCircle size={22} className="text-green-600 flex-shrink-0" />
            : <Loader size={22} className="text-green-500 animate-spin flex-shrink-0" />}
          <div>
            <p className="font-bold text-green-900">
              {ready ? '¡Suscripción activada!' : 'Activando tu suscripción…'}
            </p>
            <p className="text-sm text-green-700 mt-0.5">
              {ready
                ? 'Plan Profesional activo. Ya puedes crear campamentos y campus ilimitados.'
                : 'Estamos confirmando tu pago con Stripe, esto tarda unos segundos.'}
            </p>
          </div>
        </div>
        {ready && (
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => { dismiss(); navigate('/create-camp'); }}
              className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors"
            >
              <PlusCircle size={16} /> Crear campamento
            </button>
            <button onClick={dismiss} className="text-xs text-green-600 hover:underline">
              Cerrar
            </button>
          </div>
        )}
      </div>
    );
  }

  if (eventSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <CheckCircle size={22} className="text-green-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-green-900">¡Pago confirmado!</p>
            <p className="text-sm text-green-700 mt-0.5">
              Tu campamento ha sido activado. Ya puedes gestionar acampados, monitores y todas las funciones.
            </p>
          </div>
        </div>
        <button onClick={dismiss} className="text-xs text-green-600 hover:underline flex-shrink-0">
          Cerrar
        </button>
      </div>
    );
  }

  return null;
}

const CoordinatorDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <DemoModeBanner />
      <div className="flex flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-6">
          <PaymentSuccessBanner />
          <Routes>
            <Route path="/" element={<CampOverview />} />
            <Route path="/mis-campamentos" element={<MisCampamentos />} />
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
            <Route path="/mi-biblioteca" element={<MisActividades />} />
            <Route path="/novedades" element={<NovedadesFeed rol="coordinator" />} />
            <Route path="/asistencia" element={<Asistencia />} />
            <Route path="/chat" element={<CoordinatorChat />} />
            <Route path="/mi-anuncio" element={<CampListingEditor />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
