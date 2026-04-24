import React from 'react';
import { Link } from 'react-router-dom';
import {
  Tent, Users, Calendar, ShieldCheck, ClipboardList,
  HeartPulse, BookOpen, ChevronRight, Star, Layers,
} from 'lucide-react';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
  </svg>
);

const features = [
  { icon: Users, title: 'Gestión de acampados', desc: 'Fichas completas con información médica, alergias y medicación programada.' },
  { icon: Calendar, title: 'Horarios y actividades', desc: 'Planifica actividades, crea horarios diarios y gestiona el calendario del campamento.' },
  { icon: HeartPulse, title: 'Área médica', desc: 'Control de incidencias, seguimiento médico y alertas para situaciones urgentes.' },
  { icon: ClipboardList, title: 'Grupos y cabañas', desc: 'Organiza a los acampados por grupos de edad y asigna monitores a cada cabaña.' },
  { icon: BookOpen, title: 'Banco de actividades', desc: 'Biblioteca personal de actividades reutilizables entre campamentos.' },
  { icon: Layers, title: 'Multi-campamento', desc: 'Gestiona varios campamentos a la vez y cambia entre ellos al instante.' },
];

const roles = [
  {
    icon: ShieldCheck,
    role: 'Coordinadores',
    color: 'bg-indigo-600',
    light: 'bg-indigo-50 text-indigo-700',
    points: [
      'Crea y gestiona múltiples campamentos',
      'Supervisa monitores y acampados',
      'Controla materiales y recursos',
      'Reportes e incidencias en tiempo real',
    ],
  },
  {
    icon: Star,
    role: 'Monitores',
    color: 'bg-violet-600',
    light: 'bg-violet-50 text-violet-700',
    points: [
      'Accede a tu grupo y acampados',
      'Anota evaluaciones y observaciones',
      'Lleva tu biblioteca de actividades',
      'Comunícate con el equipo',
    ],
  },
  {
    icon: HeartPulse,
    role: 'Padres y tutores',
    color: 'bg-emerald-600',
    light: 'bg-emerald-50 text-emerald-700',
    points: [
      'Sigue el día a día de tu hijo',
      'Consulta el menú y actividades',
      'Revisa el historial médico',
      'Accede con código del campamento',
    ],
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <Tent className="h-7 w-7 text-indigo-600" />
            <span className="text-lg font-bold text-gray-900">Kamplay</span>
          </Link>
          <Link
            to="/login"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 text-white">
        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/5 rounded-full" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 md:py-32 text-center">
          <span className="inline-block bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
            Gestión de campamentos
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Todo lo que necesitas<br className="hidden sm:block" /> para tu campamento
          </h1>
          <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto mb-12">
            Kamplay es la plataforma todo-en-uno para coordinadores, monitores y familias. Gestiona acampados, actividades, área médica y mucho más desde un solo lugar.
          </p>

          {/* CTA buttons — prominentes */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/create-camp"
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-indigo-700 font-bold text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
            >
              <Tent size={22} />
              Crear mi campamento
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-200"
            >
              Acceder a mi cuenta
              <ChevronRight size={20} />
            </Link>
          </div>

          <p className="mt-6 text-indigo-200 text-sm">
            ¿Ya tienes cuenta? Inicia sesión con Google o con tu correo
          </p>
        </div>
      </section>

      {/* ── Para quién ─────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Diseñado para cada miembro del campamento
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            Cada rol tiene su propio acceso y herramientas adaptadas a lo que realmente necesita.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map(({ icon: Icon, role, color, light, points }) => (
              <div key={role} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className={`${color} px-6 py-5 flex items-center gap-3`}>
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Icon size={22} className="text-white" />
                  </div>
                  <h3 className="text-white font-bold text-lg">{role}</h3>
                </div>
                <ul className="px-6 py-5 space-y-3">
                  {points.map(p => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full ${light} flex items-center justify-center text-xs font-bold`}>✓</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Funcionalidades ────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Todo lo que necesitas, nada de lo que no
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            Kamplay reúne en una sola aplicación todas las herramientas esenciales para gestionar un campamento moderno.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-5 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────────────────────── */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-indigo-200 text-lg mb-10">
            Crea tu campamento en minutos o entra con el código que te han dado.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/create-camp"
              className="flex items-center justify-center gap-3 bg-white text-indigo-700 font-bold text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              <Tent size={22} />
              Crear campamento gratis
            </Link>
            <Link
              to="/login"
              className="flex items-center justify-center gap-3 bg-indigo-500 hover:bg-indigo-400 border border-indigo-400 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-200"
            >
              Ya tengo cuenta
              <ChevronRight size={20} />
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-indigo-200 text-sm">
            <GoogleIcon />
            <span>Acceso rápido con Google disponible</span>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white">
            <Tent size={20} className="text-indigo-400" />
            <span className="font-bold">Kamplay</span>
            <span className="text-gray-500 font-normal ml-1">· Tu pasión, su felicidad</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} Kamplay. Todos los derechos reservados.</p>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
