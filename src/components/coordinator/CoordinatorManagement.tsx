import React, { useState } from 'react';
import { useStore } from '../../store/store';
import { Shield, UserPlus, Mail, X } from 'lucide-react';
import type { CampCoordinator } from '../../types/camp';

interface Props {
  onClose?: () => void;
}

const CoordinatorManagement = ({ onClose }: Props) => {
  const { currentCoordinator, addCoordinator, removeCoordinator, updateCoordinatorPermissions } = useStore();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const newCoordinator: CampCoordinator = {
      id: crypto.randomUUID(),
      campId: currentCoordinator?.campId || '',
      email: inviteEmail,
      name: '',
      role: 'coordinator',
      permissions: {
        manageCoordinators: false,
        manageMonitors: true,
        manageCampers: true,
        manageActivities: true,
        manageSchedule: true,
        viewReports: true,
      },
      isMainCoordinator: false
    };
    addCoordinator(newCoordinator);
    setShowInviteForm(false);
    setInviteEmail('');
  };

  if (!currentCoordinator?.isMainCoordinator) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-yellow-800">
          Solo el coordinador principal puede gestionar otros coordinadores.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Gestión de Coordinadores</h2>
        <button
          onClick={() => setShowInviteForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <UserPlus size={20} />
          Invitar Coordinador
        </button>
      </div>

      {showInviteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Invitar Coordinador</h3>
              <button onClick={() => setShowInviteForm(false)}>
                <X className="text-gray-500 hover:text-gray-700" size={20} />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email del coordinador
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="ejemplo@email.com"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowInviteForm(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Enviar Invitación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="space-y-6">
            {/* Lista de coordinadores */}
            <div className="grid grid-cols-1 gap-4">
              {/* Coordinador Principal */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Shield className="text-indigo-600" size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {currentCoordinator.name || currentCoordinator.email}
                      </h4>
                      <p className="text-sm text-gray-500">Coordinador Principal</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Otros Coordinadores */}
              {currentCoordinator.campId && (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Mail className="text-gray-600" size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">ejemplo@email.com</h4>
                        <p className="text-sm text-gray-500">Coordinador</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeCoordinator('coordinator-id')}
                      className="text-red-600 hover:text-red-700"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoordinatorManagement;