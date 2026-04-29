import React, { useState } from 'react';
import { useStore } from '../store/store';
import { AlertTriangle, Upload } from 'lucide-react';
import HorarioDiario from '../components/HorarioDiario';
import IncidentForm from '../components/shared/IncidentForm';
import DocumentImportModal from '../components/DocumentImport/DocumentImportModal';

const Dashboard = () => {
  const { campers, monitores, materiales, incidencias, currentCamp } = useStore();
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const isCampus = currentCamp?.type === 'campus';
  const pendingIncidents = incidencias.filter(inc => inc.estado === 'pendiente');

  const stats = [
    {
      emoji: isCampus ? '🧑‍🎓' : '👦',
      title: isCampus ? 'Participantes' : 'Acampados',
      value: campers.length,
      bg: 'bg-orange-50',
      border: 'border-orange-100',
      text: 'text-orange-600',
      valueText: 'text-orange-700',
    },
    {
      emoji: '⭐',
      title: 'Monitores',
      value: monitores.length,
      bg: 'bg-green-50',
      border: 'border-green-100',
      text: 'text-green-600',
      valueText: 'text-green-700',
    },
    {
      emoji: '📦',
      title: 'Material disponible',
      value: materiales.filter(m => m.estado === 'Disponible').length,
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      text: 'text-amber-600',
      valueText: 'text-amber-700',
    },
    {
      emoji: '⚠️',
      title: 'Incidencias pendientes',
      value: pendingIncidents.length,
      bg: pendingIncidents.length > 0 ? 'bg-red-50' : 'bg-stone-50',
      border: pendingIncidents.length > 0 ? 'border-red-100' : 'border-stone-100',
      text: pendingIncidents.length > 0 ? 'text-red-500' : 'text-stone-400',
      valueText: pendingIncidents.length > 0 ? 'text-red-600' : 'text-stone-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800">
            {isCampus ? 'Panel de control 🏫' : 'Panel de control 🏕️'}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {isCampus ? 'Resumen de hoy en tu campus' : 'Resumen de hoy en tu campamento'}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex-1 sm:flex-none shadow-sm"
          >
            <Upload size={16} />
            Importar documento
          </button>
          <button
            onClick={() => setShowIncidentForm(true)}
            className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 active:scale-95 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex-1 sm:flex-none shadow-sm"
          >
            <AlertTriangle size={16} />
            Reportar incidencia
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.title} className={`${stat.bg} border ${stat.border} rounded-2xl p-4 sm:p-5`}>
            <div className="text-3xl mb-2">{stat.emoji}</div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${stat.text} mb-1`}>{stat.title}</p>
            <p className={`text-3xl font-extrabold ${stat.valueText}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HorarioDiario fecha={new Date()} />

        {!isCampus && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
            <h3 className="text-base font-bold text-gray-800 mb-4">🏠 Estado de habitaciones</h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">No hay revisiones pendientes</p>
            </div>
          </div>
        )}
      </div>

      {showIncidentForm && (
        <IncidentForm onClose={() => setShowIncidentForm(false)} />
      )}

      {showImport && (
        <DocumentImportModal onClose={() => setShowImport(false)} />
      )}
    </div>
  );
};

export default Dashboard;
