import React from 'react';
import { Clock } from 'lucide-react';
import type { MenuItem } from '../../types';

interface Props {
  menu: MenuItem;
}

const MenuDiario = ({ menu }: Props) => {
  const formatTime = (time: string) => {
    switch (time) {
      case 'desayuno':
        return '8:30';
      case 'almuerzo':
        return '14:00';
      case 'merienda':
        return '17:30';
      case 'cena':
        return '21:00';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Menú del {menu.fecha.toLocaleDateString('es-ES', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        })}
      </h2>

      <div className="space-y-6">
        {/* Desayuno */}
        <div className="border-b pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className="text-indigo-600" />
            <span className="font-medium">{formatTime('desayuno')} - Desayuno</span>
          </div>
          <ul className="pl-6 space-y-1">
            {menu.comidas.desayuno.map((item, index) => (
              <li key={index} className="text-gray-600">• {item}</li>
            ))}
          </ul>
        </div>

        {/* Almuerzo */}
        <div className="border-b pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className="text-indigo-600" />
            <span className="font-medium">{formatTime('almuerzo')} - Almuerzo</span>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-medium">Primer plato:</span> {menu.comidas.almuerzo.primerPlato}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Segundo plato:</span> {menu.comidas.almuerzo.segundoPlato}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Postre:</span> {menu.comidas.almuerzo.postre}
            </p>
          </div>
        </div>

        {/* Merienda */}
        <div className="border-b pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className="text-indigo-600" />
            <span className="font-medium">{formatTime('merienda')} - Merienda</span>
          </div>
          <ul className="pl-6 space-y-1">
            {menu.comidas.merienda.map((item, index) => (
              <li key={index} className="text-gray-600">• {item}</li>
            ))}
          </ul>
        </div>

        {/* Cena */}
        <div className="pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={18} className="text-indigo-600" />
            <span className="font-medium">{formatTime('cena')} - Cena</span>
          </div>
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-medium">Primer plato:</span> {menu.comidas.cena.primerPlato}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Segundo plato:</span> {menu.comidas.cena.segundoPlato}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Postre:</span> {menu.comidas.cena.postre}
            </p>
          </div>
        </div>

        {menu.alergenos && (
          <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-2">Alérgenos presentes:</h3>
            <p className="text-yellow-700">{menu.alergenos.join(', ')}</p>
          </div>
        )}

        {menu.observaciones && (
          <div className="mt-4 text-sm text-gray-600">
            <p className="font-medium">Observaciones:</p>
            <p>{menu.observaciones}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuDiario;