import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';

export default function DemoModeBanner() {
  const { isDemoMode } = useStore();
  const navigate = useNavigate();

  if (!isDemoMode) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Kiko peeking above the bar */}
      <div className="absolute left-4 bottom-full mb-0 pointer-events-none select-none">
        <img
          src="/mascota.png"
          alt="Kiko"
          className="w-16 h-16 object-contain kiko-peek"
        />
      </div>

      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto pl-24 pr-4 py-2.5 flex items-center justify-between gap-4">
          <p className="text-sm font-medium truncate">
            <span className="font-bold">Modo Demo</span>
            <span className="text-amber-100 hidden sm:inline">
              {' '}· Estás explorando Kamplay con datos de ejemplo
            </span>
          </p>
          <button
            onClick={() => navigate('/mi-plan')}
            className="flex items-center gap-1.5 flex-shrink-0 text-xs sm:text-sm font-bold bg-white text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Crear mi campamento
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
