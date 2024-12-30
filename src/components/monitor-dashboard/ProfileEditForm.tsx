import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { useStore } from '../../store/store';
import type { Monitor } from '../../types';

interface Props {
  onCancel: () => void;
}

const ProfileEditForm = ({ onCancel }: Props) => {
  const { currentMonitor, updateMonitor } = useStore();
  const [formData, setFormData] = useState({
    ...currentMonitor,
    experiencia: [...(currentMonitor?.experiencia || [])],
    certificaciones: [...(currentMonitor?.certificaciones || [])]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMonitor(formData as Monitor);
    onCancel();
  };

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

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Editar Perfil</h2>
        <button type="button" onClick={onCancel}>
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Foto de Perfil
          </label>
          <div className="flex items-center gap-4">
            {formData.foto ? (
              <img
                src={formData.foto}
                alt="Preview"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="text-sm text-gray-600"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setFormData(prev => ({
                      ...prev,
                      foto: reader.result as string
                    }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email de Contacto
          </label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ubicación
          </label>
          <input
            type="text"
            value={formData.ubicacion || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, ubicacion: e.target.value }))}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
              className="text-sm text-indigo-600 hover:text-indigo-700"
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
                    const newExp = [...(formData.experiencia || [])];
                    newExp[index] = { ...exp, campamento: e.target.value };
                    setFormData(prev => ({ ...prev, experiencia: newExp }));
                  }}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Periodo"
                    value={exp.periodo}
                    onChange={(e) => {
                      const newExp = [...(formData.experiencia || [])];
                      newExp[index] = { ...exp, periodo: e.target.value };
                      setFormData(prev => ({ ...prev, experiencia: newExp }));
                    }}
                    className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Rol"
                    value={exp.rol}
                    onChange={(e) => {
                      const newExp = [...(formData.experiencia || [])];
                      newExp[index] = { ...exp, rol: e.target.value };
                      setFormData(prev => ({ ...prev, experiencia: newExp }));
                    }}
                    className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
              className="text-sm text-indigo-600 hover:text-indigo-700"
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
                    const newCert = [...(formData.certificaciones || [])];
                    newCert[index] = { ...cert, nombre: e.target.value };
                    setFormData(prev => ({ ...prev, certificaciones: newCert }));
                  }}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Emisor"
                    value={cert.emisor}
                    onChange={(e) => {
                      const newCert = [...(formData.certificaciones || [])];
                      newCert[index] = { ...cert, emisor: e.target.value };
                      setFormData(prev => ({ ...prev, certificaciones: newCert }));
                    }}
                    className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Fecha"
                    value={cert.fecha}
                    onChange={(e) => {
                      const newCert = [...(formData.certificaciones || [])];
                      newCert[index] = { ...cert, fecha: e.target.value };
                      setFormData(prev => ({ ...prev, certificaciones: newCert }));
                    }}
                    className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Guardar Cambios
        </button>
      </div>
    </form>
  );
};

export default ProfileEditForm;