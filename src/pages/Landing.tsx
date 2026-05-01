import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Check, Shield, Zap, Users, Heart,
  Calendar, ClipboardList, Package, BookOpen, MessageSquare,
  Plus, Minus, Clock, Smartphone, Star, Award,
} from 'lucide-react';

// ── Data ─────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Users,
    title: 'Gestión de participantes',
    desc: 'Fichas completas con información médica, alergias y medicación. Todo accesible al instante para el equipo.',
  },
  {
    icon: Calendar,
    title: 'Calendario y actividades',
    desc: 'Planifica cada día, crea horarios detallados y comparte el programa con todo el equipo en tiempo real.',
  },
  {
    icon: Shield,
    title: 'Área médica',
    desc: 'Seguimiento médico continuo, control de incidencias y alertas para situaciones urgentes. Nada se escapa.',
  },
  {
    icon: ClipboardList,
    title: 'Asistencia diaria',
    desc: 'Pasa lista en segundos, registra ausencias con motivo y añade notas. Imprescindible en campus diurnos.',
  },
  {
    icon: BookOpen,
    title: 'Banco de actividades',
    desc: 'Guarda tus actividades favoritas y reutilízalas en cada programa sin empezar de cero cada verano.',
  },
  {
    icon: MessageSquare,
    title: 'Novedades y chat',
    desc: 'Canal de comunicación directo entre el equipo y las familias. Todos informados sin grupos de WhatsApp.',
  },
  {
    icon: Package,
    title: 'Control de materiales',
    desc: 'Inventario de material actualizado y accesible para todo el equipo. Sin sorpresas el día D.',
  },
  {
    icon: Zap,
    title: 'Multi-programa',
    desc: 'Gestiona varios campamentos o campus desde una sola cuenta. Cambia entre ellos al instante.',
  },
  {
    icon: Smartphone,
    title: '100% en el móvil',
    desc: 'Sin descargas. Funciona en cualquier dispositivo desde el navegador. Rápido y siempre disponible.',
  },
];

const roles = [
  {
    emoji: '🧭',
    role: 'Coordinadores',
    tagline: 'El mando central',
    color: 'bg-orange-500',
    border: 'border-orange-200',
    ring: 'ring-orange-100',
    light: 'bg-orange-50',
    text: 'text-orange-700',
    points: [
      'Crea y configura campamentos y campus en minutos',
      'Supervisa monitores, grupos y participantes',
      'Controla materiales, menús y recursos',
      'Genera códigos de acceso para cada perfil',
      'Publica novedades para las familias',
    ],
  },
  {
    emoji: '🏕️',
    role: 'Monitores',
    tagline: 'Cerca de los niños',
    color: 'bg-green-600',
    border: 'border-green-200',
    ring: 'ring-green-100',
    light: 'bg-green-50',
    text: 'text-green-700',
    points: [
      'Accede a tu grupo y fichas de participantes',
      'Anota evaluaciones e incidencias al momento',
      'Pasa lista en campus con un solo toque',
      'Consulta y planifica actividades del día',
      'Tu biblioteca personal de actividades',
    ],
  },
  {
    emoji: '👨‍👩‍👧',
    role: 'Familias',
    tagline: 'Siempre informadas',
    color: 'bg-amber-500',
    border: 'border-amber-200',
    ring: 'ring-amber-100',
    light: 'bg-amber-50',
    text: 'text-amber-700',
    points: [
      'Sigue el día a día de tu hijo en tiempo real',
      'Consulta menú, actividades y novedades',
      'Revisa la información médica registrada',
      'Accede con el código del programa',
      'Comunicación directa con el equipo',
    ],
  },
];

const testimonials = [
  {
    quote: 'Antes gestionaba 80 acampados con hojas de cálculo y papeles. Ahora todo está en un sitio y el equipo trabaja mucho más coordinado.',
    author: 'María G.',
    role: 'Coordinadora de campamento, Madrid',
    stars: 5,
    initial: 'M',
    color: 'bg-orange-500',
  },
  {
    quote: 'Pasar lista cada mañana me lleva 30 segundos. Tengo toda la información médica del grupo en el móvil. No me imagino volver a los papeles.',
    author: 'Iván R.',
    role: 'Monitor de campus de verano, Barcelona',
    stars: 5,
    initial: 'I',
    color: 'bg-green-600',
  },
  {
    quote: 'Por fin sé lo que come mi hijo, qué actividades hace y cómo está. Me tranquiliza mucho tenerlo todo a mano desde el móvil.',
    author: 'Laura P.',
    role: 'Madre de acampado, Sevilla',
    stars: 5,
    initial: 'L',
    color: 'bg-amber-500',
  },
];

const faqs = [
  {
    q: '¿Qué es Kamplay y para qué sirve?',
    a: 'Kamplay es una plataforma de gestión para campamentos de verano y campus diurnos. Reúne en una sola app las herramientas que necesitan coordinadores, monitores y familias: gestión de participantes, área médica, actividades, comunicación y mucho más. Olvídate de los Excel y los grupos de WhatsApp.',
  },
  {
    q: '¿Es gratuito Kamplay?',
    a: 'Sí. Kamplay tiene un plan gratuito para empezar sin coste. Puedes crear tu programa, invitar a tu equipo y gestionar tu campamento desde el primer día sin introducir ninguna tarjeta de crédito.',
  },
  {
    q: '¿Para qué tipos de campamentos está diseñado?',
    a: 'Kamplay funciona tanto para campamentos de verano con pernocta (cabañas, tiendas) como para campus diurnos sin pernocta. Se adapta a programas de cualquier tamaño, desde 20 hasta cientos de participantes.',
  },
  {
    q: '¿Cómo se unen monitores y familias al campamento?',
    a: 'El coordinador genera un código de acceso distinto para cada perfil (monitores, familias, profesores). Comparte ese código y los usuarios se unen al instante, con acceso solo a la información que les corresponde.',
  },
  {
    q: '¿Pueden los padres ver la información de sus hijos?',
    a: 'Sí. Los padres tienen un panel propio donde consultan el menú diario, las actividades, el estado médico de su hijo y las novedades del campamento en tiempo real. Solo necesitan el código que les facilita el coordinador.',
  },
  {
    q: '¿Funciona en el móvil?',
    a: 'Kamplay está optimizado para móvil, tablet y ordenador. No requiere descarga de ninguna app — funciona desde el navegador en cualquier dispositivo, en cualquier sistema operativo.',
  },
  {
    q: '¿Qué información médica se puede gestionar?',
    a: 'Cada ficha de participante incluye alergias, intolerancias, medicación con pauta y dosis, enfermedades crónicas y observaciones médicas. El área médica permite registrar incidencias y llevar un seguimiento durante todo el programa.',
  },
];

// ── Components ────────────────────────────────────────────────────────────────

const StarRating = ({ n }: { n: number }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={14} className={i <= n ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
    ))}
  </div>
);

const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border border-gray-200 rounded-2xl transition-all duration-200 ${open ? 'shadow-sm' : ''}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={open}
      >
        <span className="font-bold text-gray-900 text-sm sm:text-base leading-snug">{q}</span>
        <span className="shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
          {open ? <Minus size={14} /> : <Plus size={14} />}
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────

const Landing = () => {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-stone-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Kamplay inicio">
            <span className="text-2xl" aria-hidden="true">🏕️</span>
            <span className="text-lg font-extrabold text-gray-900">Kamplay</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-gray-600">
            <a href="#funcionalidades" className="px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">Funcionalidades</a>
            <a href="#para-quien" className="px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">¿Para quién?</a>
            <a href="#preguntas" className="px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
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
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-15" aria-hidden="true">
          <span className="absolute top-8 left-8 text-5xl">🌲</span>
          <span className="absolute top-16 right-12 text-4xl">⛺</span>
          <span className="absolute bottom-16 left-16 text-4xl">🌻</span>
          <span className="absolute bottom-8 right-8 text-5xl">🏔️</span>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-8 uppercase tracking-wider">
            <Award size={13} /> Software para campamentos y campus de verano
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Gestiona tu campamento<br className="hidden sm:block" /> de verano sin caos
          </h1>
          <p className="text-lg sm:text-xl text-orange-100 max-w-2xl mx-auto mb-4">
            La plataforma todo-en-uno que coordinadores, monitores y familias necesitaban.
            Participantes, área médica, actividades y comunicación — todo en una sola app.
          </p>
          <p className="text-sm text-orange-200 mb-10 max-w-lg mx-auto">
            Diseñada para campamentos de verano con pernocta y campus diurnos. Sin papeles, sin Excel, sin WhatsApp.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/create-camp"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-orange-600 font-extrabold text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200"
            >
              Crear mi programa gratis <ChevronRight size={20} />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-base px-7 py-4 rounded-2xl transition-all duration-200"
            >
              Ya tengo cuenta
            </Link>
          </div>

          <p className="mt-6 text-orange-200 text-sm">
            Registro gratuito · Sin tarjeta de crédito · Listo en 5 minutos
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section className="py-12 bg-white border-b border-stone-100" aria-label="Cifras clave">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: '5 min', label: 'para crear tu primer programa', icon: Clock },
              { value: '3 roles', label: 'coordinador, monitor y familia', icon: Users },
              { value: '0 €',    label: 'para empezar, sin tarjeta', icon: Award },
              { value: '100%',   label: 'sin papeles ni hojas de cálculo', icon: Zap },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Icon size={18} className="text-orange-500" />
                </div>
                <p className="text-3xl font-extrabold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Campamento vs Campus ── */}
      <section className="py-20 bg-white" aria-labelledby="modalidades-heading">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-orange-500 font-bold text-sm uppercase tracking-wider mb-3">Dos modalidades, una sola app</span>
            <h2 id="modalidades-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              ¿Campamento de verano o campus diurno?
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Da igual si los niños duermen en cabañas o solo vienen de día. Kamplay se adapta perfectamente a los dos.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campamento */}
            <div className="rounded-2xl border-2 border-orange-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5 flex items-center gap-4">
                <span className="text-4xl" aria-hidden="true">🏕️</span>
                <div>
                  <h3 className="text-white font-extrabold text-xl">Campamento de verano</h3>
                  <p className="text-orange-100 text-sm">Con pernocta en cabañas o tiendas</p>
                </div>
              </div>
              <ul className="px-6 py-5 space-y-3 bg-orange-50/30">
                {[
                  'Gestión de cabañas y revisión de estado',
                  'Seguimiento médico las 24 horas',
                  'Actividades, horarios y calendario completo',
                  'Grupos por edad con monitor asignado',
                  'Novedades en tiempo real para las familias',
                ].map(p => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <Check size={16} className="text-orange-500 mt-0.5 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            {/* Campus */}
            <div className="rounded-2xl border-2 border-blue-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5 flex items-center gap-4">
                <span className="text-4xl" aria-hidden="true">🏫</span>
                <div>
                  <h3 className="text-white font-extrabold text-xl">Campus diurno de verano</h3>
                  <p className="text-blue-100 text-sm">Actividades sin pernocta</p>
                </div>
              </div>
              <ul className="px-6 py-5 space-y-3 bg-blue-50/30">
                {[
                  'Control de asistencia: pasa lista en segundos',
                  'Registro de ausencias con motivo',
                  'Actividades, calendario y menú diario',
                  'Grupos y monitores asignados',
                  'Portal para profesores del colegio',
                ].map(p => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <Check size={16} className="text-blue-500 mt-0.5 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Para quién ── */}
      <section id="para-quien" className="py-20 bg-stone-50" aria-labelledby="roles-heading">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-green-600 font-bold text-sm uppercase tracking-wider mb-3">¿Para quién es Kamplay?</span>
            <h2 id="roles-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Cada perfil, sus propias herramientas
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Coordinadores, monitores y familias acceden a lo que necesitan. Nada más, nada menos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map(({ emoji, role, tagline, color, border, ring, light, text, points }) => (
              <article key={role} className={`bg-white rounded-2xl shadow-sm border ${border} ring-1 ${ring} overflow-hidden hover:shadow-md transition-shadow`}>
                <div className={`${color} px-6 py-5 flex items-center gap-3`}>
                  <span className="text-3xl" aria-hidden="true">{emoji}</span>
                  <div>
                    <h3 className="text-white font-extrabold text-xl">{role}</h3>
                    <p className="text-white/80 text-xs font-medium">{tagline}</p>
                  </div>
                </div>
                <ul className="px-6 py-5 space-y-3">
                  {points.map(p => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <span className={`mt-0.5 shrink-0 w-5 h-5 rounded-full ${light} ${text} flex items-center justify-center text-xs font-bold`} aria-hidden="true">✓</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section className="py-20 bg-white" aria-labelledby="pasos-heading">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-orange-500 font-bold text-sm uppercase tracking-wider mb-3">Empieza en 3 pasos</span>
            <h2 id="pasos-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900">Empezar es muy fácil</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">
              Sin instalaciones, sin contratos, sin formaciones. Tu campamento funcionando en menos de 5 minutos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '1', icon: Zap,
                title: 'Crea tu programa',
                desc: 'Regístrate gratis, elige entre campamento o campus y configura los datos básicos en menos de 5 minutos.',
              },
              {
                step: '2', icon: Users,
                title: 'Invita a tu equipo',
                desc: 'Comparte los códigos de acceso con monitores, familias y profesores. Se unen al instante sin tramites.',
              },
              {
                step: '3', icon: Heart,
                title: 'Gestiona sin papeles',
                desc: 'Controla actividades, participantes, área médica y más desde un panel limpio y rápido en cualquier dispositivo.',
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="bg-white rounded-2xl p-7 text-center border border-stone-100 shadow-sm hover:border-orange-200 hover:shadow-md transition-all">
                <div className="relative inline-block mb-5">
                  <div className="w-14 h-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center shadow-md">
                    <Icon size={24} />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 text-white text-xs font-extrabold rounded-full flex items-center justify-center shadow">
                    {step}
                  </span>
                </div>
                <h3 className="font-extrabold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/create-camp"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl transition-colors shadow-md hover:shadow-lg"
            >
              Crear mi programa gratis <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Funcionalidades ── */}
      <section id="funcionalidades" className="py-20 bg-stone-50" aria-labelledby="features-heading">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-orange-500 font-bold text-sm uppercase tracking-wider mb-3">Funcionalidades</span>
            <h2 id="features-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Todo lo que necesitas para gestionar un campamento
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Kamplay reúne en una sola app las herramientas esenciales para coordinar campamentos de verano y campus con total tranquilidad.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-5 rounded-2xl bg-white border border-stone-100 hover:border-orange-200 hover:shadow-sm transition-all duration-200">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Icon size={18} className="text-orange-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-white" aria-labelledby="testimonios-heading">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-amber-500 font-bold text-sm uppercase tracking-wider mb-3">Testimonios</span>
            <h2 id="testimonios-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Lo que dicen coordinadores, monitores y familias
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ quote, author, role, stars, initial, color }) => (
              <figure key={author} className="bg-stone-50 rounded-2xl p-6 border border-stone-100 flex flex-col gap-4">
                <StarRating n={stars} />
                <blockquote className="text-sm text-gray-700 leading-relaxed flex-1">
                  "{quote}"
                </blockquote>
                <figcaption className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${color} text-white font-extrabold flex items-center justify-center text-sm shrink-0`}>
                    {initial}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{author}</p>
                    <p className="text-xs text-gray-400">{role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-20 bg-stone-50" aria-labelledby="precios-heading">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-orange-500 font-bold text-sm uppercase tracking-wider mb-3">Precios</span>
            <h2 id="precios-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900">Paga solo por lo que usas</h2>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">
              Sin permanencia. Sin comisiones ocultas. Elige el plan que encaja con tu programa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Express */}
            <div className="bg-white rounded-2xl border-2 border-stone-200 p-7 flex flex-col">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Express</p>
              <p className="text-4xl font-extrabold text-gray-900 mb-1">9 €</p>
              <p className="text-sm text-gray-400 mb-1">pago único por evento</p>
              <p className="text-xs text-orange-500 font-semibold mb-6">Hasta 3 días</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  'Un campamento o campus',
                  'Gestión de acampados y grupos',
                  'Acceso para monitores y familias',
                  'Actividades y asistencia',
                  'Editable hasta 2 días post-evento',
                  'Archivo permanente de solo lectura',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check size={14} className="text-green-500 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/login" className="block w-full text-center border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-bold py-3 rounded-xl transition-colors">
                Empezar
              </Link>
            </div>

            {/* Estándar */}
            <div className="bg-white rounded-2xl border-2 border-orange-300 p-7 flex flex-col relative shadow-md">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">Más popular</div>
              <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-2">Estándar</p>
              <p className="text-4xl font-extrabold text-gray-900 mb-1">15 €</p>
              <p className="text-sm text-gray-400 mb-1">pago único por evento</p>
              <p className="text-xs text-orange-500 font-semibold mb-6">Hasta 7 días</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  'Un campamento o campus',
                  'Gestión de acampados y grupos',
                  'Acceso para monitores y familias',
                  'Actividades, menú e incidencias',
                  'Escáner de documentos',
                  'Editable hasta 7 días post-evento',
                  'Archivo permanente de solo lectura',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check size={14} className="text-green-500 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/login" className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors">
                Empezar
              </Link>
            </div>

            {/* Profesional */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-7 text-white flex flex-col">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Profesional</p>
              <div className="mb-1">
                <span className="text-4xl font-extrabold">30 €</span>
                <span className="text-gray-400 text-sm">/mes</span>
              </div>
              <p className="text-sm text-gray-400 mb-1">o <span className="text-white font-bold">250 €/año</span> <span className="text-green-400 text-xs font-semibold">(ahorras 2 meses)</span></p>
              <p className="text-xs text-orange-400 font-semibold mb-6">Programas ilimitados</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  'Campamentos y campus ilimitados',
                  'Sin límite de duración por evento',
                  'Todo lo del plan Estándar',
                  'Escáner de documentos con IA',
                  'Directorio público con valoraciones',
                  'Estadísticas y reportes',
                  'Soporte prioritario',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                    <Check size={14} className="text-orange-400 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <Link to="/login" className="block w-full text-center bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 rounded-xl transition-colors">
                Suscribirme
              </Link>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            Los planes por evento no caducan: el archivo queda en modo lectura de forma permanente. · IVA no incluido.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="preguntas" className="py-20 bg-white" aria-labelledby="faq-heading">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-orange-500 font-bold text-sm uppercase tracking-wider mb-3">Preguntas frecuentes</span>
            <h2 id="faq-heading" className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Todo lo que necesitas saber sobre Kamplay
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map(({ q, a }) => <FaqItem key={q} q={q} a={a} />)}
          </div>
          <p className="text-center text-sm text-gray-500 mt-8">
            ¿Otra pregunta? <Link to="/login" className="text-orange-500 hover:text-orange-700 font-semibold">Escríbenos</Link>
          </p>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-green-800 text-white relative overflow-hidden" aria-labelledby="cta-heading">
        <div className="absolute inset-0 pointer-events-none select-none opacity-10" aria-hidden="true">
          <span className="absolute top-6 left-12 text-6xl">🌲</span>
          <span className="absolute bottom-6 right-12 text-6xl">🌲</span>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl">⛺</span>
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 id="cta-heading" className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            ¿Listo para gestionar tu campamento sin caos?
          </h2>
          <p className="text-green-200 text-lg mb-4">
            Únete a los coordinadores que ya gestionan sus campamentos de verano con Kamplay.
          </p>
          <p className="text-green-300 text-sm mb-10">
            Gratis para empezar · Sin tarjeta de crédito · Configuración en 5 minutos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/create-camp"
              className="flex items-center justify-center gap-2 bg-white text-green-700 font-extrabold text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              Crear mi campamento gratis <ChevronRight size={20} />
            </Link>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 border border-green-400 text-white font-bold text-base px-7 py-4 rounded-2xl transition-all duration-200"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-12" role="contentinfo">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 text-white mb-3">
                <span className="text-xl" aria-hidden="true">🏕️</span>
                <span className="font-extrabold text-lg">Kamplay</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Software de gestión para campamentos de verano y campus diurnos. Coordinadores, monitores y familias en una sola plataforma.
              </p>
            </div>
            {/* Links */}
            <div>
              <p className="text-white font-bold text-sm mb-3">Plataforma</p>
              <ul className="space-y-2 text-sm">
                <li><Link to="/create-camp" className="hover:text-white transition-colors">Crear campamento</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Iniciar sesión</Link></li>
                <li><a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#preguntas" className="hover:text-white transition-colors">Preguntas frecuentes</a></li>
              </ul>
            </div>
            {/* SEO text */}
            <div>
              <p className="text-white font-bold text-sm mb-3">¿Qué es Kamplay?</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                La plataforma para organizar campamentos de verano y campus diurnos en España. Gestiona acampados, actividades y comunicación desde el móvil.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <p>© {new Date().getFullYear()} Kamplay · Todos los derechos reservados</p>
            <p className="text-gray-600 text-xs">Software de gestión para campamentos de verano · España</p>
          </div>
        </div>
      </footer>

      {/* ── HIDDEN: Directorio — re-enable when ready ── */}
      {false && <section />}

    </div>
  );
};

export default Landing;
