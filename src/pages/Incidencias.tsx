import React, { useState } from 'react';
import { useStore } from '../store/store';
import { Plus, Search, Filter, Clock, MessageCircle, History, AlertTriangle, Users } from 'lucide-react';
import IncidentForm from '../components/shared/IncidentForm';
import IncidentFollowUpForm from '../components/shared/IncidentFollowUpForm';

const Incidencias = () => {
  const { incidencias, campers, monitores } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [showFollowUpForm, setShowFollowUpForm] = useState<string | null>(null);
  const [filter, setFilter] = useState('todas');
  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [viewMode, setViewMode] = useState<'active' | 'history'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCamper, setSelectedCamper] = useState<string | null>(null);

  const getReporterName = (reporterId: string) => {
    const monitor = monitores.find(m => m.id === reporterId);
    return monitor ? monitor.nombre : 'Desconocido';
  };

  const getAcampadosNames = (acampadosIds: string[]) => {
    return acampadosIds
      .map(id => campers.find(c => c.id === id)?.nombre)
      .filter(Boolean)
      .join(', ');
  };

  const getStatusColor = (tipo: string) => {
    switch (tipo) {
      case 'leve':
        return 'bg-yellow-100 text-yellow-800';
      case 'moderada':
        return 'bg-orange-100 text-orange-800';
      case 'grave':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const capitalizeFirstLetter = (str: string | undefined) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getStateColor = (estado: string) => {
    switch (estado) {
      case 'resuelta':
        return 'bg-green-100 text-green-800';
      case 'en_proceso':
        return 'bg-blue-100 text-blue-800';
      case 'pendiente':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredIncidencias = incidencias.filter(inc => 
    (viewMode === 'active' ? inc.estado !== 'resuelta' : inc.estado === 'resuelta') &&
    (filter === 'todas' || inc.estado === filter) && 
    (categoryFilter === 'todas' || inc.categoria === categoryFilter) &&
    (selectedCamper === null || inc.acampadosAfectados.includes(selectedCamper)) &&
    (inc.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
     inc.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Registro de Incidencias</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          <Plus size={20} />
          Reportar Incidencia
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setViewMode('active')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              viewMode === 'active' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <AlertTriangle size={20} />
            <span>Incidencias Activas</span>
          </button>
          <button
            onClick={() => setViewMode('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              viewMode === 'history' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <History size={20} />
            <span>Historial</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar incidencias..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Users size={20} className="text-gray-500" />
            <select
              value={selectedCamper || ''}
              onChange={(e) => setSelectedCamper(e.target.value || null)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos los acampados</option>
              {campers.map(camper => (
                <option key={camper.id} value={camper.id}>
                  {camper.nombre}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="todas">Todas las categorías</option>
              <option value="medica">Médica</option>
              <option value="comportamiento">Comportamiento</option>
              <option value="seguridad">Seguridad</option>
              <option value="infraestructura">Infraestructura</option>
              <option value="otra">Otra</option>
            </select>
          </div>
          
          {viewMode === 'active' && (
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="todas">Todas</option>
              <option value="pendiente">Pendientes</option>
              <option value="en_proceso">En proceso</option>
              <option value="resuelta">Resueltas</option>
            </select>
          </div>
          )}
        </div>

        <div className="space-y-4">
          {filteredIncidencias.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay incidencias registradas
            </div>
          ) : (
            filteredIncidencias.map((incidencia) => (
              <div key={incidencia.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(incidencia.tipo)}`}>
                      {capitalizeFirstLetter(incidencia.tipo)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-sm bg-gray-100 text-gray-800`}>
                      {capitalizeFirstLetter(incidencia.categoria)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      incidencia.prioridad === 'urgente' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      Prioridad: {capitalizeFirstLetter(incidencia.prioridad)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-sm ${getStateColor(incidencia.estado)}`}>
                      {incidencia.estado === 'en_proceso' ? 'En proceso' : 
                        capitalizeFirstLetter(incidencia.estado)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock size={16} />
                    <span>{new Date(incidencia.fecha).toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-gray-900 mb-2">{incidencia.descripcion}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Ubicación: {incidencia.ubicacion}</span>
                  <span>Reportado por: {getReporterName(incidencia.reportadoPor)}</span>
                </div>
                {incidencia.acampadosAfectados.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Acampados afectados: </span>
                    {getAcampadosNames(incidencia.acampadosAfectados)}
                  </div>
                )}
                {incidencia.accionesTomadas && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Acciones tomadas: </span>
                    {incidencia.accionesTomadas}
                  </div>
                )}
                {incidencia.seguimiento && incidencia.seguimiento.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Seguimiento:</h4>
                    <div className="space-y-2">
                      {incidencia.seguimiento.map((seg, index) => (
                        <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                          <div className="flex justify-between text-gray-500 mb-1">
                            <span>{new Date(seg.fecha).toLocaleString()}</span>
                            <span>{getReporterName(seg.realizadoPor)}</span>
                          </div>
                          <p className="text-gray-700">{seg.comentario}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setShowFollowUpForm(incidencia.id)}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700"
                  >
                    <MessageCircle size={18} />
                    <span>Añadir seguimiento</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showForm && (
        <IncidentForm onClose={() => setShowForm(false)} />
      )}

      {showFollowUpForm && (
        <IncidentFollowUpForm
          incidentId={showFollowUpForm}
          onClose={() => setShowFollowUpForm(null)}
        />
      )}
    </div>
  );
};

export default Incidencias;