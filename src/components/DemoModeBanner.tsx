import React from 'react';
import { FlaskConical, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';

export default function DemoModeBanner() {
  const { isDemoMode } = useStore();
  const navigate = useNavigate();

  if (!isDemoMode) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <FlaskConical size={15} className="flex-shrink-0" />
          <p className="text-sm font-medium truncate">
            <span className="font-bold">Modo Prueba</span>
            <span className="text-amber-100 hidden sm:inline">
              {' '}· Datos de ejemplo — explora la aplicación con total libertad
            </span>
          </p>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-1.5 flex-shrink-0 text-xs sm:text-sm font-bold bg-white text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
        >
          Probar app
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
}
