import React, { useState } from 'react';
import { useStore } from '../store/store';
import { Users, Tent, Package, AlertTriangle, Clock } from 'lucide-react';
import HorarioDiario from '../components/HorarioDiario';
import IncidentForm from '../components/shared/IncidentForm';

const Dashboard = () => {
  const { campers, monitores, materiales, incidencias } = useStore();
  const [showIncidentForm, setShowIncidentForm] = useState(false);

  const pendingIncidents = incidencias.filter(inc => inc.estado === 'pendiente');

  const stats = [
    {
      title: "Total Acampados",
      value: campers.length,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Monitores Activos",
      value: monitores.length,
      icon: Tent,
      color: "bg-green-500",
    },
    {
      title: "Material Disponible",
      value: materiales.filter(m => m.estado === 'Disponible').length,
      icon: Package,
      color: "bg-purple-500",
    },
    {
      title: "Incidencias Pendientes",
      value: pendingIncidents.length.toString(),
      icon: AlertTriangle,
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Panel de Control</h2>
        <button
          onClick={() => setShowIncidentForm(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          <AlertTriangle size={20} />
          Reportar Incidencia
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HorarioDiario fecha={new Date()} />

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Estado de Habitaciones</h3>
          <div className="space-y-4">
            <p className="text-gray-600">No hay revisiones pendientes</p>
          </div>
        </div>
      </div>
      
      {showIncidentForm && (
        <IncidentForm onClose={() => setShowIncidentForm(false)} />
      )}
    </div>
  );
}

export default Dashboard;