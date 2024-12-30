import React, { useState } from 'react';
import { useStore } from '../store/store';
import { Plus, Heart, Pill, AlertCircle, Clock } from 'lucide-react';
import MedicalRecordForm from '../components/medical/MedicalRecordForm';
import MedicationChecklist from '../components/medical/MedicationChecklist';

const AreaMedica = () => {
  const { campers } = useStore();
  const [showForm, setShowForm] = useState(false);

  const campersConInfoMedica = campers.filter(
    camper => 
      camper.infoMedica.alergias.length > 0 || 
      camper.infoMedica.medicacion.length > 0 || 
      camper.infoMedica.notas
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Área Médica</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Registro Médico
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Registros Médicos</h3>
            
            {campersConInfoMedica.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay registros médicos
              </div>
            ) : (
              <div className="space-y-4">
                {campersConInfoMedica.map((camper) => (
                  <div key={camper.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">{camper.nombre}</h4>
                      <span className="text-sm text-gray-500">Grupo: {camper.grupo}</span>
                    </div>

                    {camper.infoMedica.alergias.length > 0 && (
                      <div className="flex items-start gap-2 mb-2">
                        <AlertCircle size={18} className="text-red-500 mt-1" />
                        <div>
                          <p className="text-sm font-medium">Alergias:</p>
                          <p className="text-sm text-gray-600">
                            {camper.infoMedica.alergias.join(', ')}
                          </p>
                        </div>
                      </div>
                    )}

                    {camper.infoMedica.medicacion.length > 0 && (
                      <div className="flex items-start gap-2 mb-2">
                        <Pill size={18} className="text-blue-500 mt-1" />
                        <div>
                          <p className="text-sm font-medium">Medicación:</p>
                          <p className="text-sm text-gray-600">
                            {camper.infoMedica.medicacion.join(', ')}
                          </p>
                        </div>
                      </div>
                    )}

                    {camper.infoMedica.notas && (
                      <div className="flex items-start gap-2">
                        <Heart size={18} className="text-purple-500 mt-1" />
                        <div>
                          <p className="text-sm font-medium">Notas:</p>
                          <p className="text-sm text-gray-600">{camper.infoMedica.notas}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Resumen</h3>
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-red-500" />
                  <span className="font-medium text-red-700">Alergias</span>
                </div>
                <p className="mt-1 text-sm text-red-600">
                  {campers.filter(c => c.infoMedica.alergias.length > 0).length} acampados
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Pill className="text-blue-500" />
                  <span className="font-medium text-blue-700">Medicación</span>
                </div>
                <p className="mt-1 text-sm text-blue-600">
                  {campers.filter(c => c.infoMedica.medicacion.length > 0).length} acampados
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Medication Checklists */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Control de Medicación</h3>
        <div className="space-y-6">
          {campersConInfoMedica.map((camper) => (
            camper.infoMedica.medicacionProgramada && (
              <div key={camper.id} className="border-t pt-4 first:border-t-0 first:pt-0">
                <h4 className="font-medium text-gray-900 mb-3">{camper.nombre}</h4>
                <MedicationChecklist camperId={camper.id} />
              </div>
            )
          ))}
        </div>
      </div>
      
      {showForm && (
        <MedicalRecordForm onClose={() => setShowForm(false)} />
      )}
      {campersConInfoMedica.map((camper) => (
        camper.infoMedica.medicacionProgramada && (
          <div key={camper.id} className="mt-4">
            <MedicationChecklist camperId={camper.id} />
          </div>
        )
      ))}
    </div>
  );
};

export default AreaMedica;