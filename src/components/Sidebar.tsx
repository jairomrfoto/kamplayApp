import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Package, 
  UserCog,
  UsersRound,
  Tent,
  HeartPulse,
  LayoutDashboard,
  UtensilsCrossed as MenuIcon,
  AlertTriangle,
  Shield
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const isCoordinator = location.pathname.includes('/coordinator-dashboard');

  const baseLinks = [
    { to: "/app/dashboard", icon: LayoutDashboard, text: "Dashboard" },
    { to: "/app/calendario", icon: Calendar, text: "Calendario" },
    { to: "/app/actividades", icon: Users, text: "Actividades" },
    { to: "/app/acampados", icon: Users, text: "Acampados" },
    { to: "/app/materiales", icon: Package, text: "Materiales" },
    { to: "/app/monitores", icon: UserCog, text: "Monitores" },
    { to: "/app/grupos", icon: UsersRound, text: "Grupos" },
    { to: "/app/cabanas", icon: Tent, text: "Cabañas" },
    { to: "/app/area-medica", icon: HeartPulse, text: "Área Médica" },
    { to: "/app/incidencias", icon: AlertTriangle, text: "Incidencias" },
    { to: "/app/menu", icon: MenuIcon, text: "Menú" },
  ];

  const coordinatorLinks = [
    ...baseLinks,
    { to: "/coordinator-dashboard/coordinadores", icon: Shield, text: "Coordinadores" }
  ];

  const links = isCoordinator ? coordinatorLinks : baseLinks;

  return (
    <aside className="w-64 bg-white min-h-[calc(100vh-4rem)] shadow-lg sticky top-16 z-10 flex-shrink-0">
      <nav className="p-4">
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={isCoordinator ? link.to.replace('/app', '/coordinator-dashboard') : link.to}
                className={({ isActive }) => 
                  `flex items-center gap-2 p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
              >
                <link.icon size={18} />
                <span className="text-sm">{link.text}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;