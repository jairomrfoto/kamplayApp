import React from 'react';
import { Link } from 'react-router-dom';
import { Tent } from 'lucide-react';

const Navigation = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Tent className="h-8 w-8 text-indigo-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Kamplay</h1>
              <p className="text-sm text-indigo-600">Tu pasión, su felicidad</p>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/about" className="text-gray-600 hover:text-gray-900">
              Sobre Nosotros
            </Link>
            <Link to="/benefits" className="text-gray-600 hover:text-gray-900">
              Beneficios
            </Link>
            <Link
              to="/login"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;