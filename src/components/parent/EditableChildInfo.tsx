import React, { useState } from 'react';
import { Heart, Pill, AlertCircle, PencilLine, Plus, X, Lock, Camera, Upload } from 'lucide-react';
import type { Camper } from '../../types';
import MedicalInfoForm from './MedicalInfoForm';
import AdditionalInfoForm from './AdditionalInfoForm';
import PersonalInfoForm from './PersonalInfoForm';

interface Props {
  camper: Camper;
  onUpdate: (updatedCamper: Camper) => void;
}

const EditableChildInfo = ({ camper, onUpdate }: Props) => {
  const [editingMedical, setEditingMedical] = useState(false);
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingAdditional, setEditingAdditional] = useState(false);

  return (
    <div className="space-y-6">
      {/* Personal Info Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Información Personal</h2>
          {!editingPersonal && (
          <button
            onClick={() => setEditingPersonal(!editingPersonal)}
            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
          >
            {editingPersonal ? (
              <>
                <X size={18} />
                <span>Cancelar</span>
              </>
            ) : (
              <>
                <PencilLine size={18} />
                <span>Editar</span>
              </>
            )}
          </button>
          )}
        </div>

        {editingPersonal ? (
          <PersonalInfoForm
            camper={camper}
            onSave={(updatedInfo) => {
              onUpdate({ ...camper, ...updatedInfo });
              setEditingPersonal(false);
            }}
            onCancel={() => setEditingPersonal(false)}
          />
        ) : (
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              {camper.foto ? (
                <img
                  src={camper.foto}
                  alt={camper.nombre}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-lg">
                  <Camera className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Nombre</h3>
              <p className="mt-1 text-gray-900">{camper.nombre}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Edad</h3>
              <p className="mt-1 text-gray-900">{camper.edad} años</p>
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-500">Grupo</h3>
              <Lock size={14} className="text-gray-400" />
              <p className="mt-1 text-gray-900">{camper.grupo}</p>
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-500">Cabaña</h3>
              <Lock size={14} className="text-gray-400" />
              <p className="mt-1 text-gray-900">{camper.cabana}</p>
            </div>
          </div>
        )}
      </div>

      {/* Medical Info Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Información Médica</h2>
          <button
            onClick={() => setEditingMedical(!editingMedical)}
            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
          >
            {editingMedical ? (
              <>
                <X size={18} />
                <span>Cancelar</span>
              </>
            ) : (
              <>
                <PencilLine size={18} />
                <span>Editar</span>
              </>
            )}
          </button>
        </div>

        {editingMedical ? (
          <MedicalInfoForm
            camper={camper}
            onSave={(updatedInfo) => {
              onUpdate({ ...camper, infoMedica: updatedInfo });
              setEditingMedical(false);
            }}
            onCancel={() => setEditingMedical(false)}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-500 mt-1" size={20} />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Alergias</h3>
                {camper.infoMedica.alergias.length > 0 ? (
                  <ul className="mt-1 list-disc pl-5 text-gray-900">
                    {camper.infoMedica.alergias.map((alergia, index) => (
                      <li key={index}>{alergia}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-gray-500 italic">Sin alergias registradas</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Pill className="text-blue-500 mt-1" size={20} />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Medicación</h3>
                {camper.infoMedica.medicacion.length > 0 ? (
                  <ul className="mt-1 list-disc pl-5 text-gray-900">
                    {camper.infoMedica.medicacion.map((med, index) => (
                      <li key={index}>{med}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-gray-500 italic">Sin medicación registrada</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Heart className="text-purple-500 mt-1" size={20} />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Notas Médicas</h3>
                {camper.infoMedica.notas ? (
                  <p className="mt-1 text-gray-900">{camper.infoMedica.notas}</p>
                ) : (
                  <p className="mt-1 text-gray-500 italic">Sin notas adicionales</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Additional Info Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Información Adicional</h2>
          <button
            onClick={() => setEditingAdditional(!editingAdditional)}
            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
          >
            {editingAdditional ? (
              <>
                <X size={18} />
                <span>Cancelar</span>
              </>
            ) : (
              <>
                <PencilLine size={18} />
                <span>Editar</span>
              </>
            )}
          </button>
        </div>

        {editingAdditional ? (
          <AdditionalInfoForm
            camper={camper}
            onSave={(updatedInfo) => {
              onUpdate({ ...camper, infoAdicional: updatedInfo });
              setEditingAdditional(false);
            }}
            onCancel={() => setEditingAdditional(false)}
          />
        ) : (
          <div className="space-y-4">
            {/* Display additional info here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditableChildInfo;