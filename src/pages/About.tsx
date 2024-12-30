import React from 'react';
import Navigation from '../components/landing/Navigation';
import { Shield, Users, Calendar, ClipboardCheck } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Shield,
      title: 'Gestión Segura',
      description: 'Control total de la información y actividades del campamento con máxima seguridad.'
    },
    {
      icon: Users,
      title: 'Comunicación Efectiva',
      description: 'Conexión directa entre padres y monitores para un seguimiento constante.'
    },
    {
      icon: Calendar,
      title: 'Organización Integral',
      description: 'Planificación detallada de actividades, horarios y recursos.'
    },
    {
      icon: ClipboardCheck,
      title: 'Seguimiento Personalizado',
      description: 'Control individual del progreso y bienestar de cada participante.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Nuestra Plataforma
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Kamplay es una solución integral diseñada para hacer que la gestión de campamentos 
            sea más eficiente, segura y transparente para todos los involucrados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <feature.icon className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              ¿Por qué elegir Kamplay?
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-indigo-600 font-bold">01.</span>
                <p className="text-gray-600">
                  Interfaz intuitiva y fácil de usar para padres y monitores
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-600 font-bold">02.</span>
                <p className="text-gray-600">
                  Seguimiento en tiempo real de actividades y progreso
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-600 font-bold">03.</span>
                <p className="text-gray-600">
                  Gestión eficiente de recursos y personal
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-indigo-600 font-bold">04.</span>
                <p className="text-gray-600">
                  Comunicación directa y transparente
                </p>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;