import React, { useState } from 'react';
import { useStore } from '../../store/store';
import { Shield, X, Clock } from 'lucide-react';
import type { Monitor } from '../../types';

interface Props {
  monitor: Monitor;
  onClose: () => void;
}

const MonitorPermissions = ({ monitor, onClose }: Props) => {
  const { updateMonitorPermisos, currentCamp } = useStore();
  const [permisos, setPermisos] = useState(monitor.permisos);
  const isCampus = currentCamp?.type === 'campus';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMonitorPermisos(monitor.id, permisos);
    onClose();
  };

  const permisosConfig = [
    { key: 'editarActividades' as const, label: 'Editar Actividades', show: true },
    { key: 'editarMateriales' as const, label: 'Gestionar Materiales', show: true },
    { key: 'editarGrupos' as const, label: 'Administrar Grupos', show: true },
    { key: 'editarCabanas' as const, label: 'Gestionar Cabañas', show: !isCampus },
    { key: 'editarAreaMedica' as const, label: 'Acceso Área Médica', show: true },
    { key: 'asistencia' as const, label: 'Gestionar Asistencia', show: isCampus },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <Shield className="text-orange-600" size={24} />
            <div>
              <h3 className="text-lg font-semibold">Permisos de Monitor</h3>
              <p className="text-sm text-gray-600">{monitor.nombre}</p>
            </div>
          </div>
          <button onClick={onClose}>
            <X className="text-gray-500 hover:text-gray-700" size={20} />
          </button>
        </div>

        {monitor.pendiente && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
            <Clock size={15} className="text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              Este monitor acaba de unirse y espera que actives sus permisos.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            {permisosConfig.filter(p => p.show).map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-gray-700 text-sm">{label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={permisos[key] ?? false}
                    onChange={(e) => setPermisos(prev => ({ ...prev, [key]: e.target.checked }))}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500" />
                </label>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 text-sm font-semibold"
            >
              Guardar permisos
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MonitorPermissions;
