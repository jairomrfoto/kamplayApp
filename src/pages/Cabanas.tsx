import React, { useState } from 'react';
import { useStore } from '../store/store';
import { Plus, Users, ClipboardCheck, UserCog, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import CabanaForm from '../components/cabanas/CabanaForm';
import CabinNoteForm from '../components/cabanas/CabinNoteForm';

const Cabanas = () => {
  const { cabanas, monitores } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingCabana, setEditingCabana] = useState<string | null>(null);
  const [addingNote, setAddingNote] = useState<string | null>(null);
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);

  const cabanaToEdit = editingCabana ? cabanas.find(c => c.id === editingCabana) : null;

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Limpia':
        return 'bg-green-100 text-green-800';
      case 'Necesita Revisión':
        return 'bg-yellow-100 text-yellow-800';
      case 'En Mantenimiento':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Cabañas</h2>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Cabaña
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cabanas.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            No hay cabañas registradas
          </div>
        ) : (
          cabanas.map((cabana) => {
            const monitorEncargado = monitores.find(m => m.id === cabana.monitorEncargado);
            
            return (
              <div 
                key={cabana.id} 
                className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setEditingCabana(cabana.id)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Cabaña {cabana.numero}
                    </h3>
                    <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(cabana.estado)}`}>
                      {cabana.estado}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Capacidad:</span>
                      <span className="font-medium">{cabana.capacidad} personas</span>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <UserCog size={18} className="text-indigo-600" />
                        <span className="font-medium">Monitor Encargado</span>
                      </div>
                      <div className="pl-6">
                        {monitorEncargado ? (
                          <div className="text-sm text-gray-600">
                            <p className="font-medium">{monitorEncargado.nombre}</p>
                            <p className="text-gray-500">{monitorEncargado.especialidad}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Sin monitor asignado</p>
                        )}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users size={18} className="text-indigo-600" />
                        <span className="font-medium">Ocupantes</span>
                      </div>
                      <div className="pl-6">
                        <p className="text-sm text-gray-600">
                          {cabana.ocupantes.length} / {cabana.capacidad} ocupantes
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ClipboardCheck size={18} className="text-indigo-600" />
                        <span className="font-medium">Última Revisión</span>
                      </div>
                      <div className="pl-6">
                        <p className="text-sm text-gray-600">
                          {new Date(cabana.ultimaRevision).toLocaleDateString('es-ES')}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddingNote(cabana.id);
                          }}
                          className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                        >
                          <Plus size={16} />
                          Añadir nota
                        </button>
                      </div>
                    </div>
                    
                    {cabana.notas && cabana.notas.length > 0 && (
                      <div className="border-t pt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedNotes(expandedNotes === cabana.id ? null : cabana.id);
                          }}
                          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                        >
                          <FileText size={18} />
                          <span className="font-medium">Notas de Limpieza</span>
                          {expandedNotes === cabana.id ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                        
                        {expandedNotes === cabana.id && (
                          <div className="mt-2 space-y-2">
                            {cabana.notas.map((nota) => {
                              const monitor = monitores.find(m => m.id === nota.monitor);
                              return (
                                <div key={nota.id} className="bg-gray-50 p-3 rounded-lg">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">
                                      {new Date(nota.fecha).toLocaleDateString()}
                                    </span>
                                    <span className={`font-medium ${
                                      nota.estadoLimpieza === 'Excelente' ? 'text-green-600' :
                                      nota.estadoLimpieza === 'Bueno' ? 'text-blue-600' :
                                      nota.estadoLimpieza === 'Regular' ? 'text-yellow-600' :
                                      'text-red-600'
                                    }`}>
                                      {nota.estadoLimpieza}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">{nota.observaciones}</p>
                                  {monitor && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Por: {monitor.nombre}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {showForm && (
        <CabanaForm onClose={() => setShowForm(false)} />
      )}
      
      {editingCabana && cabanaToEdit && (
        <CabanaForm
          cabana={cabanaToEdit}
          onClose={() => setEditingCabana(null)}
        />
      )}
      
      {addingNote && (
        <CabinNoteForm
          cabanaId={addingNote}
          onClose={() => setAddingNote(null)}
        />
      )}
    </div>
  );
};

export default Cabanas;