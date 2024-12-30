import React from 'react';
import { Calendar, MapPin, Users, Award, Activity, Package, HeartPulse } from 'lucide-react';
import Actividades from '../../pages/Actividades';
import Acampados from '../../pages/Acampados';
import Materiales from '../../pages/Materiales';
import AreaMedica from '../../pages/AreaMedica';

interface Props {
  camp: any; // Replace with proper type
  onClose: () => void;
}

const CampHistoryDetails = ({ camp, onClose }: Props) => {
  const [activeTab, setActiveTab] = React.useState('overview');

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: Activity },
    { id: 'activities', label: 'Actividades', icon: Calendar },
    { id: 'campers', label: 'Acampados', icon: Users },
    { id: 'materials', label: 'Materiales', icon: Package },
    { id: 'medical', label: 'Área Médica', icon: HeartPulse },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 rounded-xl p-6">
                <h4 className="font-medium mb-2">Estadísticas</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Participantes:</span>
                    <span className="font-medium">{camp.estadisticas.participantes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Actividades:</span>
                    <span className="font-medium">{camp.estadisticas.actividades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Días totales:</span>
                    <span className="font-medium">{camp.estadisticas.diasTotales}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Satisfacción:</span>
                    <span className="font-medium">{camp.estadisticas.satisfaccion}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-6">
                <h4 className="font-medium mb-2">Logros</h4>
                <ul className="space-y-2">
                  {camp.logros.map((logro: string, index: number) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-green-500">•</span>
                      {logro}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-yellow-50 rounded-xl p-6">
                <h4 className="font-medium mb-2">Incidencias</h4>
                <ul className="space-y-2">
                  {camp.incidencias.map((incidencia: string, index: number) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <span className="text-yellow-500">•</span>
                      {incidencia}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6">
              <h4 className="font-medium mb-4">Momentos Destacados</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {camp.momentosDestacados.map((momento: string, index: number) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-indigo-600 text-lg mb-2">#{index + 1}</span>
                    <p className="text-gray-700">{momento}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'activities':
        return <Actividades />;
      case 'campers':
        return <Acampados />;
      case 'materials':
        return <Materiales />;
      case 'medical':
        return <AreaMedica />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-7xl m-4 rounded-xl">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{camp.nombre}</h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(camp.fechaInicio).toLocaleDateString()} - {new Date(camp.fechaFin).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{camp.ubicacion}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{camp.estadisticas.participantes} participantes</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="flex space-x-4 mt-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default CampHistoryDetails;