import React from 'react';
import { Tent, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import CampForm from '../components/camps/CampForm';

const CreateCamp = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Tent className="h-8 w-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Kamplay</h1>
            </div>
            <Link 
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              <span>Volver al inicio</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Crear Nuevo Campamento</h1>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Configura todos los detalles de tu campamento. Una vez creado, podrás invitar a monitores
              y gestionar todas las actividades desde el panel de control.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              {
                title: 'Información Básica',
                description: 'Nombre, fechas y ubicación'
              },
              {
                title: 'Capacidad',
                description: 'Número de monitores y acampados'
              },
              {
                title: 'Administración',
                description: 'Datos del coordinador'
              }
            ].map((step, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 border-2 border-indigo-100"
              >
                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  {index + 1}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
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