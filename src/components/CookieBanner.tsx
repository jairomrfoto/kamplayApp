import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

const CONSENT_KEY = 'kamplay_cookie_consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (!saved) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ essential: true, date: new Date().toISOString() }));
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ essential: true, rejected: true, date: new Date().toISOString() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-shrink-0 w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
          <Cookie size={18} className="text-orange-500" />
        </div>

        <p className="flex-1 text-sm text-gray-600 leading-relaxed">
          Usamos cookies esenciales para el funcionamiento de la plataforma (sesión, autenticación y pagos). No utilizamos cookies de publicidad ni rastreo.{' '}
          <a href="/cookies" className="text-orange-600 hover:underline font-medium">
            Más información
          </a>
        </p>

        <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
          <button
            onClick={reject}
            className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            Solo esenciales
          </button>
          <button
            onClick={accept}
            className="flex-1 sm:flex-none px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Aceptar
          </button>
        </div>

        <button onClick={reject} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 sm:hidden">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
