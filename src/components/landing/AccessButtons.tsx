import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tent, LogIn } from 'lucide-react';

const AccessButtons = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row gap-6 justify-center items-center max-w-3xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate('/create-camp')}
        className="group w-full md:w-72 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="flex flex-col items-center gap-4">
          <Tent size={48} className="group-hover:scale-110 transition-transform" />
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Crear campamento</h3>
            <p className="text-indigo-100">Para monitores y organizadores</p>
          </div>
        </div>
      </button>

      <button
        onClick={() => navigate('/login')}
        className="group w-full md:w-72 bg-white hover:bg-gray-50 text-gray-800 rounded-xl p-6 border-2 border-gray-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="flex flex-col items-center gap-4">
          <LogIn size={48} className="group-hover:scale-110 transition-transform" />
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Iniciar sesión</h3>
            <p className="text-gray-600">Para padres y monitores</p>
          </div>
        </div>
      </button>
    </div>
  );
};

export default AccessButtons;