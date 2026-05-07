import React, { useEffect, useRef, useState } from 'react';
import { X, Lock, Loader } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

interface Props {
  clientSecret: string;
  onClose: () => void;
  title?: string;
}

export default function EmbeddedCheckoutModal({ clientSecret, onClose, title = 'Pago seguro' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const checkoutRef  = useRef<any>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!clientSecret) return;

    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
    if (!key) {
      setError('Configuración de pago incompleta. Contacta con soporte.');
      setLoading(false);
      return;
    }

    let destroyed = false;
    let checkout: any = null;

    (async () => {
      try {
        const stripe = await loadStripe(key);
        if (!stripe) throw new Error('No se pudo cargar Stripe');
        if (destroyed) return;

        checkout = await (stripe as any).createEmbeddedCheckoutPage({
          fetchClientSecret: () => Promise.resolve(clientSecret),
        });

        if (destroyed) { checkout.destroy(); return; }
        if (containerRef.current) {
          checkout.mount(containerRef.current);
          checkoutRef.current = checkout;
        }
        setLoading(false);
      } catch (err: any) {
        console.error('[Kamplay] EmbeddedCheckout error:', err);
        setError(err?.message || 'Error al cargar el formulario de pago');
        setLoading(false);
      }
    })();

    return () => {
      destroyed = true;
      checkoutRef.current?.destroy();
      checkoutRef.current = null;
    };
  }, [clientSecret]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto py-4 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mt-4 mb-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🏕️</span>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-none">Kamplay</p>
              <p className="text-xs text-gray-400 mt-0.5">{title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Lock size={11} />
              <span>Pago seguro con Stripe</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          {loading && !error && (
            <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
              <Loader size={20} className="animate-spin" />
              <span className="text-sm">Cargando formulario de pago…</span>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {error}
            </div>
          )}
          {/* Stripe mounts the checkout form here */}
          <div ref={containerRef} />
        </div>
      </div>
    </div>
  );
}
