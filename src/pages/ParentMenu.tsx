import React from 'react';
import { useStore } from '../store/store';
import MenuDiario from '../components/menu/MenuDiario';

const ParentMenu = () => {
  const { menus } = useStore();
  const todayMenu = menus.find(m => m.fecha.toDateString() === new Date().toDateString());

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Menú del Campamento</h2>
      {todayMenu ? (
        <MenuDiario menu={todayMenu} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-500">No hay menú disponible para hoy</p>
        </div>
      )}
    </div>
  );
};

export default ParentMenu;