import React, { useState } from 'react';
import { Tent, Bell, LogOut, Settings, User, ChevronDown } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/store';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentMonitor, currentCoordinator } = useStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const isCoordinator = location.pathname.includes('/coordinator-dashboard');
  const currentUser = isCoordinator ? currentCoordinator : currentMonitor;
  const baseProfilePath = isCoordinator ? '/coordinator-dashboard/profile' : '/monitor-dashboard/profile';
  
  const notifications = [
    {
      id: '1',
      title: 'Nueva actividad asignada',
      message: 'Has sido asignado a "Taller de Arte" mañana',
      time: '5 min',
      unread: true
    },
    {
      id: '2',
      title: 'Recordatorio',
      message: 'Reunión de monitores a las 18:00',
      time: '1 hora',
      unread: false
    }
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <nav className="bg-indigo-600 text-white p-4 relative">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/app/dashboard" className="flex items-center space-x-2">
          <Tent size={24} />
          <h1 className="text-lg lg:text-xl font-bold">Kamplay</h1>
        </Link>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 hover:bg-indigo-700 rounded-full relative"
          >
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 text-gray-900 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <h3 className="font-semibold">Notificaciones</h3>
              </div>
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 hover:bg-gray-50 ${
                    notification.unread ? 'bg-indigo-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <span className="text-xs text-gray-500">{notification.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                </div>
              ))}
              <div className="px-4 py-2 border-t border-gray-100">
                <button className="text-sm text-indigo-600 hover:text-indigo-700 w-full text-center">
                  Ver todas las notificaciones
                </button>
              </div>
            </div>
          )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {currentUser?.photo ? (
                <img
                  src={currentUser.photo}
                  alt={currentUser.name || 'Usuario'}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
              <ChevronDown size={16} />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 text-gray-900 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="font-medium text-sm">{currentUser?.name || 'Usuario'}</p>
                  <p className="text-xs text-gray-500">{currentUser?.email}</p>
                </div>
                
                <Link
                  to={baseProfilePath}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User size={16} />
                  Mi Perfil
                </Link>
                
                <Link
                  to={`${baseProfilePath}/settings`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings size={16} />
                  Configuración
                </Link>
                
                <div className="border-t border-gray-100 mt-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 w-full"
                  >
                    <LogOut size={16} />
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Backdrop for closing menus */}
      {(showProfileMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowProfileMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </nav>
  );
};

export default Navbar;