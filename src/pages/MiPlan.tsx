import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, CheckCircle, AlertCircle, Clock, Zap, Shield,
  ArrowLeft, ExternalLink, Loader, Star, Infinity, Calendar,
} from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { startSubscriptionCheckout, openBillingPortal } from '../services/stripe';
import EmbeddedCheckoutModal from '../components/stripe/EmbeddedCheckoutModal';

const FEATURES_PRO = [
  'Campamentos y campus ilimitados',
  'Sin límite de duración por programa',
  'Escáner de documentos con IA',
  'Directorio público y valoraciones',
  'Historial y exportación de datos',
  'Soporte prioritario',
];

const PLANS_EVENTO = [
  {
    id: 'express',
    label: 'Express',
    price: '9 €',
    badge: null,
    color: 'gray',
    features: [
      'Un campamento o campus',
      'Hasta 3 días de duración',
      'Acampados, grupos y monitores',
      'Actividades y asistencia',
      'Editable 2 días post-evento',
    ],
  },
  {
    id: 'standard',
    label: 'Estándar',
    price: '15 €',
    badge: 'Más popular',
    color: 'orange',
    features: [
      'Un campamento o campus',
      'Hasta 7 días de duración',
      'Acampados, grupos y monitores',
      'Actividades, menú e incidencias',
      'Escáner de documentos con IA',
      'Editable 7 días post-evento',
    ],
  },
];

export default function MiPlan() {
  const navigate = useNavigate();
  const { profile, loading } = useUserProfile();
  const [interval, setInterval] = useState<'month' | 'year'>('month');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [checkoutSecret, setCheckoutSecret] = useState<string | null>(null);

  const status = profile?.subscriptionStatus;
  const isActive = status === 'active' || status === 'trialing';
  const isPastDue = status === 'past_due';

  async function handleSubscribe() {
    setBusy(true);
    setError('');
    try {
      const result = await startSubscriptionCheckout(interval, true);
      console.log('[Kamplay Pay] checkout result:', result);
      if (result.clientSecret) {
        setCheckoutSecret(result.clientSecret);
      } else {
        console.warn('[Kamplay Pay] No clientSecret in result — function may not be updated');
        setError('Error del servidor: no se recibió el token de pago. Inténtalo de nuevo.');
      }
    } catch (e: any) {
      console.error('[Kamplay Pay] error:', e);
      setError(e?.message || 'Error al iniciar el pago');
    } finally {
      setBusy(false);
    }
  }

  async function handleManage() {
    setBusy(true);
    setError('');
    try {
      const { url } = await openBillingPortal();
      window.location.href = url;
    } catch (e: any) {
      setError(e?.message || 'Error al abrir el portal');
      setBusy(false);
    }
  }

  const statusBadge = () => {
    if (loading) return null;
    if (isActive) return (
      <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 text-sm font-semibold px-3 py-1.5 rounded-full">
        <CheckCircle size={14} /> Plan Profesional activo
      </div>
    );
    if (isPastDue) return (
      <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 text-sm font-semibold px-3 py-1.5 rounded-full">
        <AlertCircle size={14} /> Pago pendiente
      </div>
    );
    if (status === 'trialing') return (
      <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1.5 rounded-full">
        <Clock size={14} /> Periodo de prueba
      </div>
    );
    return (
      <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 text-sm font-semibold px-3 py-1.5 rounded-full">
        <Clock size={14} /> Sin plan activo
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft size={16} /> Volver
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Mi Plan</h1>
              <p className="text-sm text-gray-500 mt-0.5">Gestiona tu suscripción y acceso a Kamplay</p>
            </div>
            {statusBadge()}
          </div>
        </div>

        {/* Past due alert */}
        {isPastDue && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Hay un pago fallido en tu suscripción</p>
              <p className="text-sm text-red-600 mt-0.5">Actualiza tu método de pago para evitar la interrupción del servicio.</p>
            </div>
            <button
              onClick={handleManage}
              disabled={busy}
              className="flex-shrink-0 text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {busy ? <Loader size={14} className="animate-spin" /> : 'Actualizar'}
            </button>
          </div>
        )}

        {/* ── PLAN PROFESIONAL ────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-5 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Infinity size={18} className="text-orange-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-green-200">Plan Profesional</span>
            </div>
            <p className="text-xl font-extrabold">Uso ilimitado, sin complicaciones</p>
            <p className="text-sm text-green-200 mt-0.5">Campamentos y campus ilimitados · Todas las funcionalidades</p>
          </div>

          <div className="p-6 space-y-5">
            {/* Features */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FEATURES_PRO.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle size={15} className="text-green-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {isActive ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl px-4 py-3">
                  <Shield size={15} className="flex-shrink-0" />
                  Suscripción activa — acceso completo a todas las funciones
                </div>
                {error && <p className="text-xs text-red-600">{error}</p>}
                <button
                  onClick={handleManage}
                  disabled={busy}
                  className="flex items-center justify-center gap-2 w-full text-sm border border-gray-300 text-gray-700 rounded-xl px-4 py-2.5 hover:bg-gray-50 disabled:opacity-50"
                >
                  {busy ? <Loader size={15} className="animate-spin" /> : <ExternalLink size={15} />}
                  Gestionar suscripción (cancelar, cambiar método de pago...)
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Interval toggle */}
                <div className="flex rounded-xl border border-gray-200 overflow-hidden text-sm font-semibold">
                  <button
                    onClick={() => setInterval('month')}
                    className={`flex-1 py-2.5 transition-colors ${interval === 'month' ? 'bg-green-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    30 €<span className="font-normal text-xs">/mes</span>
                  </button>
                  <button
                    onClick={() => setInterval('year')}
                    className={`flex-1 py-2.5 transition-colors relative ${interval === 'year' ? 'bg-green-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    250 €<span className="font-normal text-xs">/año</span>
                    <span className={`ml-1.5 text-xs font-bold ${interval === 'year' ? 'text-orange-300' : 'text-green-600'}`}>
                      −2 meses gratis
                    </span>
                  </button>
                </div>

                {error && <p className="text-xs text-red-600">{error}</p>}
                <button
                  onClick={handleSubscribe}
                  disabled={busy}
                  className="flex items-center justify-center gap-2 w-full bg-green-800 hover:bg-green-900 text-white font-bold text-sm rounded-xl px-4 py-3 disabled:opacity-50 transition-colors"
                >
                  {busy ? <Loader size={16} className="animate-spin" /> : <CreditCard size={16} />}
                  {busy ? 'Preparando pago...' : `Suscribirse · ${interval === 'year' ? '250 €/año' : '30 €/mes'}`}
                </button>
                <p className="text-xs text-center text-gray-400">Cancela cuando quieras. Pago seguro con Stripe.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── PLANES POR EVENTO ────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-orange-500" />
            <h2 className="text-base font-bold text-gray-900">Planes por evento</h2>
            <span className="text-xs text-gray-400 font-normal">· Pago único, sin renovación</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PLANS_EVENTO.map(plan => (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl border ${plan.color === 'orange' ? 'border-orange-300 ring-1 ring-orange-200' : 'border-gray-200'} shadow-sm overflow-hidden`}
              >
                {plan.badge && (
                  <div className="bg-orange-500 text-white text-xs font-bold text-center py-1.5 tracking-wide">
                    <Star size={11} className="inline mr-1" />{plan.badge}
                  </div>
                )}
                <div className="p-5 space-y-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-gray-900">{plan.price}</span>
                      <span className="text-xs text-gray-400">por evento</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mt-0.5">{plan.label}</p>
                  </div>

                  <ul className="space-y-1.5">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                        <CheckCircle size={13} className="text-orange-400 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => navigate('/create-camp')}
                    className={`w-full text-sm font-semibold py-2.5 rounded-xl transition-colors ${
                      plan.color === 'orange'
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Crear campamento {plan.label}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 mt-3 text-center">
            Los planes por evento se activan al crear el campamento. El pago se procesa de forma segura con Stripe.
          </p>
        </div>

        {checkoutSecret && (
          <EmbeddedCheckoutModal
            clientSecret={checkoutSecret}
            title={`Plan Profesional · ${interval === 'year' ? '250 €/año' : '30 €/mes'}`}
            onClose={() => setCheckoutSecret(null)}
          />
        )}

        {/* ── COMPARATIVA ─────────────────────────────────── */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Zap size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-gray-900">¿Cuál elijo?</p>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li><span className="font-semibold text-gray-800">Express (9 €)</span> — ideal para un evento corto o para probar la plataforma.</li>
                <li><span className="font-semibold text-gray-800">Estándar (15 €)</span> — eventos de hasta una semana con escáner de documentos.</li>
                <li><span className="font-semibold text-gray-800">Profesional (30 €/mes)</span> — coordinadores con varios programas al año.</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
