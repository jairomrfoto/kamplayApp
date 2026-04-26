import React, { useState } from 'react';
import { ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { startConnectOnboarding } from '../../services/stripe';
import { UserProfile } from '../../types';

interface Props {
  profile: UserProfile;
}

export default function ConnectStripeButton({ profile }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isOnboarded = profile.connectOnboarded === true;

  async function handleClick() {
    setLoading(true);
    setError('');
    try {
      const { url } = await startConnectOnboarding();
      window.location.href = url;
    } catch (e: any) {
      setError(e?.message || 'Error al iniciar la configuración de pagos');
      setLoading(false);
    }
  }

  if (isOnboarded) {
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-800">Pagos configurados</p>
          <p className="text-xs text-green-600">Los padres pueden pagar la inscripción directamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-4">
      <div className="flex items-start gap-3 mb-3">
        <AlertCircle size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-gray-900">Configura los cobros a familias</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Vincula tu cuenta bancaria para recibir los pagos de inscripción. Solo tarda 5 minutos.
          </p>
        </div>
      </div>
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
      <button
        onClick={handleClick}
        disabled={loading}
        className="w-full text-sm bg-blue-600 text-white rounded-lg px-4 py-2.5 hover:bg-blue-700 disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
      >
        <ExternalLink size={15} />
        {loading ? 'Redirigiendo...' : 'Configurar pagos con Stripe'}
      </button>
    </div>
  );
}
