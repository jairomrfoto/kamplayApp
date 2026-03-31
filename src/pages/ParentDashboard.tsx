import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { Tent, LogOut, User, Calendar, UtensilsCrossed, ChevronDown, PlusCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import EditableChildInfo from '../components/parent/EditableChildInfo';
import ActivityCalendar from '../components/parent/ActivityCalendar';
import MenuDiario from '../components/menu/MenuDiario';
import DailySummary from '../components/parent/DailySummary';
import ChildSelector from '../components/parent/ChildSelector';
import AddChildForm from '../components/parent/AddChildForm';
import type { Camper } from '../types';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { campers, updateCamper, menus, addCamper, currentCamp } = useStore();
  const [selectedContent, setSelectedContent] = React.useState<'info' | 'calendar' | 'menu' | null>(null);
  const [selectedChild, setSelectedChild] = React.useState<Camper | null>(null);
  const [showAddChildForm, setShowAddChildForm] = React.useState(false);
  const [showMenu, setShowMenu] = React.useState(false);

  const todayMenu = menus.find(m => {
    try {
      const fecha = m.fecha instanceof Date ? m.fecha : new Date(m.fecha as any);
      return fecha.toDateString() === new Date().toDateString();
    } catch {
      return false;
    }
  });

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

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Padre/Madre';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-indigo-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tent size={22} />
            <span className="text-lg font-bold">Kamplay</span>
            <span className="text-indigo-300 text-sm hidden sm:inline">· Panel de Familia</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/join-camp"
              className="flex items-center gap-1.5 text-sm bg-white text-indigo-600 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <PlusCircle size={15} />
              <span className="hidden sm:inline">Unirme a campamento</span>
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-indigo-700"
              >
                <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-medium">
                  {initial}
                </div>
                <ChevronDown size={14} />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg py-2 text-gray-900 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium">{displayName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 w-full"
                    >
                      <LogOut size={15} /> Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* No camp banner */}
      {!currentCamp && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-amber-800 text-sm">
              Aún no estás vinculado a ningún campamento. Pídele el código al coordinador.
            </p>
            <Link
              to="/join-camp"
              className="text-sm bg-amber-600 text-white px-4 py-1.5 rounded-lg hover:bg-amber-700 whitespace-nowrap"
            >
              Introducir código
            </Link>
          </div>
        </div>
      )}

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
