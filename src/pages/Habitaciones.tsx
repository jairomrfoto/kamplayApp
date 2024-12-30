import React from 'react';
import { useStore } from '../store/store';
import { Plus, Users, ClipboardCheck } from 'lucide-react';

const Habitaciones = () => {
  const { habitaciones } = useStore();

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
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Habitaciones</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
          <Plus size={20} />
          Nueva Habitación
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habitaciones.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            No hay habitaciones registradas
          </div>
        ) : (
          habitaciones.map((habitacion) => (
            <div key={habitacion.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Habitación {habitacion.numero}
                  </h3>
                  <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(habitacion.estado)}`}>
                    {habitacion.estado}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Capacidad:</span>
                    <span className="font-medium">{habitacion.capacidad} personas</span>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={18} className="text-indigo-600" />
                      <span className="font-medium">Ocupantes</span>
                    </div>
                    <div className="pl-6">
                      <p className="text-sm text-gray-600">
                        {habitacion.ocupantes.length} / {habitacion.capacidad} ocupantes
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
                        {new Date(habitacion.ultimaRevision).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Habitaciones;