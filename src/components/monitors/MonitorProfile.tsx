import React from 'react';
import { Camera, Mail, Award, Calendar, MapPin, Shield } from 'lucide-react';
import type { Monitor } from '../../types';

interface Props {
  monitor: Monitor;
  onEdit: () => void;
  onManagePermissions?: () => void;
  extraActions?: React.ReactNode;
}

const MonitorProfile = ({ monitor, onEdit, onManagePermissions, extraActions }: Props) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="relative h-32 bg-indigo-600">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {onManagePermissions && (
            <button
              onClick={onManagePermissions}
              className="bg-white p-2 rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <Shield size={18} className="text-indigo-600" />
              <span>Permisos</span>
            </button>
          )}
          <button 
            onClick={onEdit}
            className="bg-white p-2 rounded-lg shadow-sm hover:bg-gray-50"
          >
            Editar Perfil
          </button>
          {extraActions}
        </div>
      </div>
      
      <div className="px-6 pb-6">
        <div className="relative flex justify-center">
          <div className="absolute -top-16">
            <div className="relative">
              {monitor.foto ? (
                <img
                  src={monitor.foto}
                  alt={monitor.nombre}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900">{monitor.nombre}</h2>
          <p className="text-indigo-600 font-medium">{monitor.especialidad}</p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3 text-gray-600">
            <Mail className="w-5 h-5" />
            <span>{monitor.email || 'No especificado'}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-600">
            <MapPin className="w-5 h-5" />
            <span>{monitor.ubicacion || 'No especificada'}</span>
          </div>
        </div>

        {monitor.experiencia && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Experiencia</h3>
            <div className="space-y-4">
              {monitor.experiencia.map((exp, index) => (
                <div key={index} className="flex gap-3">
                  <Calendar className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{exp.campamento}</p>
                    <p className="text-sm text-gray-600">{exp.periodo}</p>
                    <p className="text-sm text-gray-600">{exp.rol}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {monitor.certificaciones && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificaciones</h3>
            <div className="space-y-4">
              {monitor.certificaciones.map((cert, index) => (
                <div key={index} className="flex gap-3">
                  <Award className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{cert.nombre}</p>
                    <p className="text-sm text-gray-600">{cert.emisor}</p>
                    <p className="text-sm text-gray-600">{cert.fecha}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitorProfile;