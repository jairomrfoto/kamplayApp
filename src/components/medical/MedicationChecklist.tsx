import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/store';

interface Props {
  camperId: string;
}

const MedicationChecklist = ({ camperId }: Props) => {
  const { campers, currentMonitor, updateCamper } = useStore();
  const camper = campers.find(c => c.id === camperId);

  if (!camper?.infoMedica.medicacionProgramada) return null;

  const handleMedicationCheck = (medicationId: string) => {
    if (!camper || !currentMonitor) return;

    const updatedCamper = {
      ...camper,
      infoMedica: {
        ...camper.infoMedica,
        medicacionProgramada: camper.infoMedica.medicacionProgramada?.map(med => 
          med.id === medicationId ? {
            ...med,
            administrada: true,
            fechaAdministracion: new Date(),
            administradaPor: currentMonitor.id
          } : med
        )
      }
    };

    updateCamper(updatedCamper);
  };

  const isOverdue = (horario: string) => {
    const [hours, minutes] = horario.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes);
    return now > scheduledTime;
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-gray-900">Control de Medicación</h3>
      <div className="divide-y">
        {camper.infoMedica.medicacionProgramada.map((med) => (
          <div key={med.id} className="py-4 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{med.nombre}</span>
                <span className="text-sm text-gray-500">({med.dosis})</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Clock size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">{med.horario}</span>
                {!med.administrada && isOverdue(med.horario) && (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertCircle size={16} />
                    <span className="text-sm">Atrasada</span>
                  </div>
                )}
              </div>
            </div>
            
            {med.administrada ? (
              <div className="flex items-center gap-2 text-green-600">
                <Check size={20} />
                <div className="text-sm">
                  <p>Administrada</p>
                  <p className="text-gray-500">
                    {med.fechaAdministracion?.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleMedicationCheck(med.id)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Marcar como administrada
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicationChecklist;