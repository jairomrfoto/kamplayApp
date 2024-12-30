import React from 'react';
import { X, Heart, Pill, AlertCircle, User, MapPin, Home, Users, Calendar } from 'lucide-react';
import type { Camper } from '../../types';
import { useStore } from '../../store/store';

interface Props {
  camperId: string;
  onClose: () => void;
}

const CamperProfileDetail = ({ camperId, onClose }: Props) => {
  const { campers, grupos, cabanas } = useStore();
  const camper = campers.find(c => c.id === camperId);
  
  if (!camper) return null;
  
  const grupo = grupos.find(g => g.id === camper.grupo);
  const cabana = cabanas.find(c => c.id === camper.cabana);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-full">
              <User className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{camper.nombre}</h2>
              <p className="text-gray-500">{camper.edad} años</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información básica */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Información General</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="text-indigo-600" />
                <div>
                  <p className="font-medium">Grupo</p>
                  <p className="text-gray-600">{grupo?.nombre || 'Sin asignar'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Home className="text-indigo-600" />
                <div>
                  <p className="font-medium">Cabaña</p>
                  <p className="text-gray-600">{cabana?.numero || 'Sin asignar'}</p>
                </div>
              </div>
              {camper.contacto && (
                <div className="flex items-center gap-3">
                  <MapPin className="text-indigo-600" />
                  <div>
                    <p className="font-medium">Contacto</p>
                    <p className="text-gray-600">{camper.contacto}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información médica */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Información Médica</h3>
            <div className="space-y-4">
              {camper.infoMedica.alergias.length > 0 && (
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-500 mt-1" />
                  <div>
                    <p className="font-medium">Alergias</p>
                    <ul className="list-disc pl-4 text-gray-600">
                      {camper.infoMedica.alergias.map((alergia, index) => (
                        <li key={index}>{alergia}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {camper.infoMedica.medicacion.length > 0 && (
                <div className="flex items-start gap-3">
                  <Pill className="text-blue-500 mt-1" />
                  <div>
                    <p className="font-medium">Medicación</p>
                    <ul className="list-disc pl-4 text-gray-600">
                      {camper.infoMedica.medicacion.map((med, index) => (
                        <li key={index}>{med}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {camper.infoMedica.notas && (
                <div className="flex items-start gap-3">
                  <Heart className="text-purple-500 mt-1" />
                  <div>
                    <p className="font-medium">Notas Médicas</p>
                    <p className="text-gray-600">{camper.infoMedica.notas}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Evaluaciones */}
          {camper.evaluaciones.length > 0 && (
            <div className="col-span-full bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Evaluaciones</h3>
              <div className="space-y-4">
                {camper.evaluaciones.map((evaluacion, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="text-indigo-600" size={18} />
                      <span className="text-sm text-gray-500">
                        {new Date(evaluacion.fecha).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-2">
                      <div>
                        <p className="text-sm text-gray-500">Participación</p>
                        <p className="font-medium">{evaluacion.participacion}/5</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Comportamiento</p>
                        <p className="font-medium">{evaluacion.comportamiento}/5</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Integración</p>
                        <p className="font-medium">{evaluacion.integracion}/5</p>
                      </div>
                    </div>
                    {evaluacion.observaciones && (
                      <p className="text-sm text-gray-600">{evaluacion.observaciones}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CamperProfileDetail;