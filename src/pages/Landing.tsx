import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Tent } from 'lucide-react';

const features = [
  { emoji: '👥', title: 'Gestión de acampados', desc: 'Fichas completas con información médica, alergias y medicación programada.' },
  { emoji: '📅', title: 'Horarios y actividades', desc: 'Planifica actividades, crea horarios diarios y gestiona el calendario del campamento.' },
  { emoji: '🏥', title: 'Área médica', desc: 'Control de incidencias, seguimiento médico y alertas para situaciones urgentes.' },
  { emoji: '🏕️', title: 'Grupos y cabañas', desc: 'Organiza acampados por grupos de edad y asigna monitores a cada cabaña.' },
  { emoji: '📚', title: 'Banco de actividades', desc: 'Biblioteca personal de actividades reutilizables entre campamentos.' },
  { emoji: '🌐', title: 'Multi-campamento', desc: 'Gestiona varios campamentos a la vez y cambia entre ellos al instante.' },
];

const steps = [
  { emoji: '✏️', step: '1', title: 'Crea tu campamento', desc: 'Regístrate y configura tu campamento en menos de 5 minutos.' },
  { emoji: '👋', step: '2', title: 'Invita a tu equipo', desc: 'Comparte el código único con monitores y familias para que se unan.' },
  { emoji: '🚀', step: '3', title: '¡Listo para empezar!', desc: 'Gestiona actividades, acampados y más desde el panel de control.' },
];

const roles = [
  {
    emoji: '🛡️',
    role: 'Coordinadores',
    color: 'bg-orange-500',
    ringColor: 'ring-orange-200',
    textColor: 'text-orange-700',
    bgLight: 'bg-orange-50',
    points: [
      'Crea y gestiona múltiples campamentos',
      'Supervisa monitores y acampados',
      'Controla materiales y recursos',
      'Reportes e incidencias en tiempo real',
    ],
  },
  {
    emoji: '⭐',
    role: 'Monitores',
    color: 'bg-green-600',
    ringColor: 'ring-green-200',
    textColor: 'text-green-700',
    bgLight: 'bg-green-50',
    points: [
      'Accede a tu grupo y acampados',
      'Anota evaluaciones y observaciones',
      'Lleva tu biblioteca de actividades',
      'Comunícate con el equipo',
    ],
  },
  {
    emoji: '❤️',
    role: 'Padres y tutores',
    color: 'bg-amber-500',
    ringColor: 'ring-amber-200',
    textColor: 'text-amber-700',
    bgLight: 'bg-amber-50',
    points: [
      'Sigue el día a día de tu hijo',
      'Consulta el menú y actividades',
      'Revisa el historial médico',
      'Accede con el código del campamento',
    ],
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🏕️</span>
            <span className="text-lg font-extrabold text-gray-900">Kamplay</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors hidden sm:block">
              Iniciar sesión
            </Link>
            <Link to="/create-camp" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-sm">
              Empezar gratis
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600 text-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <span className="absolute top-8 left-8 text-5xl opacity-20">🌲</span>
          <span className="absolute top-16 right-12 text-4xl opacity-20">⛺</span>
          <span className="absolute bottom-12 left-16 text-4xl opacity-20">🌻</span>
          <span className="absolute bottom-8 right-8 text-5xl opacity-15">🏔️</span>
          <span className="absolute top-1/2 left-4 text-3xl opacity-10">🦋</span>
          <span className="absolute top-1/3 right-4 text-3xl opacity-10">🌿</span>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs font-bold px-4 py-2 rounded-full mb-8 uppercase tracking-wider">
            <span>✨</span> La app para gestionar tu campamento
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            El campamento,<br className="hidden sm:block" /> en tus manos 🏕️
          </h1>
          <p className="text-lg sm:text-xl text-orange-100 max-w-2xl mx-auto mb-10">
            Kamplay es la plataforma todo-en-uno para coordinadores, monitores y familias.
            Gestiona acampados, actividades, área médica y mucho más desde un solo lugar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/create-camp"
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-orange-600 font-extrabold text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
            >
              🏕️ Crear mi campamento
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-base px-7 py-4 rounded-2xl transition-all duration-200"
            >
              Ya tengo cuenta <ChevronRight size={18} />
            </Link>
          </div>

          <p className="mt-6 text-orange-200 text-sm">
            Registro gratuito · Sin tarjeta de crédito · Listo en 5 minutos
          </p>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-orange-500 font-bold text-sm uppercase tracking-wider mb-3">¿Cómo funciona?</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Tres pasos y listo 🎉</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map(({ emoji, step, title, desc }) => (
              <div key={step} className="relative bg-orange-50 rounded-2xl p-7 text-center border border-orange-100">
                <div className="w-10 h-10 bg-orange-500 text-white font-extrabold text-lg rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  {step}
                </div>
                <div className="text-4xl mb-3">{emoji}</div>
                <h3 className="font-extrabold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Para quién ── */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-green-600 font-bold text-sm uppercase tracking-wider mb-3">Roles</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Diseñado para cada miembro 👨‍👩‍👧‍👦</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Cada rol tiene su propio acceso y herramientas adaptadas a lo que realmente necesita.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map(({ emoji, role, color, ringColor, textColor, bgLight, points }) => (
              <div key={role} className={`bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden ring-1 ${ringColor}`}>
                <div className={`${color} px-6 py-5`}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{emoji}</span>
                    <h3 className="text-white font-extrabold text-xl">{role}</h3>
                  </div>
                </div>
                <ul className="px-6 py-5 space-y-3">
                  {points.map(p => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full ${bgLight} ${textColor} flex items-center justify-center text-xs font-bold`}>✓</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Funcionalidades ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-orange-500 font-bold text-sm uppercase tracking-wider mb-3">Funcionalidades</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Todo lo que necesitas 🎒</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Kamplay reúne en una sola app todas las herramientas esenciales para un campamento moderno.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ emoji, title, desc }) => (
              <div key={title} className="flex gap-4 p-5 rounded-2xl border border-stone-100 hover:border-orange-200 hover:bg-orange-50/40 transition-all duration-200">
                <span className="flex-shrink-0 text-3xl leading-none mt-0.5">{emoji}</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-green-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none opacity-10">
          <span className="absolute top-6 left-12 text-6xl">🌲</span>
          <span className="absolute bottom-6 right-12 text-6xl">🌲</span>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl">⛺</span>
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-5xl mb-6">🏕️</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-green-200 text-lg mb-10">
            Crea tu campamento en minutos o entra con el código que te han dado.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/create-camp"
              className="flex items-center justify-center gap-3 bg-white text-green-700 font-extrabold text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              🏕️ Crear campamento gratis
            </Link>
            <Link
              to="/login"
              className="flex items-center justify-center gap-3 bg-green-500 hover:bg-green-400 border border-green-400 text-white font-bold text-base px-7 py-4 rounded-2xl transition-all duration-200"
            >
              Ya tengo cuenta <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white">
            <span className="text-xl">🏕️</span>
            <span className="font-extrabold">Kamplay</span>
            <span className="text-gray-500 font-normal ml-1">· Tu pasión, su felicidad</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} Kamplay. Todos los derechos reservados.</p>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
