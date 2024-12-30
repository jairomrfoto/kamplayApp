import React from 'react';
import { Calendar, User, UtensilsCrossed } from 'lucide-react';

interface Props {
  activeSection: 'home' | 'calendar' | 'menu';
  onNavigate: (section: 'home' | 'calendar' | 'menu') => void;
}

const ParentNavigation = ({ activeSection, onNavigate }: Props) => {
  const buttons = [
    {
      icon: User,
      label: 'Información Personal',
      description: 'Datos y perfil del acampado',
      section: 'home' as const
    },
    {
      icon: Calendar,
      label: 'Calendario',
      description: 'Actividades y eventos programados',
      section: 'calendar' as const
    },
    {
      icon: UtensilsCrossed,
      label: 'Menú',
      description: 'Menú diario del campamento',
      section: 'menu' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {buttons.map((button, index) => (
        <button
          key={index}
          onClick={() => onNavigate(button.section)}
          className={`flex flex-col items-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all group ${
            activeSection === button.section ? 'ring-2 ring-indigo-600' : ''
          }`}
        >
          <div className="p-3 bg-indigo-50 rounded-full mb-4 group-hover:bg-indigo-100 transition-colors">
            <button.icon className="text-indigo-600" size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{button.label}</h3>
          <p className="text-sm text-gray-600 text-center">{button.description}</p>
        </button>
      ))}
    </div>
  );
};

export default ParentNavigation;