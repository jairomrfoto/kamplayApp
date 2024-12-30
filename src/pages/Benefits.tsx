import React from 'react';
import Navigation from '../components/landing/Navigation';
import { Heart, Brain, Users, Sun } from 'lucide-react';

const Benefits = () => {
  const benefits = [
    {
      icon: Heart,
      title: 'Desarrollo Emocional',
      points: [
        'Fomento de la independencia',
        'Mejora de la autoestima',
        'Desarrollo de habilidades sociales',
        'Gestión de emociones'
      ]
    },
    {
      icon: Brain,
      title: 'Crecimiento Personal',
      points: [
        'Desarrollo de la creatividad',
        'Resolución de problemas',
        'Toma de decisiones',
        'Pensamiento crítico'
      ]
    },
    {
      icon: Users,
      title: 'Habilidades Sociales',
      points: [
        'Trabajo en equipo',
        'Comunicación efectiva',
        'Liderazgo',
        'Empatía'
      ]
    },
    {
      icon: Sun,
      title: 'Vida Activa',
      points: [
        'Actividad física regular',
        'Conexión con la naturaleza',
        'Hábitos saludables',
        'Aventura y diversión'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Beneficios del Campamento
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Los campamentos de verano ofrecen experiencias únicas que contribuyen al 
            desarrollo integral de los niños y jóvenes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <benefit.icon className="h-8 w-8 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {benefit.title}
                </h2>
              </div>
              <ul className="space-y-3">
                {benefit.points.map((point, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full" />
                    <span className="text-gray-600">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-indigo-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            ¿Por qué enviar a tu hijo a un campamento?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-indigo-600 mb-2">95%</p>
              <p className="text-gray-600">
                de los niños dicen que hacer nuevos amigos en el campamento les ayudó a sentirse bien consigo mismos
              </p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-indigo-600 mb-2">93%</p>
              <p className="text-gray-600">
                de los padres dicen que el campamento ayudó a sus hijos a desarrollar habilidades sociales
              </p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-indigo-600 mb-2">70%</p>
              <p className="text-gray-600">
                de los padres informan que sus hijos ganaron confianza en sí mismos después del campamento
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Benefits;