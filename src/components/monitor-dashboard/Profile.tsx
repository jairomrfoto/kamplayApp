import React, { useState } from 'react';
import { Camera, Mail, MapPin, Award, Briefcase, GraduationCap, Heart, PencilLine } from 'lucide-react';
import { useStore } from '../../store/store';
import ProfileEditForm from './ProfileEditForm';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { currentMonitor } = useStore();

  if (isEditing) {
    return <ProfileEditForm onCancel={() => setIsEditing(false)} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="relative">
        <div className="h-32 bg-indigo-600 rounded-t-xl">
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
                  alt={currentMonitor.nombre}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-20 text-center">
            <h2 className="text-2xl font-bold text-gray-900">{currentMonitor?.nombre}</h2>
            <p className="text-indigo-600 font-medium">{currentMonitor?.especialidad}</p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="w-5 h-5" />
                <span>{currentMonitor?.email || 'No especificado'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{currentMonitor?.ubicacion || 'No especificada'}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
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
                <Briefcase className="w-5 h-5 text-indigo-600" />
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
                <GraduationCap className="w-5 h-5 text-indigo-600" />
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
                <Heart className="w-5 h-5 text-indigo-600" />
                <span className="font-medium">Habilidades</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentMonitor.habilidades.map((hab, index) => (
                  <span
                    key={index}
                    className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm"
                  >
                    {hab}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;