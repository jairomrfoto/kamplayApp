import React, { useState, useCallback } from 'react';
import { Plus, Calendar } from 'lucide-react';
import MenuDiario from '../components/menu/MenuDiario';
import MenuForm from '../components/menu/MenuForm';
import { useStore } from '../store/store';
import { useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const Menu = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState<string | null>(null);
  const { menus } = useStore();
  const location = useLocation();
  const isCoordinator = location.pathname.includes('/coordinator-dashboard');

  const menuDelDia = menus.find(
    m => m.fecha.toDateString() === selectedDate.toDateString()
  );
  
  const handleEditMenu = useCallback(() => {
    if (menuDelDia) {
      setEditingMenu(menuDelDia.id);
    }
  }, [menuDelDia]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Menú del Campamento</h2>
        {isCoordinator && (
          <div className="flex gap-4">
            {menuDelDia && (
              <button
                onClick={handleEditMenu}
                className="bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50"
              >
                Editar Menú
              </button>
            )}
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Plus size={20} />
              Nuevo Menú
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
        <Calendar className="text-indigo-600" size={20} />
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date || new Date())}
          dateFormat="dd/MM/yyyy"
          className="border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {menuDelDia ? (
        <MenuDiario menu={menuDelDia} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-500">No hay menú programado para este día</p>
        </div>
      )}
      
      {showForm && (
        <MenuForm onClose={() => setShowForm(false)} />
      )}
      
      {editingMenu && menuDelDia && (
        <MenuForm
          menu={menuDelDia}
          onClose={() => setEditingMenu(null)}
        />
      )}
    </div>
  );
};

export default Menu;