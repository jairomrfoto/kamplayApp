import React from 'react';
import { useStore } from '../../store/store';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const COMIDAS = ['desayuno', 'comida', 'merienda', 'cena'] as const;
const COMIDA_LABEL: Record<string, string> = {
  desayuno: '🌅 Desayuno',
  comida: '☀️ Comida',
  merienda: '🍎 Merienda',
  cena: '🌙 Cena',
};

export default function ProfesorMenu() {
  const { menus } = useStore();

  if (menus.length === 0) {
    return <div className="text-center py-12 text-gray-400 text-sm">Sin menú configurado</div>;
  }

  return (
    <div className="space-y-4">
      {menus.map(menu => (
        <div key={menu.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="bg-orange-50 px-4 py-2.5 border-b border-orange-100">
            <h3 className="font-semibold text-orange-900 text-sm">
              {DIAS[menu.diaSemana] ?? `Día ${menu.diaSemana + 1}`}
            </h3>
          </div>
          <div className="divide-y divide-gray-50">
            {COMIDAS.map(tipo => {
              const plato = (menu as any)[tipo];
              if (!plato) return null;
              return (
                <div key={tipo} className="px-4 py-2.5 flex items-baseline gap-3">
                  <span className="text-xs text-gray-400 w-20 flex-shrink-0">{COMIDA_LABEL[tipo]}</span>
                  <span className="text-sm text-gray-700">{plato}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <p className="text-xs text-gray-400 text-center">Vista de solo lectura</p>
    </div>
  );
}
