import React, { useState } from 'react';
import { ArrowLeft, Check, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import CampForm from '../components/camps/CampForm';
import { useUserProfile } from '../hooks/useUserProfile';
import { startSubscriptionCheckout, startEventCheckout } from '../services/stripe';
import { saveCampInfo } from '../services/firestore';
import type { Camp } from '../types/camp';

type PlanType = 'subscription' | 'standard' | 'express';

const PLANS = [
  {
    id: 'express' as PlanType,
    label: 'Express',
    price: '9 €',
    duration: 'Hasta 3 días',
    features: ['Un campamento o campus', 'Acampados, grupos y monitores', 'Actividades y asistencia', 'Editable 2 días post-evento'],
  },
  {
    id: 'standard' as PlanType,
    label: 'Estándar',
    price: '15 €',
    duration: 'Hasta 7 días',
    popular: true,
    features: ['Un campamento o campus', 'Acampados, grupos y monitores', 'Actividades, menú e incidencias', 'Escáner de documentos', 'Editable 7 días post-evento'],
  },
  {
    id: 'subscription' as PlanType,
    label: 'Profesional',
    price: '30 €/mes',
    duration: 'Programas ilimitados',
    features: ['Campamentos y campus ilimitados', 'Sin límite de duración', 'Escáner de documentos', 'Directorio y valoraciones'],
  },
];

const CreateCamp = () => {
  const { profile, loading } = useUserProfile();
  const isActive = profile?.subscriptionStatus === 'active' || profile?.subscriptionStatus === 'trialing';
  const bypass   = import.meta.env.VITE_BYPASS_SUBSCRIPTION === 'true';

  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [paying, setPaying]             = useState(false);
  const [payError, setPayError]         = useState('');

  // Only active Professional subscribers (or dev bypass) skip the plan selector
  const showForm = isActive || bypass;

  const handleCampReady = async (camp: Camp) => {
    if (showForm) return; // already handled inside CampForm
    if (!selectedPlan) return;

    if (selectedPlan === 'subscription') {
      setPaying(true);
      try {
        const { url } = await startSubscriptionCheckout('month');
        window.location.href = url;
      } catch (e: any) {
        setPayError(e?.message || 'Error al iniciar el pago');
        setPaying(false);
      }
      return;
    }

    // Save camp as draft first, then redirect to Stripe
    setPaying(true);
    setPayError('');
    try {
      const draft: Camp = { ...camp, status: 'draft', planType: selectedPlan };
      await saveCampInfo(draft);
      const { url } = await startEventCheckout(selectedPlan, camp.id);
      window.location.href = url;
    } catch (e: any) {
      setPayError(e?.message || 'Error al iniciar el pago');
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <Loader size={28} className="animate-spin text-orange-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <header className="bg-white/80 backdrop-blur border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🏕️</span>
            <span className="text-lg font-extrabold text-gray-900">Kamplay</span>
          </div>
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft size={16} />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Crear campamento o campus</h1>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            {showForm
              ? 'Elige el tipo de programa, rellena los datos básicos y en unos minutos podrás invitar a monitores y gestionar todo desde el panel.'
              : 'Elige el plan que mejor se adapta a tu programa y empieza a gestionar.'}
          </p>
        </div>

        {/* Plan selector — solo para usuarios sin suscripción activa ni rol de coordinador */}
        {!showForm && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PLANS.map(plan => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative text-left rounded-2xl border-2 p-5 transition-all ${
                    selectedPlan === plan.id
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-stone-200 bg-white hover:border-orange-300'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-2.5 left-4 bg-orange-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                      Más popular
                    </span>
                  )}
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{plan.label}</p>
                  <p className="text-2xl font-extrabold text-gray-900 mb-0.5">{plan.price}</p>
                  <p className="text-xs text-orange-500 font-semibold mb-4">{plan.duration}</p>
                  <ul className="space-y-1.5">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-1.5 text-xs text-gray-600">
                        <Check size={12} className="text-green-500 shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>
                  {selectedPlan === plan.id && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                      <Check size={11} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {selectedPlan && selectedPlan !== 'subscription' && (
              <p className="text-center text-xs text-gray-400">
                Rellena el formulario, guarda el campamento y se abrirá la pasarela de pago.
              </p>
            )}
          </div>
        )}

        {/* Formulario — siempre visible para coordinadores/suscriptores, o cuando elige plan por evento */}
        {(showForm || (selectedPlan && selectedPlan !== 'subscription')) && (
          <div className="space-y-6">
            {payError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{payError}</div>
            )}
            <CampForm
              planType={showForm ? 'subscription' : (selectedPlan ?? 'standard')}
              onCampCreated={showForm ? undefined : handleCampReady}
            />
          </div>
        )}

        {/* Suscripción profesional */}
        {!showForm && selectedPlan === 'subscription' && (
          <div className="bg-gray-900 rounded-2xl p-6 text-white text-center space-y-4">
            <p className="font-bold text-lg">Plan Profesional — uso ilimitado</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={async () => { setPaying(true); try { const { url } = await startSubscriptionCheckout('month'); window.location.href = url; } catch (e: any) { setPayError(e?.message || 'Error'); setPaying(false); } }}
                disabled={paying}
                className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-3 rounded-xl disabled:opacity-50"
              >
                {paying ? 'Redirigiendo...' : '30 €/mes'}
              </button>
              <button
                onClick={async () => { setPaying(true); try { const { url } = await startSubscriptionCheckout('year'); window.location.href = url; } catch (e: any) { setPayError(e?.message || 'Error'); setPaying(false); } }}
                disabled={paying}
                className="border-2 border-orange-400 text-orange-400 hover:bg-orange-500 hover:text-white font-bold px-6 py-3 rounded-xl disabled:opacity-50 transition-colors"
              >
                {paying ? 'Redirigiendo...' : '250 €/año · Ahorras 2 meses'}
              </button>
            </div>
            {payError && <p className="text-red-400 text-sm">{payError}</p>}
          </div>
        )}
      </main>
    </div>
  );
};

export default CreateCamp;
