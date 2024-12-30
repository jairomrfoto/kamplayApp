import React from 'react';
import { Plus, User } from 'lucide-react';
import type { Camper } from '../../types';

interface Props {
  children: Camper[];
  selectedChild: Camper | null;
  onSelectChild: (child: Camper) => void;
  onAddChild: () => void;
}

const ChildSelector = ({ children, selectedChild, onSelectChild, onAddChild }: Props) => {
  return (
    <div className="flex items-center gap-4 overflow-x-auto pb-4">
      {children.map((child) => (
        <button
          key={child.id}
          onClick={() => onSelectChild(child)}
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
            selectedChild?.id === child.id
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {child.foto ? (
            <img
              src={child.foto}
              alt={child.nombre}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 p-1.5 bg-gray-100 rounded-full" />
          )}
          <span className="font-medium whitespace-nowrap">{child.nombre}</span>
        </button>
      ))}
      
      <button
        onClick={onAddChild}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
      >
        <Plus size={20} />
        <span className="whitespace-nowrap">Añadir hijo</span>
      </button>
    </div>
  );
}

export default ChildSelector;