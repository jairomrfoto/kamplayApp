import React, { useState } from 'react';
import { useStore } from '../../store/store';
import { Shield, X, Clock, ArrowUpCircle, CheckCircle, Loader } from 'lucide-react';
import type { Monitor } from '../../types';
import type { CampCoordinator } from '../../types/camp';

interface Props {
  monitor: Monitor;
  onClose: () => void;
}

const MonitorPermissions = ({ monitor, onClose }: Props) => {
  const { updateMonitorPermisos, currentCamp, addCoordinator } = useStore();
  const [permisos, setPermisos] = useState(monitor.permisos);
  const [showPromoteConfirm, setShowPromoteConfirm] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [promoted, setPromoted] = useState(false);
  const isCampus = currentCamp?.type === 'campus';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMonitorPermisos(monitor.id, permisos);
    onClose();
  };

  const handlePromote = async () => {
    if (!currentCamp) return;
    setPromoting(true);
    try {
      const coordinator: CampCoordinator = {
        id: monitor.id,
        campId: currentCamp.id,
        email: monitor.email || '',
        name: monitor.nombre,
        role: 'coordinator',
        permissions: {
          manageCoordinators: false,
          manageMonitors: true,
          manageCampers: true,
          manageActivities: true,
          manageSchedule: true,
          viewReports: true,
        },
        isMainCoordinator: false,
      };
      // addCoordinator adds the uid to camp.coordinators[] and saves the CampCoordinator doc.
      // On next login, useFirestoreSync detects coordinators.includes(uid) and self-updates
      // the monitor's own profile role to 'coordinator' (avoiding the 403 cross-user write).
      addCoordinator(coordinator);
      setPromoted(true);
    } catch (err) {
      console.error('Error al promover:', err);
    } finally {
      setPromoting(false);
    }
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

        {/* Header */}
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

        {/* Pending alert */}
        {monitor.pendiente && !promoted && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
            <Clock size={15} className="text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              Este monitor acaba de unirse y espera que actives sus permisos.
            </p>
          </div>
        )}

        {/* Promoted success state */}
        {promoted ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle size={48} className="text-green-500" />
              <div>
                <p className="font-semibold text-gray-900">{monitor.nombre} ha sido ascendido a Coordinador</p>
                <p className="text-sm text-gray-500 mt-1">
                  Deberá cerrar sesión y volver a iniciar para acceder al panel de coordinador.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 text-sm font-semibold"
            >
              Cerrar
            </button>
          </div>
        ) : showPromoteConfirm ? (
          /* Promote confirmation */
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                <span className="font-semibold">¿Ascender a {monitor.nombre} a Coordinador?</span>
                <br />
                Tendrá acceso completo al panel de coordinador. Esta acción no se puede deshacer desde aquí.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPromoteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handlePromote}
                disabled={promoting}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 text-sm font-semibold disabled:opacity-60"
              >
                {promoting ? <Loader size={15} className="animate-spin" /> : <ArrowUpCircle size={15} />}
                {promoting ? 'Ascendiendo...' : 'Confirmar ascenso'}
              </button>
            </div>
          </div>
        ) : (
          /* Normal permissions form */
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

            {/* Divider + promote option */}
            <div className="border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setShowPromoteConfirm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 text-sm font-medium transition-colors"
              >
                <ArrowUpCircle size={16} />
                Ascender a Coordinador
              </button>
            </div>

            <div className="flex justify-end gap-3">
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
        )}
      </div>
    </div>
  );
};

export default MonitorPermissions;
