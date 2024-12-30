import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { Tent, LogOut, User, Calendar, UtensilsCrossed } from 'lucide-react';
import JoinCampButton from '../components/parent/JoinCampButton';
import EditableChildInfo from '../components/parent/EditableChildInfo';
import ActivityCalendar from '../components/parent/ActivityCalendar';
import MenuDiario from '../components/menu/MenuDiario';
import DailySummary from '../components/parent/DailySummary';
import ChildSelector from '../components/parent/ChildSelector';
import AddChildForm from '../components/parent/AddChildForm';
import type { Camper } from '../types';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { campers, updateCamper, menus, addCamper } = useStore();
  const [selectedContent, setSelectedContent] = React.useState<'info' | 'calendar' | 'menu' | null>(null);
  const [selectedChild, setSelectedChild] = React.useState<Camper | null>(campers[0] || null);
  const [showAddChildForm, setShowAddChildForm] = React.useState(false);
  const todayMenu = menus.find(m => m.fecha.toDateString() === new Date().toDateString());

  const handleAddChild = (childData: Omit<Camper, 'id'>) => {
    const newChild = {
      id: crypto.randomUUID(),
      ...childData,
      evaluaciones: []
    };
    addCamper(newChild);
    setSelectedChild(newChild);
    setShowAddChildForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Tent className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold">Kamplay</h1>
              <p className="text-sm text-indigo-200">Tu pasión, su felicidad</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
          <JoinCampButton />
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <LogOut size={20} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <ChildSelector
          children={campers}
          selectedChild={selectedChild}
          onSelectChild={setSelectedChild}
          onAddChild={() => setShowAddChildForm(true)}
        />

        <DailySummary />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <button
            onClick={() => setSelectedContent(selectedContent === 'info' ? null : 'info')}
            className={`flex flex-col items-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all group ${
              selectedContent === 'info' ? 'ring-2 ring-indigo-600' : ''
            }`}
          >
            <div className="p-3 bg-indigo-50 rounded-full mb-4 group-hover:bg-indigo-100">
              <User className="text-indigo-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Información Personal</h3>
            <p className="text-sm text-gray-600 text-center">Datos y perfil del acampado</p>
          </button>

          <button
            onClick={() => setSelectedContent(selectedContent === 'calendar' ? null : 'calendar')}
            className={`flex flex-col items-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all group ${
              selectedContent === 'calendar' ? 'ring-2 ring-indigo-600' : ''
            }`}
          >
            <div className="p-3 bg-indigo-50 rounded-full mb-4 group-hover:bg-indigo-100">
              <Calendar className="text-indigo-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Calendario</h3>
            <p className="text-sm text-gray-600 text-center">Actividades y eventos programados</p>
          </button>

          <button
            onClick={() => setSelectedContent(selectedContent === 'menu' ? null : 'menu')}
            className={`flex flex-col items-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all group ${
              selectedContent === 'menu' ? 'ring-2 ring-indigo-600' : ''
            }`}
          >
            <div className="p-3 bg-indigo-50 rounded-full mb-4 group-hover:bg-indigo-100">
              <UtensilsCrossed className="text-indigo-600" size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Menú</h3>
            <p className="text-sm text-gray-600 text-center">Menú diario del campamento</p>
          </button>
        </div>

        {selectedContent && (
          <div className="mt-6">
            {selectedContent === 'info' && (
              <EditableChildInfo 
                camper={selectedChild} 
                onUpdate={(updatedCamper) => updateCamper(updatedCamper)}
              />
            )}
            {selectedContent === 'calendar' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Calendario de Actividades</h2>
                <ActivityCalendar actividades={[]} />
              </div>
            )}
            {selectedContent === 'menu' && (
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
            )}
          </div>
        )}

        {showAddChildForm && (
          <AddChildForm
            onSubmit={handleAddChild}
            onClose={() => setShowAddChildForm(false)}
          />
        )}
      </main>
    </div>
  );
};

export default ParentDashboard;