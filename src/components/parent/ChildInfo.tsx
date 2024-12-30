import React from 'react';
import { Heart, Pill, AlertCircle } from 'lucide-react';
import type { Camper } from '../../types';

interface Props {
  camper: Camper;
}

const ChildInfo = ({ camper }: Props) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Nombre</h3>
            <p className="mt-1 text-gray-900">{camper.nombre}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Edad</h3>
            <p className="mt-1 text-gray-900">{camper.edad} años</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Grupo</h3>
            <p className="mt-1 text-gray-900">{camper.grupo}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Cabaña</h3>
            <p className="mt-1 text-gray-900">{camper.cabana}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Médica</h2>
        <div className="space-y-4">
          {camper.infoMedica.alergias.length > 0 && (
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-500 mt-1" size={20} />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Alergias</h3>
                <ul className="mt-1 list-disc pl-5 text-gray-900">
                  {camper.infoMedica.alergias.map((alergia, index) => (
                    <li key={index}>{alergia}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {camper.infoMedica.medicacion.length > 0 && (
            <div className="flex items-start gap-3">
              <Pill className="text-blue-500 mt-1" size={20} />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Medicación</h3>
                <ul className="mt-1 list-disc pl-5 text-gray-900">
                  {camper.infoMedica.medicacion.map((med, index) => (
                    <li key={index}>{med}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {camper.infoMedica.notas && (
            <div className="flex items-start gap-3">
              <Heart className="text-purple-500 mt-1" size={20} />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Notas Adicionales</h3>
                <p className="mt-1 text-gray-900">{camper.infoMedica.notas}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildInfo;