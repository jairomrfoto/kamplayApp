import React from 'react';
import { useState } from 'react';
import { useStore } from '../../store/store';
import { Users, Calendar, Package, UserCog, Tent, HeartPulse, Plus, AlertTriangle, Mail, MapPin, Award } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import JoinCampModal from './JoinCampModal';
import IncidentForm from '../shared/IncidentForm';

const CurrentCamp = () => {
  const navigate = useNavigate();
  const { currentMonitor, grupos, campers, actividades } = useStore();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const currentGroup = grupos.find(g => g.id === currentMonitor?.grupoAsignado);
  const monitorActividades = actividades.filter(act => act.monitores.includes(currentMonitor?.id || ''));

  const handleJoinCamp = (code: string) => {
    // Aquí iría la lógica para unirse al campamento
    console.log('Uniendo al campamento con código:', code);
    setShowJoinModal(false);
  };

  const features = [
    { icon: Calendar, title: 'Calendario', description: 'Ver horario de actividades', path: '/monitor-dashboard/calendario', disabled: !currentGroup },
    { icon: Users, title: 'Acampados', description: 'Gestionar participantes', path: '/monitor-dashboard/acampados', disabled: !currentGroup },
    { icon: Package, title: 'Materiales', description: 'Inventario disponible', path: '/monitor-dashboard/materiales', disabled: !currentGroup },
    { icon: UserCog, title: 'Monitores', description: 'Equipo de trabajo', path: '/monitor-dashboard/monitores', disabled: !currentGroup },
    { icon: Tent, title: 'Cabañas', description: 'Gestión de alojamiento', path: '/monitor-dashboard/cabanas', disabled: !currentGroup },
    { icon: HeartPulse, title: 'Área Médica', description: 'Información sanitaria', path: '/monitor-dashboard/area-medica', disabled: !currentGroup }
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Perfil del Monitor */}
      {currentMonitor && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-6">
            {currentMonitor.foto ? (
              <img
                src={currentMonitor.foto}
                alt={currentMonitor.nombre}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center">
                <UserCog className="w-12 h-12 text-indigo-600" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{currentMonitor.nombre}</h2>
              <p className="text-indigo-600 font-medium">{currentMonitor.especialidad}</p>
              <div className="flex items-center gap-4 mt-2 text-gray-600">
                {currentMonitor.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{currentMonitor.email}</span>
                  </div>
                )}
                {currentMonitor.ubicacion && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{currentMonitor.ubicacion}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {currentMonitor.certificaciones && currentMonitor.certificaciones.length > 0 && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Certificaciones</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentMonitor.certificaciones.map((cert, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{cert.nombre}</p>
                      <p className="text-sm text-gray-600">{cert.emisor}</p>
                      <p className="text-sm text-gray-500">{cert.fecha}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {!currentGroup && (
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            No estás asignado a ningún campamento
          </h3>
          <p className="text-gray-600 mb-6">
            Para empezar, únete a un campamento usando el código proporcionado por el administrador
          </p>
          <div className="flex justify-center gap-4">
          <button
            onClick={() => setShowJoinModal(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            <Plus size={20} />
            Unirse a un Campamento
          </button>
          </div>
        </div>
      )}
      
      {currentGroup && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowIncidentForm(true)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <AlertTriangle size={20} />
            Reportar Incidencia
          </button>
        </div>
      )}

      {/* Resumen del Grupo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-indigo-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Grupo</h3>
          {currentGroup ? (
            <div className="space-y-4">
            <div>
              <span className="text-gray-600">Nombre del Grupo:</span>
              <p className="font-medium text-lg">{currentGroup.nombre}</p>
            </div>
            <div>
              <span className="text-gray-600">Rango de Edad:</span>
              <p className="font-medium">{currentGroup.edadMinima} - {currentGroup.edadMaxima} años</p>
            </div>
            </div>
          ) : (
            <p className="text-gray-500">Sin grupo asignado actualmente</p>
          )}
        </div>

        <div className="bg-green-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acampados</h3>
          <p className="text-3xl font-bold text-green-600">{currentGroup?.acampados.length || 0}</p>
          <p className="text-gray-600">participantes activos</p>
        </div>

        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monitores</h3>
          <p className="text-3xl font-bold text-blue-600">{currentGroup?.monitores.length || 0}</p>
          <p className="text-gray-600">monitores asignados</p>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
        {features.map((feature) => (
          <div
            key={feature.title}
            className={`bg-white rounded-xl p-3 lg:p-6 shadow-sm flex flex-col lg:flex-row items-center lg:items-start text-center lg:text-left gap-2 lg:gap-4 group ${
              feature.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md transition-shadow cursor-pointer'
            }`}
            onClick={() => !feature.disabled && navigate(feature.path)}
          >
            <div className="p-2 lg:p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <feature.icon className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm lg:text-base mb-1">{feature.title}</h3>
              <p className="text-xs lg:text-sm text-gray-600">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lista de Acampados */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Acampados Asignados</h3>
          {currentGroup && (
            <Link
              to="/monitor-dashboard/acampados"
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              Ver todos
            </Link>
          )}
        </div>
        {currentGroup ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentGroup.acampados.slice(0, 6).map(acampadoId => {
              const camper = campers.find(c => c.id === acampadoId);
              return camper ? (
                <div key={camper.id} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">{camper.nombre}</h4>
                  <p className="text-sm text-gray-600">{camper.edad} años</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full">
                      Cabaña {camper.cabana}
                    </span>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500">No hay acampados asignados</p>
        )}
      </div>
      
      {showJoinModal && (
        <JoinCampModal
          onJoin={handleJoinCamp}
          onClose={() => setShowJoinModal(false)}
        />
      )}
      
      {showIncidentForm && (
        <IncidentForm onClose={() => setShowIncidentForm(false)} />
      )}
    </div>
  );
};

export default CurrentCamp;