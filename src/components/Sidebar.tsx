import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Calendar, Users, Package, UserCog, UsersRound, Tent,
  HeartPulse, LayoutDashboard, UtensilsCrossed as MenuIcon,
  AlertTriangle, Shield, Layers, BookOpen, X,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import CampSwitcher from './CampSwitcher';
import { useStore } from '../store/store';

const Sidebar = () => {
  const location = useLocation();
  const isCoordinator = location.pathname.includes('/coordinator-dashboard');
  const { sidebarOpen, setSidebarOpen } = useStore();

  const baseLinks = [
    { to: '/app/dashboard',    icon: LayoutDashboard, text: 'Dashboard' },
    { to: '/app/calendario',   icon: Calendar,        text: 'Calendario' },
    { to: '/app/actividades',  icon: Users,           text: 'Actividades' },
    { to: '/app/acampados',    icon: Users,           text: 'Acampados' },
    { to: '/app/materiales',   icon: Package,         text: 'Materiales' },
    { to: '/app/monitores',    icon: UserCog,         text: 'Monitores' },
    { to: '/app/grupos',       icon: UsersRound,      text: 'Grupos' },
    { to: '/app/cabanas',      icon: Tent,            text: 'Cabañas' },
    { to: '/app/area-medica',  icon: HeartPulse,      text: 'Área Médica' },
    { to: '/app/incidencias',  icon: AlertTriangle,   text: 'Incidencias' },
    { to: '/app/menu',         icon: MenuIcon,        text: 'Menú' },
  ];

  const coordinatorLinks = [
    { to: '/coordinator-dashboard/mis-campamentos', icon: Layers,    text: 'Mis Campamentos' },
    ...baseLinks,
    { to: '/coordinator-dashboard/mi-biblioteca',   icon: BookOpen,  text: 'Mi Biblioteca' },
    { to: '/coordinator-dashboard/coordinadores',   icon: Shield,    text: 'Coordinadores' },
  ];

  const links = isCoordinator ? coordinatorLinks : baseLinks;

  const sidebarContent = (
    <div className="h-full flex flex-col">
      {/* Mobile close button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 lg:hidden">
        <div className="flex items-center gap-2 text-indigo-600 font-bold">
          <Tent size={18} />
          <span>Menú</span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="p-1 rounded-lg text-gray-500 hover:bg-gray-100"
        >
          <X size={20} />
        </button>
      </div>

      {/* Camp switcher */}
      <div className="pt-3">
        <CampSwitcher variant="sidebar" />
      </div>

      {/* Nav links */}
      <nav className="px-3 pb-4 overflow-y-auto flex-1">
        <ul className="space-y-0.5">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={isCoordinator ? link.to.replace('/app', '/coordinator-dashboard') : link.to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <link.icon size={17} className="flex-shrink-0" />
                <span>{link.text}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: drawer on mobile, static on desktop */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out
          lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:shadow-lg lg:z-10 lg:flex-shrink-0 lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
