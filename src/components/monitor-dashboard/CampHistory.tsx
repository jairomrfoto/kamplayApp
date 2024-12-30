import React, { useState } from 'react';
import { Calendar, MapPin, Users, Award, ChevronDown, ChevronUp, Activity } from 'lucide-react';
import { useStore } from '../../store/store';
import CampHistoryDetails from './CampHistoryDetails';

const CampHistory = () => {
  const { currentMonitor } = useStore();
  const [expandedCamp, setExpandedCamp] = useState<string | null>(null);
  const [selectedCamp, setSelectedCamp] = useState<any | null>(null);

  // This would come from your store in a real implementation
  const campHistory = [
    {
      id: '1',
      nombre: 'Campamento Verano 2023',
      fechaInicio: '2023-07-01',
      fechaFin: '2023-07-15',
      rol: 'Monitor Principal',
      ubicacion: 'Sierra de Gredos',
      actividades: ['Senderismo', 'Talleres de Arte', 'Deportes de Equipo'],
      grupos: ['Grupo Águilas', 'Grupo Lobos'],
      logros: [
        'Organización exitosa de la olimpiada del campamento',
        'Desarrollo de nuevo programa de actividades nocturnas',
        'Mejora en la integración de participantes nuevos'
      ],
      incidencias: [
        'Tormenta eléctrica - Actividades adaptadas al interior',
        'Lesión leve durante actividad deportiva - Atendida correctamente'
      ],
      evaluacion: {
        puntuacion: 4.8,
        comentarios: 'Excelente desempeño y gran capacidad de liderazgo'
      },
      estadisticas: {
        participantes: 45,
        actividades: 24,
        diasTotales: 15,
        satisfaccion: 95
      },
      momentosDestacados: [
        'Festival de talentos',
        'Excursión a la cascada',
        'Noche de astronomía'
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Historial de Campamentos</h2>
        <div className="text-sm text-gray-500">
          Total: {campHistory.length} campamento(s)
        </div>
      </div>

      <div className="space-y-6">
        {campHistory.map((camp) => (
          <div key={camp.id} className="bg-white border rounded-xl p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-800">{camp.nombre}</h3>
                <span className="text-sm px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                  {camp.rol}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm">
                    {new Date(camp.fechaInicio).toLocaleDateString()} - {new Date(camp.fechaFin).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span className="text-sm">{camp.ubicacion}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-5 h-5" />
                  <span className="text-sm">{camp.estadisticas.participantes} participantes</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <button
                  onClick={() => setSelectedCamp(camp)}
                  className="flex items-center gap-2 w-full text-left"
                >
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-medium flex-1">Ver Detalles Completos</h4>
                </button>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-medium">Evaluación</h4>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-semibold">{camp.evaluacion.puntuacion}/5.0</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-${
                            i < Math.floor(camp.evaluacion.puntuacion)
                              ? 'yellow'
                              : 'gray'
                          }-400`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600">{camp.evaluacion.comentarios}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedCamp && (
        <CampHistoryDetails
          camp={selectedCamp}
          onClose={() => setSelectedCamp(null)}
        />
      )}
    </div>
  );
};

export default CampHistory;