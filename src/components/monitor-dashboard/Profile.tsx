import React, { useState } from 'react';
import { Camera, Mail, MapPin, Award, Briefcase, GraduationCap, Heart, PencilLine, ArrowRight, UserCircle, Tent, School } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store/store';
import { useAuth } from '../../hooks/useAuth';
import ProfileEditForm from './ProfileEditForm';
import ChangePassword from '../ChangePassword';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { currentMonitor, userCamps } = useStore();
  const { user } = useAuth();
  const activeCamps = userCamps.filter(c => c.status !== 'archived');

  const displayName  = currentMonitor?.nombre || user?.displayName || user?.email?.split('@')[0] || '';
  const displayEmail = currentMonitor?.email  || user?.email || '';

  if (isEditing) {
    return <ProfileEditForm onCancel={() => setIsEditing(false)} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="relative">
        <div className="h-32 bg-orange-500 rounded-t-xl">
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <PencilLine size={18} />
            <span>Editar Perfil</span>
          </button>
        </div>

        <div className="px-6">
          <div className="relative flex justify-center">
            <div className="absolute -top-16">
              {currentMonitor?.foto ? (
                <img
                  src={currentMonitor.foto}
                  alt={displayName}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white bg-orange-100 flex items-center justify-center">
                  {displayName ? (
                    <span className="text-4xl font-extrabold text-orange-500">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <UserCircle className="w-16 h-16 text-orange-300" />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-20 text-center">
            <h2 className="text-2xl font-bold text-gray-900">{displayName || '—'}</h2>
            <p className="text-orange-600 font-medium">{currentMonitor?.especialidad || 'Monitor'}</p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-5 h-5" />
                <span>{displayEmail || 'No especificado'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{currentMonitor?.ubicacion || 'No especificada'}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-600" />
                <span className="font-medium">Certificaciones</span>
              </div>
              {currentMonitor?.certificaciones?.map((cert, index) => (
                <div key={index} className="ml-7">
                  <p className="font-medium">{cert.nombre}</p>
                  <p className="text-sm text-gray-600">{cert.emisor} - {cert.fecha}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-orange-600" />
                <span className="font-medium">Experiencia</span>
              </div>
              {currentMonitor?.experiencia?.map((exp, index) => (
                <div key={index} className="ml-7 mb-4">
                  <p className="font-medium">{exp.campamento}</p>
                  <p className="text-sm text-gray-600">{exp.periodo}</p>
                  <p className="text-sm text-gray-600">{exp.rol}</p>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-5 h-5 text-orange-600" />
                <span className="font-medium">Formación</span>
              </div>
              {currentMonitor?.formacion?.map((form, index) => (
                <div key={index} className="ml-7 mb-4">
                  <p className="font-medium">{form.titulo}</p>
                  <p className="text-sm text-gray-600">{form.institucion}</p>
                  <p className="text-sm text-gray-600">{form.año}</p>
                </div>
              ))}
            </div>
          </div>

          {currentMonitor?.habilidades && currentMonitor.habilidades.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-orange-600" />
                <span className="font-medium">Habilidades</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentMonitor.habilidades.map((hab, index) => (
                  <span key={index} className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm">
                    {hab}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mis programas */}
      {activeCamps.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">Mis programas</h3>
          <div className="space-y-3">
            {activeCamps.map(camp => {
              const isCampus = camp.type === 'campus';
              return (
                <div key={camp.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isCampus ? 'bg-blue-100' : 'bg-orange-100'}`}>
                    {isCampus
                      ? <School size={18} className="text-blue-600" />
                      : <Tent size={18} className="text-orange-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{camp.name}</p>
                    <p className="text-xs text-gray-500">{isCampus ? 'Campus' : 'Campamento'}{camp.location ? ` · ${camp.location}` : ''}</p>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Monitor</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upgrade a coordinador */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-wider text-orange-100 mb-1">¿Quieres más?</p>
        <h3 className="text-xl font-extrabold mb-1">Conviértete en Coordinador</h3>
        <p className="text-sm text-orange-100 mb-4">
          Crea tu propio campamento o campus, gestiona monitores y acampados, y dirige tu programa al completo.
        </p>
        <ul className="space-y-1.5 mb-5 text-sm text-orange-50">
          <li>✓ Campamentos y campus ilimitados (Plan Profesional)</li>
          <li>✓ También disponible por evento desde 9 €</li>
          <li>✓ Tu rol cambia a Coordinador automáticamente al pagar</li>
        </ul>
        <Link
          to="/create-camp"
          className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-5 py-2.5 rounded-xl hover:bg-orange-50 transition-colors text-sm"
        >
          Crear mi campamento <ArrowRight size={16} />
        </Link>
      </div>

      <ChangePassword />
    </div>
  );
};

export default Profile;
