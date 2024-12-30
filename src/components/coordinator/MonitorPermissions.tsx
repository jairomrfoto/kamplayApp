import React, { useState } from 'react';
import { useStore } from '../../store/store';
import { Shield, X } from 'lucide-react';
import type { Monitor } from '../../types';

interface Props {
  monitor: Monitor;
  onClose: () => void;
}

const MonitorPermissions = ({ monitor, onClose }: Props) => {
  const { updateMonitorPermisos } = useStore();
  const [permisos, setPermisos] = useState(monitor.permisos);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMonitorPermisos(monitor.id, permisos);
    onClose();
  };

  const permisosConfig = [
    { key: 'editarActividades', label: 'Editar Actividades' },
    { key: 'editarMateriales', label: 'Gestionar Materiales' },
    { key: 'editarGrupos', label: 'Administrar Grupos' },
    { key: 'editarCabanas', label: 'Gestionar Cabañas' },
    { key: 'editarAreaMedica', label: 'Acceso Área Médica' },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Shield className="text-indigo-600" size={24} />
            <div>
              <h3 className="text-lg font-semibold">Permisos de Monitor</h3>
              <p className="text-sm text-gray-600">{monitor.nombre}</p>
            </div>
          </div>
          <button onClick={onClose}>
            <X className="text-gray-500 hover:text-gray-700" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {permisosConfig.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <span className="text-gray-700">{label}</span>
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={permisos[key]}
                    onChange={(e) => setPermisos(prev => ({
                      ...prev,
                      [key]: e.target.checked
                    }))}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Guardar Permisos
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MonitorPermissions;