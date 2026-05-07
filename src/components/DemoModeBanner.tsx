import React from 'react';
import { FlaskConical, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { useUserProfile } from '../hooks/useUserProfile';

export default function DemoModeBanner() {
  const { isDemoMode } = useStore();
  const { profile } = useUserProfile();
  const navigate = useNavigate();

  if (!isDemoMode) return null;

  const isMonitor = profile?.role === 'monitor';

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <FlaskConical size={15} className="flex-shrink-0 opacity-90" />
          <p className="text-sm font-medium truncate">
            <span className="font-bold">Modo Prueba</span>
            <span className="text-amber-100 hidden sm:inline">
              {' '}· Estás viendo datos de ejemplo — explora la app con libertad, nada es real
            </span>
          </p>
        </div>
        <button
          onClick={() => navigate(isMonitor ? '/join-camp' : '/mi-plan')}
          className="flex items-center gap-1.5 flex-shrink-0 text-xs sm:text-sm font-bold bg-white text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
        >
          {isMonitor ? 'Unirme a un campamento' : 'Ver planes y empezar'}
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
