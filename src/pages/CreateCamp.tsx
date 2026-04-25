import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import CampForm from '../components/camps/CampForm';

const CreateCamp = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <header className="bg-white/80 backdrop-blur border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🏕️</span>
            <span className="text-lg font-extrabold text-gray-900">Kamplay</span>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-4xl mb-3">⛺</div>
            <h1 className="text-3xl font-extrabold text-gray-900">Crear nuevo campamento</h1>
            <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
              Configura tu campamento en unos pocos pasos. Después podrás invitar a monitores y gestionar todo desde el panel de control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            {[
              { emoji: '📋', title: 'Información básica', description: 'Nombre, fechas y ubicación' },
              { emoji: '👥', title: 'Capacidad', description: 'Número de monitores y acampados' },
              { emoji: '⚙️', title: 'Administración', description: 'Datos del coordinador' },
            ].map((step, index) => (
              <div key={index} className="bg-white rounded-2xl p-5 border border-orange-100 shadow-sm">
                <div className="w-8 h-8 bg-orange-500 text-white font-extrabold rounded-full flex items-center justify-center mx-auto mb-3 text-sm">
                  {index + 1}
                </div>
                <div className="text-2xl mb-2">{step.emoji}</div>
                <h3 className="font-bold text-gray-900 mb-1 text-sm">{step.title}</h3>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>

          <CampForm />
        </div>
      </main>
    </div>
  );
};

export default CreateCamp;