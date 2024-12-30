import React, { useState } from 'react';
import { useStore } from '../store/store';
import { Plus, Users, UserCog, ChevronDown, ChevronUp } from 'lucide-react';
import EvaluacionGrupoForm from '../components/EvaluacionGrupoForm';
import EvaluacionCamperForm from '../components/EvaluacionCamperForm';
import GrupoForm from '../components/grupos/GrupoForm';

const Grupos = () => {
  const { grupos, campers } = useStore();
  const [selectedGrupo, setSelectedGrupo] = useState<string | null>(null);
  const [selectedCamper, setSelectedCamper] = useState<string | null>(null);
  const [showGrupoEval, setShowGrupoEval] = useState(false);
  const [showCamperEval, setShowCamperEval] = useState(false);
  const [showNewGrupoForm, setShowNewGrupoForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Grupos de Campamento</h2>
        <button 
          onClick={() => setShowNewGrupoForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Grupo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {grupos.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            No hay grupos creados
          </div>
        ) : (
          grupos.map((grupo) => (
            <div key={grupo.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{grupo.nombre}</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Rango de edad:</span>
                    <span className="font-medium">
                      {grupo.edadMinima} - {grupo.edadMaxima} años
                    </span>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={18} className="text-indigo-600" />
                      <span className="font-medium">Acampados</span>
                    </div>
                    <div className="pl-6">
                      {grupo.acampados.length === 0 ? (
                        <p className="text-sm text-gray-500">Sin acampados asignados</p>
                      ) : (
                        <div className="space-y-2">
                          {grupo.acampados.map((acampadoId) => {
                            const camper = campers.find(c => c.id === acampadoId);
                            return (
                              <div key={acampadoId} className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">{camper?.nombre}</span>
                                <button
                                  onClick={() => {
                                    setSelectedCamper(acampadoId);
                                    setShowCamperEval(true);
                                  }}
                                  className="text-sm text-indigo-600 hover:text-indigo-800"
                                >
                                  Evaluar
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCog size={18} className="text-indigo-600" />
                      <span className="font-medium">Monitores</span>
                    </div>
                    <div className="pl-6">
                      {grupo.monitores.length === 0 ? (
                        <p className="text-sm text-gray-500">Sin monitores asignados</p>
                      ) : (
                        <p className="text-sm text-gray-600">
                          {grupo.monitores.length} monitores
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setSelectedGrupo(grupo.id);
                        setShowGrupoEval(true);
                      }}
                      className="w-full bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100"
                    >
                      Evaluar Grupo
                    </button>
                  </div>

                  {grupo.evaluaciones.length > 0 && (
                    <div className="pt-4">
                      <button
                        onClick={() => setSelectedGrupo(
                          selectedGrupo === grupo.id ? null : grupo.id
                        )}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        {selectedGrupo === grupo.id ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                        Ver Evaluaciones Anteriores
                      </button>

                      {selectedGrupo === grupo.id && (
                        <div className="mt-2 space-y-2">
                          {grupo.evaluaciones.map((evaluacion) => (
                            <div key={evaluacion.id} className="bg-gray-50 p-3 rounded-lg text-sm">
                              <div className="flex justify-between text-gray-600 mb-2">
                                <span>Fecha:</span>
                                <span>{new Date(evaluacion.fecha).toLocaleDateString()}</span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span>Participación:</span>
                                  <span>{evaluacion.participacion}/5</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Cooperación:</span>
                                  <span>{evaluacion.cooperacion}/5</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Comportamiento:</span>
                                  <span>{evaluacion.comportamiento}/5</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showGrupoEval && selectedGrupo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Evaluación del Grupo</h3>
            <EvaluacionGrupoForm
              grupoId={selectedGrupo}
              onSubmit={() => {
                setShowGrupoEval(false);
                setSelectedGrupo(null);
              }}
            />
          </div>
        </div>
      )}

      {showCamperEval && selectedCamper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Evaluación del Acampado</h3>
            <EvaluacionCamperForm
              camperId={selectedCamper}
              onSubmit={() => {
                setShowCamperEval(false);
                setSelectedCamper(null);
              }}
            />
          </div>
        </div>
      )}
      
      {showNewGrupoForm && (
        <GrupoForm onClose={() => setShowNewGrupoForm(false)} />
      )}
    </div>
  );
};

export default Grupos;