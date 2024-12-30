import React, { useState } from 'react';
import { useStore } from '../store/store';
import { Plus, Search, UserCog, Shield } from 'lucide-react';
import MonitorProfile from '../components/monitors/MonitorProfile';
import MonitorProfileForm from '../components/monitors/MonitorProfileForm';
import MonitorPermissions from '../components/coordinator/MonitorPermissions';
import type { Monitor } from '../types';

const Monitores = () => {
  const { monitores, updateMonitor } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonitor, setSelectedMonitor] = useState<string | null>(null);
  const [editingMonitor, setEditingMonitor] = useState<string | null>(null);
  const [managingPermissions, setManagingPermissions] = useState<string | null>(null);

  const handleUpdateMonitor = (updatedMonitor: Monitor) => {
    updateMonitor(updatedMonitor);
    setEditingMonitor(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Equipo de Monitores</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
          <Plus size={20} />
          Nuevo Monitor
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar monitores..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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