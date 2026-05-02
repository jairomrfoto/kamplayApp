import React, { useState } from 'react';
import { Camera, Upload, Mail, MapPin, PencilLine, X, Calendar, Award, GraduationCap, UserCircle, Tent, School, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/store';
import { useAuth } from '../../hooks/useAuth';
import type { Camp, CampCoordinator } from '../../types/camp';
import ChangePassword from '../ChangePassword';
import SubscriptionBanner from '../stripe/SubscriptionBanner';
import { useUserProfile } from '../../hooks/useUserProfile';
import ArchiveCampModal from '../camps/ArchiveCampModal';

const CoordinatorProfile = () => {
  const { currentCoordinator, updateCoordinator, userCamps, removeCampFromUser, switchCampFn } = useStore();
  const { profile: userProfile } = useUserProfile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [archivingCamp, setArchivingCamp] = useState<Camp | null>(null);

  const activeCamps = userCamps.filter(c => c.status !== 'archived');
  const [formData, setFormData] = useState({
    name: currentCoordinator?.name ?? user?.displayName ?? '',
    email: currentCoordinator?.email ?? user?.email ?? '',
    location: currentCoordinator?.location ?? '',
    photo: currentCoordinator?.photo ?? '',
    experiencia: currentCoordinator?.experiencia ?? [],
    certificaciones: currentCoordinator?.certificaciones ?? [],
    formacion: currentCoordinator?.formacion ?? [],
  });

  // Fallback values from Firebase Auth
  const displayName  = currentCoordinator?.name  || user?.displayName || user?.email?.split('@')[0] || '';
  const displayEmail = currentCoordinator?.email || user?.email || '';

  const addExperiencia = () => {
    setFormData(prev => ({
      ...prev,
      experiencia: [
        ...(prev.experiencia || []),
        { campamento: '', periodo: '', rol: '' }
      ]
    }));
  };

  const addCertificacion = () => {
    setFormData(prev => ({
      ...prev,
      certificaciones: [
        ...(prev.certificaciones || []),
        { nombre: '', emisor: '', fecha: '' }
      ]
    }));
  };

  const addFormacion = () => {
    setFormData(prev => ({
      ...prev,
      formacion: [
        ...(prev.formacion || []),
        { titulo: '', institucion: '', año: '' }
      ]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCoordinator) return;
    
    const updatedCoordinator: CampCoordinator = {
      ...currentCoordinator,
      name: formData.name,
      email: formData.email,
      location: formData.location,
      photo: formData.photo,
      experiencia: formData.experiencia,
      certificaciones: formData.certificaciones,
      formacion: formData.formacion
    };

    updateCoordinator(updatedCoordinator);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {userProfile && (
        <div className="space-y-3">
          <SubscriptionBanner profile={userProfile} />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="h-32 bg-orange-500" />

        <div className="px-6 pb-6">
          <div className="relative flex justify-center">
            <div className="absolute -top-16">
              {isEditing ? (
                <div className="relative">
                  {formData.photo ? (
                    <img
                      src={formData.photo}
                      alt={formData.name}
                      className="w-32 h-32 rounded-full border-4 border-white object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 p-2 bg-orange-500 rounded-full text-white cursor-pointer hover:bg-orange-600">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData(prev => ({
                              ...prev,
                              photo: reader.result as string
                            }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <Upload size={16} />
                  </label>
                </div>
              ) : (
                currentCoordinator?.photo ? (
                  <img
                    src={currentCoordinator.photo}
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
                )
              )}
            </div>
          </div>

          <div className="mt-20">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-400"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Experiencia
                    </label>
                    <button
                      type="button"
                      onClick={addExperiencia}
                      className="text-sm text-orange-600 hover:text-orange-700"
                    >
                      Añadir Experiencia
                    </button>
                  </div>
                  <div className="space-y-4">
                    {formData.experiencia?.map((exp, index) => (
                      <div key={index} className="space-y-2">
                        <input
                          type="text"
                          placeholder="Nombre del campamento"
                          value={exp.campamento}
                          onChange={(e) => {
                            const newExp = [...formData.experiencia];
                            newExp[index] = { ...exp, campamento: e.target.value };
                            setFormData(prev => ({ ...prev, experiencia: newExp }));
                          }}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-400"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Periodo"
                            value={exp.periodo}
                            onChange={(e) => {
                              const newExp = [...formData.experiencia];
                              newExp[index] = { ...exp, periodo: e.target.value };
                              setFormData(prev => ({ ...prev, experiencia: newExp }));
                            }}
                            className="rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-400"
                          />
                          <input
                            type="text"
                            placeholder="Rol"
                            value={exp.rol}
                            onChange={(e) => {
                              const newExp = [...formData.experiencia];
                              newExp[index] = { ...exp, rol: e.target.value };
                              setFormData(prev => ({ ...prev, experiencia: newExp }));
                            }}
                            className="rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Certificaciones
                    </label>
                    <button
                      type="button"
                      onClick={addCertificacion}
                      className="text-sm text-orange-600 hover:text-orange-700"
                    >
                      Añadir Certificación
                    </button>
                  </div>
                  <div className="space-y-4">
                    {formData.certificaciones?.map((cert, index) => (
                      <div key={index} className="space-y-2">
                        <input
                          type="text"
                          placeholder="Nombre de la certificación"
                          value={cert.nombre}
                          onChange={(e) => {
                            const newCert = [...formData.certificaciones];
                            newCert[index] = { ...cert, nombre: e.target.value };
                            setFormData(prev => ({ ...prev, certificaciones: newCert }));
                          }}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-400"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Emisor"
                            value={cert.emisor}
                            onChange={(e) => {
                              const newCert = [...formData.certificaciones];
                              newCert[index] = { ...cert, emisor: e.target.value };
                              setFormData(prev => ({ ...prev, certificaciones: newCert }));
                            }}
                            className="rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-400"
                          />
                          <input
                            type="text"
                            placeholder="Fecha"
                            value={cert.fecha}
                            onChange={(e) => {
                              const newCert = [...formData.certificaciones];
                              newCert[index] = { ...cert, fecha: e.target.value };
                              setFormData(prev => ({ ...prev, certificaciones: newCert }));
                            }}
                            className="rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Formación
                    </label>
                    <button
                      type="button"
                      onClick={addFormacion}
                      className="text-sm text-orange-600 hover:text-orange-700"
                    >
                      Añadir Formación
                    </button>
                  </div>
                  <div className="space-y-4">
                    {formData.formacion?.map((form, index) => (
                      <div key={index} className="space-y-2">
                        <input
                          type="text"
                          placeholder="Título"
                          value={form.titulo}
                          onChange={(e) => {
                            const newForm = [...formData.formacion];
                            newForm[index] = { ...form, titulo: e.target.value };
                            setFormData(prev => ({ ...prev, formacion: newForm }));
                          }}
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-400"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Institución"
                            value={form.institucion}
                            onChange={(e) => {
                              const newForm = [...formData.formacion];
                              newForm[index] = { ...form, institucion: e.target.value };
                              setFormData(prev => ({ ...prev, formacion: newForm }));
                            }}
                            className="rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-400"
                          />
                          <input
                            type="text"
                            placeholder="Año"
                            value={form.año}
                            onChange={(e) => {
                              const newForm = [...formData.formacion];
                              newForm[index] = { ...form, año: e.target.value };
                              setFormData(prev => ({ ...prev, formacion: newForm }));
                            }}
                            className="rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    <X size={18} />
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                  >
                    <PencilLine size={18} />
                    Guardar Cambios
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {displayName || '—'}
                </h2>
                <p className="text-orange-600 font-medium">Coordinador Principal</p>

                <div className="flex justify-center gap-6 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    <span>{displayEmail}</span>
                  </div>
                  {currentCoordinator?.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span>{currentCoordinator.location}</span>
                    </div>
                  )}
                </div>
                
                
                {currentCoordinator?.experiencia && currentCoordinator.experiencia.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Experiencia</h3>
                    <div className="space-y-4">
                      {currentCoordinator.experiencia.map((exp, index) => (
                        <div key={index} className="flex gap-3">
                          <Calendar className="w-5 h-5 text-orange-600 flex-shrink-0" />
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

                {currentCoordinator?.certificaciones && currentCoordinator.certificaciones.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificaciones</h3>
                    <div className="space-y-4">
                      {currentCoordinator.certificaciones.map((cert, index) => (
                        <div key={index} className="flex gap-3">
                          <Award className="w-5 h-5 text-orange-600 flex-shrink-0" />
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

                {currentCoordinator?.formacion && currentCoordinator.formacion.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Formación</h3>
                    <div className="space-y-4">
                      {currentCoordinator.formacion.map((form, index) => (
                        <div key={index} className="flex gap-3">
                          <GraduationCap className="w-5 h-5 text-orange-600 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-gray-900">{form.titulo}</p>
                            <p className="text-sm text-gray-600">{form.institucion}</p>
                            <p className="text-sm text-gray-600">{form.año}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <PencilLine size={18} />
                    <span>Editar Perfil</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mis programas */}
      {activeCamps.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">Mis programas</h3>
          <div className="space-y-3">
            {activeCamps.map(camp => {
              const isCampus = camp.type === 'campus';
              const isOwner = camp.mainCoordinator === user?.uid;
              return (
                <div key={camp.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isCampus ? 'bg-blue-100' : 'bg-orange-100'}`}>
                    {isCampus
                      ? <School size={18} className="text-blue-600" />
                      : <Tent size={18} className="text-orange-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{camp.name}</p>
                    <p className="text-xs text-gray-500">{isCampus ? 'Campus' : 'Campamento'}{camp.location ? ` · ${camp.location}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => { switchCampFn?.(camp.id); navigate('/coordinator-dashboard'); }}
                      className="text-xs text-orange-600 hover:text-orange-700 font-medium px-2 py-1 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      Gestionar
                    </button>
                    {isOwner && (
                      <button
                        onClick={() => setArchivingCamp(camp)}
                        title="Archivar programa"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ChangePassword />

      {archivingCamp && (
        <ArchiveCampModal
          camp={archivingCamp}
          onCancel={() => setArchivingCamp(null)}
          onConfirmed={() => {
            removeCampFromUser(archivingCamp.id);
            setArchivingCamp(null);
          }}
        />
      )}
    </div>
  );
};

export default CoordinatorProfile;