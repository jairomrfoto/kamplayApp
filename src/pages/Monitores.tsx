import React, { useState, useEffect } from 'react';
import { useStore } from '../store/store';
import { Plus, Search, RefreshCw, Shield, Bell } from 'lucide-react';
import MonitorProfile from '../components/monitors/MonitorProfile';
import MonitorProfileForm from '../components/monitors/MonitorProfileForm';
import MonitorPermissions from '../components/coordinator/MonitorPermissions';
import type { Monitor } from '../types';

const Monitores = () => {
  const { monitores, updateMonitor, loadFromFirestore, currentCamp } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMonitor, setEditingMonitor] = useState<string | null>(null);
  const [managingPermissions, setManagingPermissions] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const pendingCount = monitores.filter(m => m.pendiente).length;

  // Refresh on mount so the coordinator always sees the latest list,
  // even if the real-time onSnapshot listener missed the update.
  useEffect(() => {
    if (currentCamp?.id) loadFromFirestore(currentCamp.id);
  }, [currentCamp?.id]);

  const handleRefresh = async () => {
    if (!currentCamp?.id || refreshing) return;
    setRefreshing(true);
    await loadFromFirestore(currentCamp.id);
    setRefreshing(false);
  };

  const handleUpdateMonitor = (updatedMonitor: Monitor) => {
    updateMonitor(updatedMonitor);
    setEditingMonitor(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Equipo de Monitores</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {pendingCount > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <Bell size={15} className="text-amber-600" />
          </div>
          <p className="text-sm text-amber-800 flex-1">
            <span className="font-semibold">{pendingCount} monitor{pendingCount > 1 ? 'es' : ''} nuevo{pendingCount > 1 ? 's' : ''}</span>
            {' '}acaba{pendingCount > 1 ? 'n' : ''} de unirse y espera{pendingCount > 1 ? 'n' : ''} que les actives los permisos.
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar monitores..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {monitores.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              No hay monitores registrados
            </div>
          ) : (
            monitores.map((monitor) => (
              <div key={monitor.id}>
                {editingMonitor === monitor.id ? (
                  <MonitorProfileForm
                    monitor={monitor}
                    onSave={handleUpdateMonitor}
                    onCancel={() => setEditingMonitor(null)}
                  />
                ) : (
                  <MonitorProfile
                    monitor={monitor}
                    onEdit={() => setEditingMonitor(monitor.id)}
                    onManagePermissions={() => setManagingPermissions(monitor.id)}
                  />
                )}
              </div>
            ))
          )}
        </div>
        
        {managingPermissions && (
          <MonitorPermissions
            monitor={monitores.find(m => m.id === managingPermissions)!}
            onClose={() => setManagingPermissions(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Monitores;