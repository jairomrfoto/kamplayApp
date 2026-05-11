import React, { useState, useEffect } from 'react';
import { ChevronRight, X, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/store';

const TOUR_STEPS = [
  {
    path: '/coordinator-dashboard',
    title: 'Resumen del campamento',
    message: '¡Bienvenido al panel de coordinador! Aquí tienes el resumen completo: acampados, monitores, actividades del día y el estado del campamento de un vistazo.',
  },
  {
    path: '/coordinator-dashboard/acampados',
    title: 'Acampados',
    message: 'Gestiona las fichas de cada participante con datos médicos, alergias, medicación y contactos de emergencia. Todo accesible al instante para todo el equipo.',
  },
  {
    path: '/coordinator-dashboard/grupos',
    title: 'Grupos',
    message: 'Organiza los acampados en grupos por edad o actividad y asigna un monitor a cada uno. Así el control es total y nadie se pierde.',
  },
  {
    path: '/coordinator-dashboard/actividades',
    title: 'Actividades',
    message: 'Crea y planifica todas las actividades del campamento. Guárdalas en tu banco personal y reutilízalas cada temporada sin empezar desde cero.',
  },
  {
    path: '/coordinator-dashboard/calendario',
    title: 'Calendario',
    message: 'Visualiza y organiza el programa día a día. Todo el equipo ve los horarios en tiempo real desde su móvil, sin confusiones ni mensajes de WhatsApp.',
  },
  {
    path: '/coordinator-dashboard/area-medica',
    title: 'Área Médica',
    message: 'Seguimiento médico completo: registra incidencias, controla las medicaciones y ten acceso inmediato a los datos de salud de cada acampado.',
  },
  {
    path: '/coordinator-dashboard/monitores',
    title: 'Monitores',
    message: 'Gestiona tu equipo al completo. Genera códigos de acceso para cada monitor, asigna permisos según su rol y supervisa la actividad del equipo.',
  },
  {
    path: '/coordinator-dashboard/menu',
    title: 'Menú diario',
    message: 'Planifica los menús del campamento. Las familias podrán consultar qué come su hijo cada día directamente desde su panel. Sin llamadas, sin preguntas.',
  },
  {
    path: '/coordinator-dashboard/materiales',
    title: 'Materiales',
    message: 'Inventario de material siempre actualizado y accesible para todo el equipo. Nadie llegará a una actividad sin el material que necesita.',
  },
];

export default function KikoTour() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDemoMode, demoTourActive, setDemoTourActive, setDemoMode } = useStore();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const idx = TOUR_STEPS.findIndex(s => location.pathname === s.path);
    if (idx !== -1) setStep(idx);
  }, [location.pathname]);

  if (!isDemoMode || !demoTourActive) return null;

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      setDemoTourActive(false);
      return;
    }
    const next = step + 1;
    setStep(next);
    navigate(TOUR_STEPS[next].path);
  };

  const handleSkip = () => {
    setDemoTourActive(false);
  };

  const handleExitDemo = () => {
    setDemoTourActive(false);
    setDemoMode(false);
    navigate('/');
  };

  return (
    <div className="fixed bottom-12 right-0 z-40 flex items-end gap-0 pointer-events-none">

      {/* Card — floats above Kiko */}
      <div className="pointer-events-auto mb-4 sm:mb-6 mr-1 sm:mr-2 bg-white rounded-2xl shadow-2xl border-2 border-orange-200 p-3 sm:p-4 w-52 sm:w-72 relative self-end">

        {/* Close */}
        <button
          onClick={handleSkip}
          className="absolute top-2.5 right-2.5 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Omitir tour"
        >
          <X size={15} />
        </button>

        {/* Step dots */}
        <div className="flex items-center gap-1 mb-2 pr-5">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-4 h-2 bg-orange-500'
                  : i < step
                  ? 'w-2 h-2 bg-orange-300'
                  : 'w-2 h-2 bg-gray-200'
              }`}
            />
          ))}
          <span className="ml-1 text-xs text-gray-400 font-medium">
            {step + 1}/{TOUR_STEPS.length}
          </span>
        </div>

        {/* Content */}
        <p className="text-xs font-extrabold text-orange-500 uppercase tracking-wide mb-1">
          {current.title}
        </p>
        <p className="text-sm text-gray-700 leading-snug mb-3">
          {current.message}
        </p>

        {/* Triangle pointing to Kiko */}
        <div className="absolute -bottom-2.5 right-10 w-4 h-4 bg-white border-r-2 border-b-2 border-orange-200 rotate-45" />

        {/* Actions */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handleExitDemo}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={12} /> Salir de la demo
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
          >
            {isLast ? '¡Entendido!' : 'Siguiente'}
            {!isLast && <ChevronRight size={13} />}
          </button>
        </div>
      </div>

      {/* Kiko — grande */}
      <div className="pointer-events-none select-none flex-shrink-0">
        <img
          src="/mascota.png"
          alt="Kiko"
          className="w-20 sm:w-56 object-contain kiko-float drop-shadow-xl"
        />
      </div>

    </div>
  );
}
