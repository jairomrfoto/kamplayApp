import React from 'react';
import Navigation from '../components/landing/Navigation';
import Hero from '../components/landing/Hero';
import AccessButtons from '../components/landing/AccessButtons';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <AccessButtons />

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            ¿Por qué elegir Kamplay?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Gestión Integral',
                description: 'Control total de actividades, personal y recursos en una sola plataforma'
              },
              {
                title: 'Seguridad Primero',
                description: 'Seguimiento en tiempo real y protocolos de seguridad avanzados'
              },
              {
                title: 'Experiencia Única',
                description: 'Actividades diseñadas para el desarrollo y la diversión'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <span className="text-xl font-bold">Kamplay</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">© 2024 Kamplay. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;