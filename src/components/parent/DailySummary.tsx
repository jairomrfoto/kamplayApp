import React from 'react';
import { Calendar, UtensilsCrossed, PlayCircle } from 'lucide-react';
import { useStore } from '../../store/store';

const DailySummary = () => {
  const { actividades, menus } = useStore();
  const today = new Date();
  
  const todayActivities = actividades.filter(
    act => act.inicio.toDateString() === today.toDateString()
  );
  
  const todayMenu = menus.find(
    menu => menu.fecha.toDateString() === today.toDateString()
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Resumen del {today.toLocaleDateString('es-ES', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        })}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Actividades del día */}
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <PlayCircle className="text-indigo-600" size={20} />
            <h3 className="font-medium text-gray-900">Actividades</h3>
          </div>
          {todayActivities.length > 0 ? (
            <ul className="space-y-2">
              {todayActivities.slice(0, 3).map(activity => (
                <li key={activity.id} className="text-sm">
                  <span className="font-medium">{activity.titulo}</span>
                  <div className="text-gray-600">
                    {activity.inicio.toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </li>
              ))}
              {todayActivities.length > 3 && (
                <li className="text-sm text-indigo-600">
                  +{todayActivities.length - 3} más...
                </li>
              )}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">No hay actividades programadas</p>
          )}
        </div>

        {/* Horario */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="text-green-600" size={20} />
            <h3 className="font-medium text-gray-900">Horario</h3>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span className="text-gray-600">Desayuno</span>
              <span className="font-medium">8:30</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Almuerzo</span>
              <span className="font-medium">14:00</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Merienda</span>
              <span className="font-medium">17:30</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-600">Cena</span>
              <span className="font-medium">21:00</span>
            </li>
          </ul>
        </div>

        {/* Menú destacado */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <UtensilsCrossed className="text-yellow-600" size={20} />
            <h3 className="font-medium text-gray-900">Menú Destacado</h3>
          </div>
          {todayMenu ? (
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Almuerzo: </span>
                <span className="text-gray-600">{todayMenu.comidas.almuerzo.segundoPlato}</span>
              </p>
              <p>
                <span className="font-medium">Cena: </span>
                <span className="text-gray-600">{todayMenu.comidas.cena.segundoPlato}</span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Menú no disponible</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailySummary;