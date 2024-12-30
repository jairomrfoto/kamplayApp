import React from 'react';
import { categorias } from '../../utils/actividadesConfig';

interface Props {
  categoriaSeleccionada: string;
  onCategoriaChange: (categoria: string) => void;
}

const CategoriaFilter = ({ categoriaSeleccionada, onCategoriaChange }: Props) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onCategoriaChange('todas')}
        className={`px-3 py-1 rounded-full text-sm ${
          categoriaSeleccionada === 'todas'
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Todas
      </button>
      {categorias.map(categoria => (
        <button
          key={categoria.id}
          onClick={() => onCategoriaChange(categoria.id)}
          className={`px-3 py-1 rounded-full text-sm ${
            categoriaSeleccionada === categoria.id
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {categoria.nombre}
        </button>
      ))}
    </div>
  );
};

export default CategoriaFilter;