import React, { useState } from 'react';
import { CreditCard, X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { createCampPaymentIntent } from '../../services/stripe';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface Props {
  campId: string;
  campName: string;
  inscriptionFee: number; // en céntimos
}

function CheckoutForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href + '?payment=success' },
      redirect: 'if_required',
    });
    if (stripeError) {
      setError(stripeError.message || 'Error al procesar el pago');
      setLoading(false);
    } else {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? 'Procesando...' : 'Pagar'}
        </button>
      </div>
    </form>
  );
}

export default function CampPaymentButton({ campId, campName, inscriptionFee }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paid, setPaid] = useState(false);

  const feeEuros = (inscriptionFee / 100).toFixed(2);

  async function handleOpen() {
    setLoading(true);
    setError('');
    try {
      const { clientSecret: secret } = await createCampPaymentIntent(campId);
      setClientSecret(secret);
      setShowModal(true);
    } catch (e: any) {
      setError(e?.message || 'No se pudo iniciar el pago');
    } finally {
      setLoading(false);
    }
  }

  if (paid) {
    return (
      <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm font-semibold">
        ✅ Inscripción pagada
      </div>
    );
  }

  return (
    <>
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-amber-900">Cuota de inscripción</p>
          <p className="text-xs text-amber-700">{campName} · {feeEuros} €</p>
        </div>
        <button
          onClick={handleOpen}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 font-semibold whitespace-nowrap"
        >
          <CreditCard size={15} />
          {loading ? 'Cargando...' : `Pagar ${feeEuros} €`}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}

      {showModal && clientSecret && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">Pago de inscripción</h3>
                <p className="text-xs text-gray-500 mt-0.5">{campName} · {feeEuros} €</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-5">
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm
                  onSuccess={() => { setShowModal(false); setPaid(true); }}
                  onCancel={() => setShowModal(false)}
                />
              </Elements>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
