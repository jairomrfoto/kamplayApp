import React, { useState } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { Camper } from '../../types';

interface Props {
  onImport: (campers: Omit<Camper, 'id'>[]) => void;
  onClose: () => void;
}

const ImportCampersModal = ({ onImport, onClose }: Props) => {
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Omit<Camper, 'id'>[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFile(file);
    setError(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const campers = jsonData.map((row: any) => ({
        nombre: row.Nombre || '',
        edad: parseInt(row.Edad) || 6,
        contacto: row.Contacto || '',
        infoMedica: {
          alergias: [],
          medicacion: [],
          notas: ''
        }
      }));

      // Validate data
      const invalidCampers = campers.filter(
        c => !c.nombre || isNaN(c.edad) || c.edad < 6 || c.edad > 18
      );

      if (invalidCampers.length > 0) {
        setError('Algunos registros contienen datos inválidos');
        return;
      }

      setPreview(campers);
    } catch (err) {
      setError('Error al procesar el archivo. Asegúrate de que sea un archivo Excel válido.');
    }
  };

  const handleImport = () => {
    if (preview.length > 0) {
      onImport(preview);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Importar Acampados desde Excel</h3>
          <button onClick={onClose}>
            <X className="text-gray-500 hover:text-gray-700" size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-medium mb-4">Formato requerido:</h4>
            <p className="text-sm text-gray-600 mb-2">
              El archivo Excel debe contener las siguientes columnas:
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-600">
              <li>Nombre (obligatorio)</li>
              <li>Edad (obligatorio, entre 6 y 18)</li>
              <li>Contacto</li>
            </ul>
          </div>

          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="text-gray-400 mb-2" size={24} />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Haz click para subir</span> o arrastra y suelta
                </p>
                <p className="text-xs text-gray-500">Excel (.xlsx, .xls)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-2">
              <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-medium">Error al procesar el archivo</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {preview.length > 0 && (
            <div>
              <h4 className="font-medium mb-4">Vista previa ({preview.length} acampados):</h4>
              <div className="max-h-64 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Edad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> 
                        Contacto
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((camper, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {camper.nombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {camper.edad}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {camper.contacto}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={preview.length === 0}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Importar {preview.length} Acampados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportCampersModal;