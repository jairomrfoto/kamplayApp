import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Calendar, Users, Package, UserCog, UsersRound, Tent,
  HeartPulse, LayoutDashboard, UtensilsCrossed as MenuIcon,
  AlertTriangle, Shield, Layers, BookOpen, X, Newspaper, ClipboardList,
} from 'lucide-react';
import CampSwitcher from './CampSwitcher';
import { useStore } from '../store/store';

type LinkDef = { to: string; icon: React.ElementType; text: string };

function getBaseLinks(isCampus: boolean): LinkDef[] {
  const links: LinkDef[] = [
    { to: '/app/dashboard',   icon: LayoutDashboard, text: 'Dashboard' },
    { to: '/app/calendario',  icon: Calendar,        text: 'Calendario' },
    { to: '/app/actividades', icon: Users,           text: 'Actividades' },
    { to: '/app/acampados',   icon: Users,           text: 'Acampados' },
    { to: '/app/materiales',  icon: Package,         text: 'Materiales' },
    { to: '/app/monitores',   icon: UserCog,         text: 'Monitores' },
    { to: '/app/grupos',      icon: UsersRound,      text: 'Grupos' },
  ];
  if (!isCampus) {
    links.push({ to: '/app/cabanas', icon: Tent, text: 'Cabañas' });
  }
  if (isCampus) {
    links.push({ to: '/app/asistencia', icon: ClipboardList, text: 'Asistencia' });
  }
  links.push(
    { to: '/app/area-medica', icon: HeartPulse,      text: 'Área Médica' },
    { to: '/app/incidencias', icon: AlertTriangle,   text: 'Incidencias' },
    { to: '/app/menu',        icon: MenuIcon,        text: 'Menú' },
  );
  return links;
}

function getCoordinatorLinks(isCampus: boolean): LinkDef[] {
  return [
    { to: '/coordinator-dashboard/mis-campamentos', icon: Layers,    text: 'Mis programas' },
    { to: '/coordinator-dashboard/novedades',       icon: Newspaper, text: 'Novedades' },
    ...getBaseLinks(isCampus),
    { to: '/coordinator-dashboard/mi-biblioteca',  icon: BookOpen,  text: 'Mi Biblioteca' },
    { to: '/coordinator-dashboard/coordinadores',  icon: Shield,    text: 'Coordinadores' },
  ];
}

const NavLinks = ({ links, isCoordinator, onClose }: {
  links: LinkDef[];
  isCoordinator: boolean;
  onClose?: () => void;
}) => (
  <ul className="space-y-0.5">
    {links.map((link) => (
      <li key={link.to}>
        <NavLink
          to={isCoordinator ? link.to.replace('/app', '/coordinator-dashboard') : link.to}
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors ${
              isActive
                ? 'bg-orange-50 text-orange-600 font-bold'
                : 'text-gray-600 hover:bg-stone-50 hover:text-gray-900'
            }`
          }
        >
          <link.icon size={17} className="flex-shrink-0" />
          <span>{link.text}</span>
        </NavLink>
      </li>
    ))}
  </ul>
);

const Sidebar = () => {
  const location = useLocation();
  const isCoordinator = location.pathname.includes('/coordinator-dashboard');
  const { sidebarOpen, setSidebarOpen, currentCamp } = useStore();
  const isCampus = currentCamp?.type === 'campus';
  const links = isCoordinator ? getCoordinatorLinks(isCampus) : getBaseLinks(isCampus);
  const close = () => setSidebarOpen(false);

  return (
    <>
      {/* ── DESKTOP sidebar: static in document flow, hidden on mobile ── */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-white border-r border-stone-100 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="pt-3">
          <CampSwitcher variant="sidebar" />
        </div>
        <nav className="px-3 pb-4 flex-1 overflow-y-auto">
          <NavLinks links={links} isCoordinator={isCoordinator} />
        </nav>
      </aside>

      {/* ── MOBILE sidebar: rendered only when open, full overlay ──────── */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={close}
          />

          {/* Drawer panel */}
          <aside className="fixed inset-y-0 left-0 z-50 flex flex-col bg-white shadow-2xl"
            style={{ width: 'min(288px, 85vw)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2 text-green-800 font-extrabold">
                <span className="text-lg">🏕️</span>
                <span>Kamplay</span>
              </div>
              <button
                onClick={close}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Camp switcher */}
            <div className="pt-2 flex-shrink-0">
              <CampSwitcher variant="sidebar" />
            </div>

            {/* Nav links — scrollable */}
            <nav className="px-3 pb-6 overflow-y-auto flex-1">
              <NavLinks links={links} isCoordinator={isCoordinator} onClose={close} />
            </nav>
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;
