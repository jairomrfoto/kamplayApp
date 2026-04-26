import React from 'react';
import { Check, Copy } from 'lucide-react';
import type { Camp } from '../../types/camp';

interface Props {
  camp: Camp;
  adminEmail: string;
  onClose: () => void;
}

const SuccessModal = ({ camp, adminEmail, onClose }: Props) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-100 p-2 rounded-full">
            <Check className="text-green-600" size={20} />
          </div>
          <h3 className="text-lg font-semibold">¡Campamento Creado!</h3>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-gray-600 mb-2">Credenciales de coordinador:</p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Email:</span>
                <button 
                  onClick={() => copyToClipboard(adminEmail)}
                  className="text-orange-600 hover:text-orange-700"
                >
                  <Copy size={16} />
                </button>
              </div>
              <p className="text-sm">{adminEmail}</p>
            </div>
          </div>

          <div>
            <p className="text-gray-600 mb-2">Código para monitores:</p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Código:</span>
                <button 
                  onClick={() => copyToClipboard(camp.joinCodes.monitors)}
                  className="text-orange-600 hover:text-orange-700"
                >
                  <Copy size={16} />
                </button>
              </div>
              <p className="text-sm font-mono">{camp.joinCodes.monitors}</p>
              <p className="mt-1 text-xs text-gray-500">Comparte este código con los monitores del campamento</p>
            </div>
          </div>

          <div>
            <p className="text-gray-600 mb-2">Código para familias:</p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Código:</span>
                <button
                  onClick={() => copyToClipboard(camp.joinCodes.families)}
                  className="text-orange-600 hover:text-orange-700"
                >
                  <Copy size={16} />
                </button>
              </div>
              <p className="text-sm font-mono">{camp.joinCodes.families}</p>
              <p className="mt-1 text-xs text-gray-500">Comparte este código con las familias de los acampados</p>
            </div>
          </div>

          {camp.joinCodes.teachers && (
            <div>
              <p className="text-gray-600 mb-2">Código para profesores:</p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Código:</span>
                  <button
                    onClick={() => copyToClipboard(camp.joinCodes.teachers!)}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <p className="text-sm font-mono">{camp.joinCodes.teachers}</p>
                <p className="mt-1 text-xs text-gray-500">Comparte este código con los profesores del colegio</p>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-500">
            Guarda estos códigos en un lugar seguro. Los necesitarás para gestionar el acceso al campamento.
          </p>
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

export default SuccessModal;