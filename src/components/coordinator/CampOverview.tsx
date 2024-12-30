import React, { useState } from 'react';
import { useStore } from '../../store/store';
import { Users, Calendar, Package, Award, MapPin, Clock, AlertTriangle } from 'lucide-react';
import IncidentForm from '../shared/IncidentForm';

const CampOverview = () => {
  const { campHistory, monitores, campers, actividades } = useStore();
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const currentCamp = campHistory[0]; // Using the first camp as example

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowIncidentForm(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          <AlertTriangle size={20} />
          Reportar Incidencia
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentCamp.nombre}</h1>
            <div className="flex items-center gap-2 mt-2 text-gray-600">
              <MapPin size={18} />
              <span>{currentCamp.ubicacion}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-indigo-600" />
            <span>{new Date(currentCamp.fechaInicio).toLocaleDateString()} - {new Date(currentCamp.fechaFin).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-indigo-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Users className="text-indigo-600" />
              <div>
                <p className="text-sm text-gray-600">Participantes</p>
                <p className="text-xl font-bold">{currentCamp.estadisticas.participantes}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Actividades</p>
                <p className="text-xl font-bold">{currentCamp.estadisticas.actividades}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Package className="text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Materiales</p>
                <p className="text-xl font-bold">{currentCamp.materiales.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Award className="text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Satisfacción</p>
                <p className="text-xl font-bold">{currentCamp.estadisticas.satisfaccion}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Logros del Campamento</h2>
          <div className="space-y-3">
            {currentCamp.logros.map((logro: string, index: number) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 mt-2 rounded-full bg-green-500" />
                <p className="text-gray-600">{logro}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Incidencias</h2>
          <div className="space-y-3">
            {currentCamp.incidencias.map((incidencia: string, index: number) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-2 h-2 mt-2 rounded-full bg-red-500" />
                <p className="text-gray-600">{incidencia}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Momentos Destacados</h2>
          <div className="space-y-4">
            {currentCamp.momentosDestacados.map((momento: string, index: number) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <span className="text-indigo-600 font-medium">#{index + 1}</span>
                <p className="mt-1 text-gray-600">{momento}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Informe Médico</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Incidencias:</span>
              <span className="font-medium">{currentCamp.informeMedico.incidencias}</span>
            </div>
            {currentCamp.informeMedico.atencionesMedicas.map((atencion: any, index: number) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{atencion.fecha}</span>
                  <span className="font-medium">{atencion.tipo}</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{atencion.descripcion}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Evaluación General</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Puntuación General:</span>
              <span className="text-xl font-bold text-indigo-600">
                {currentCamp.evaluacion.puntuacion}/5.0
              </span>
            </div>
            <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
              {currentCamp.evaluacion.comentarios}
            </p>
          </div>
        </div>
      </div>

      {showIncidentForm && (
        <IncidentForm onClose={() => setShowIncidentForm(false)} />
      )}
    </div>
  );
};

export default CampOverview;