import React, { useState, useEffect, useRef } from 'react';
import { X, LogOut, ChevronRight, Pause, Play } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/store';

const STEP_DURATION = 10000; // ms per step

const STEPS = [
  {
    path: '/coordinator-dashboard',
    title: 'Panel de Control',
    icon: '🏕️',
    message: 'Bienvenido a tu panel de coordinador. De un solo vistazo ves el estado del campamento: acampados activos, actividades del día y el resumen completo del programa.',
  },
  {
    path: '/coordinator-dashboard/acampados',
    title: 'Fichas de Acampados',
    icon: '👦',
    message: 'Cada participante tiene su ficha completa: datos personales, alergias, medicación con pauta y dosis, enfermedades crónicas y contactos de emergencia. Todo accesible al instante.',
  },
  {
    path: '/coordinator-dashboard/grupos',
    title: 'Grupos y Equipos',
    icon: '👥',
    message: 'Organiza a los acampados en grupos por edad o actividad. Asigna un monitor responsable a cada grupo para que ningún participante quede sin supervisión.',
  },
  {
    path: '/coordinator-dashboard/actividades',
    title: 'Actividades',
    icon: '⚡',
    message: 'Planifica todas las actividades y crea tu banco personal. Guarda las favoritas y reutilízalas cada temporada sin empezar desde cero.',
  },
  {
    path: '/coordinator-dashboard/calendario',
    title: 'Calendario',
    icon: '📅',
    message: 'El programa día a día, siempre actualizado. Todo el equipo lo consulta desde su móvil en tiempo real. Sin WhatsApp, sin confusiones.',
  },
  {
    path: '/coordinator-dashboard/area-medica',
    title: 'Área Médica',
    icon: '🏥',
    message: 'Seguimiento médico continuo. Registra incidencias al momento, controla medicaciones y accede a los datos de salud de cada acampado con un toque.',
  },
  {
    path: '/coordinator-dashboard/monitores',
    title: 'Equipo de Monitores',
    icon: '⭐',
    message: 'Gestiona tu equipo al completo. Genera códigos de acceso únicos, asigna permisos por rol y supervisa la actividad de cada monitor durante el programa.',
  },
  {
    path: '/coordinator-dashboard/menu',
    title: 'Menú Diario',
    icon: '🍽️',
    message: 'Planifica los menús del campamento. Los padres consultan qué come su hijo cada día desde su panel. Sin llamadas, sin preguntas repetidas.',
  },
  {
    path: '/coordinator-dashboard/materiales',
    title: 'Materiales',
    icon: '📦',
    message: 'Inventario siempre actualizado y visible para todo el equipo. Nadie llegará a una actividad sin el material que necesita.',
  },
];

function useTypewriter(text: string, active: boolean, speed = 22) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    if (!active) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { setDone(true); clearInterval(id); }
    }, speed);
    return () => clearInterval(id);
  }, [text, active, speed]);

  return { displayed, done };
}

export default function KikoTour() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDemoMode, demoTourActive, setDemoTourActive, setDemoMode } = useStore();

  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  const pausedRef   = useRef(false);
  const rafRef      = useRef<number>(0);
  const startRef    = useRef<number>(0);
  const elapsedRef  = useRef<number>(0);

  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;
  const { displayed, done } = useTypewriter(current.message, demoTourActive);

  // Sync step with URL when user navigates manually
  useEffect(() => {
    const idx = STEPS.findIndex(s => location.pathname === s.path);
    if (idx !== -1 && idx !== step) setStep(idx);
  }, [location.pathname]);

  // Auto-advance loop
  useEffect(() => {
    if (!isDemoMode || !demoTourActive) return;

    elapsedRef.current = 0;
    setProgress(0);
    startRef.current = performance.now();

    const tick = (now: number) => {
      if (!pausedRef.current) {
        elapsedRef.current = now - startRef.current;
      } else {
        startRef.current = now - elapsedRef.current;
      }

      const pct = Math.min((elapsedRef.current / STEP_DURATION) * 100, 100);
      setProgress(pct);

      if (pct >= 100) {
        if (isLast) { setDemoTourActive(false); return; }
        const next = step + 1;
        setStep(next);
        navigate(STEPS[next].path);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [step, isDemoMode, demoTourActive]);

  const goNext = () => {
    cancelAnimationFrame(rafRef.current);
    if (isLast) { setDemoTourActive(false); return; }
    const next = step + 1;
    setStep(next);
    navigate(STEPS[next].path);
  };

  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(p => !p);
  };

  const exitTour  = () => { cancelAnimationFrame(rafRef.current); setDemoTourActive(false); };
  const exitDemo  = () => { cancelAnimationFrame(rafRef.current); setDemoTourActive(false); setDemoMode(false); navigate('/'); };

  if (!isDemoMode || !demoTourActive) return null;

  // Spotlight area: main content (right of sidebar on desktop)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  const spotlightLeft   = isMobile ? 8 : 264;
  const spotlightTop    = 72;
  const spotlightRight  = 8;
  const spotlightBottom = 108; // clear demo banner + tour card

  const spotlightStyle: React.CSSProperties = {
    position:     'fixed',
    top:          spotlightTop,
    left:         spotlightLeft,
    right:        spotlightRight,
    bottom:       spotlightBottom,
    borderRadius: 16,
    boxShadow:    '0 0 0 9999px rgba(0,0,0,0.60)',
    border:       '2px solid rgba(249,115,22,0.55)',
    outline:      '1px solid rgba(249,115,22,0.2)',
    transition:   'all 0.5s cubic-bezier(.4,0,.2,1)',
    pointerEvents:'none',
    zIndex:       38,
  };

  return (
    <>
      {/* ── Spotlight overlay ── */}
      <div style={spotlightStyle} aria-hidden="true" />

      {/* ── Kiko + Card ── */}
      <div className="fixed bottom-12 right-0 z-40 flex items-end pointer-events-none select-none">

        {/* Card */}
        <div
          className="pointer-events-auto mb-3 mr-1 sm:mr-2 bg-white rounded-2xl shadow-2xl border-2 border-orange-200 w-56 sm:w-80 relative self-end overflow-hidden"
          onMouseEnter={() => { pausedRef.current = true;  setPaused(true);  }}
          onMouseLeave={() => { pausedRef.current = false; setPaused(false); }}
          onTouchStart={() => { pausedRef.current = true;  setPaused(true);  }}
          onTouchEnd  ={() => { pausedRef.current = false; setPaused(false); }}
        >
          {/* Progress bar */}
          <div className="h-1 bg-gray-100 w-full">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-amber-400"
              style={{ width: `${progress}%`, transition: 'width 100ms linear' }}
            />
          </div>

          <div className="p-3 sm:p-4">
            {/* Header row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-base">{current.icon}</span>
                <p className="text-xs font-extrabold text-orange-500 uppercase tracking-wide leading-none">
                  {current.title}
                </p>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <span className="text-[10px] font-medium">{step + 1}/{STEPS.length}</span>
                <button onClick={exitTour} className="hover:text-gray-600 transition-colors ml-0.5">
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Step dots */}
            <div className="flex items-center gap-0.5 mb-2.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  onClick={() => { cancelAnimationFrame(rafRef.current); setStep(i); navigate(STEPS[i].path); }}
                  className={`rounded-full cursor-pointer transition-all duration-300 ${
                    i === step   ? 'w-4 h-1.5 bg-orange-500' :
                    i < step     ? 'w-1.5 h-1.5 bg-orange-300' :
                                   'w-1.5 h-1.5 bg-gray-200 hover:bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Typewriter message */}
            <p className="text-[11px] sm:text-sm text-gray-700 leading-snug mb-3 min-h-[60px]">
              {displayed}
              {!done && (
                <span className="inline-block w-0.5 h-3.5 bg-orange-400 ml-0.5 align-middle animate-pulse" />
              )}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePause}
                  title={paused ? 'Reanudar' : 'Pausar'}
                  className="text-gray-400 hover:text-orange-500 transition-colors"
                >
                  {paused ? <Play size={13} /> : <Pause size={13} />}
                </button>
                <button
                  onClick={exitDemo}
                  className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  <LogOut size={11} />
                  <span>Salir</span>
                </button>
              </div>
              <button
                onClick={goNext}
                className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
              >
                {isLast ? '¡Listo!' : 'Siguiente'}
                {!isLast && <ChevronRight size={12} />}
              </button>
            </div>
          </div>

          {/* Speech bubble triangle pointing to Kiko */}
          <div className="absolute -bottom-2 right-16 sm:right-[88px] w-3.5 h-3.5 bg-white border-r-2 border-b-2 border-orange-200 rotate-45" />
        </div>

        {/* Kiko */}
        <div className="pointer-events-none flex-shrink-0">
          <img
            src="/mascota.png"
            alt="Kiko"
            className="w-20 sm:w-44 object-contain kiko-float drop-shadow-lg"
          />
        </div>

      </div>
    </>
  );
}
