import React from 'react';
import { Lock, X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function PendingPermissionAlert({ onClose }: Props) {
  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 text-sm text-amber-800 shadow-sm">
      <Lock size={15} className="flex-shrink-0 mt-0.5 text-amber-500" />
      <p className="flex-1 font-medium">
        Aún no tienes permisos para editar esta sección. Contacta con el coordinador de tu campamento.
      </p>
      <button onClick={onClose} className="flex-shrink-0 text-amber-500 hover:text-amber-700">
        <X size={15} />
      </button>
    </div>
  );
}
