import React from 'react';
import { Tent, Calendar, Users, Package, UserCog, Home as HomeIcon, HeartPulse } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const features = [
    { icon: Calendar, title: 'Calendario', description: 'Gestiona todas las actividades y eventos del campamento', path: '/calendario' },
    { icon: Users, title: 'Acampados', description: 'Administra la información de todos los participantes', path: '/acampados' },
    { icon: Package, title: 'Materiales', description: 'Control de inventario y recursos', path: '/materiales' },
    { icon: UserCog, title: 'Monitores', description: 'Gestión del equipo de monitores', path: '/monitores' },
    { icon: HomeIcon, title: 'Habitaciones', description: 'Organización de alojamiento', path: '/habitaciones' },
    { icon: HeartPulse, title: 'Área Médica', description: 'Seguimiento médico y cuidados especiales', path: '/area-medica' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <Tent className="h-16 w-16 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bienvenido a Kamplay
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tu plataforma integral para la gestión de campamentos. Organiza, supervisa y haz seguimiento de todas las actividades de manera eficiente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.path}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col items-center text-center group"
            >
              <feature.icon className="h-12 w-12 text-indigo-600 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            ¿Necesitas ayuda?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nuestro equipo está aquí para ayudarte. Contacta con nosotros si tienes alguna pregunta o necesitas asistencia.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;