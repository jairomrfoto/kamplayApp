import React, { useState } from 'react';
import { CreditCard, ExternalLink, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { startSubscriptionCheckout, openBillingPortal } from '../../services/stripe';
import { UserProfile } from '../../types';

interface Props {
  profile: UserProfile;
  onSubscribed?: () => void;
}

export default function SubscriptionBanner({ profile, onSubscribed }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const status = profile.subscriptionStatus;
  const isActive = status === 'active' || status === 'trialing';

  async function handleSubscribe() {
    setLoading(true);
    setError('');
    try {
      const { url } = await startSubscriptionCheckout();
      window.location.href = url;
    } catch (e: any) {
      setError(e?.message || 'Error al iniciar el pago');
      setLoading(false);
    }
  }

  async function handleManage() {
    setLoading(true);
    setError('');
    try {
      const { url } = await openBillingPortal();
      window.location.href = url;
    } catch (e: any) {
      setError(e?.message || 'Error al abrir el portal');
      setLoading(false);
    }
  }

  if (isActive) {
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-green-800">Suscripción activa</p>
          <p className="text-xs text-green-600">Acceso completo a Kamplay Pro</p>
        </div>
        <button
          onClick={handleManage}
          disabled={loading}
          className="text-xs text-green-700 border border-green-300 rounded-lg px-3 py-1.5 hover:bg-green-100 flex items-center gap-1 disabled:opacity-50"
        >
          <ExternalLink size={12} />
          Gestionar
        </button>
      </div>
    );
  }

  if (status === 'past_due') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Pago pendiente</p>
            <p className="text-xs text-amber-600">Tu suscripción tiene un pago fallido. Actualiza tu método de pago.</p>
          </div>
        </div>
        {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
        <button
          onClick={handleManage}
          disabled={loading}
          className="w-full text-sm bg-amber-600 text-white rounded-lg px-4 py-2 hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <CreditCard size={15} />
          {loading ? 'Cargando...' : 'Actualizar método de pago'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-4">
      <div className="flex items-start gap-3 mb-3">
        <Clock size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-gray-900">Activa tu suscripción Kamplay Pro</p>
          <p className="text-xs text-gray-500 mt-0.5">
            30 €/mes · Campamentos y campus ilimitados · Todas las funcionalidades
          </p>
        </div>
      </div>
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full text-sm bg-orange-500 text-white rounded-lg px-4 py-2.5 hover:bg-orange-600 disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
      >
        <CreditCard size={15} />
        {loading ? 'Redirigiendo...' : 'Suscribirse por 30 €/mes'}
      </button>
    </div>
  );
}
