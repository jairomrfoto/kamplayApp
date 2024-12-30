import React, { useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { useStore } from '../store/store';
import { Plus, Search, Edit, Trash, FileSpreadsheet } from 'lucide-react';
import CamperForm from '../components/acampados/CamperForm';
import type { Camper } from '../types';
import EditCamperForm from '../components/acampados/EditCamperForm';
import CamperProfileDetail from '../components/acampados/CamperProfileDetail';
import ImportCampersModal from '../components/acampados/ImportCampersModal';

const ITEM_SIZE = 64; // Altura de cada fila

const Acampados = () => {
  const { campers, addCamper } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCamper, setEditingCamper] = useState<string | null>(null);
  const [selectedCamper, setSelectedCamper] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);

  const camperToEdit = editingCamper ? campers.find(c => c.id === editingCamper) : null;
  const filteredCampers = campers.filter(camper => 
    camper.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImportCampers = (newCampers: Array<Omit<Camper, 'id'>>) => {
    newCampers.forEach(camper => {
      addCamper({
        id: crypto.randomUUID(),
        grupo: '',
        cabana: '',
        evaluaciones: [],
        ...camper
      });
    });
    setShowImport(false);
  };

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const camper = filteredCampers[index];
    return (
      <div style={style} className="flex items-center border-b border-gray-200">
        <div 
          className="flex-1 px-6 py-4 whitespace-nowrap cursor-pointer hover:text-indigo-600"
          onClick={() => setSelectedCamper(camper.id)}
        >
          {camper.nombre}
        </div>
        <div className="flex-1 px-6 py-4 whitespace-nowrap">{camper.edad}</div>
        <div className="flex-1 px-6 py-4 whitespace-nowrap">{camper.grupo}</div>
        <div className="flex-1 px-6 py-4 whitespace-nowrap">{camper.habitacion}</div>
        <div className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setEditingCamper(camper.id)}
              className="text-blue-600 hover:text-blue-800"
            >
              <Edit size={18} />
            </button>
            <button className="text-red-600 hover:text-red-800">
              <Trash size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Gestión de Acampados
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowImport(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <FileSpreadsheet size={20} />
            Importar Excel
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus size={20} />
            Nuevo Acampado
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar acampados..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <div>
            {/* Header */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <div className="flex-1 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</div>
              <div className="flex-1 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Edad</div>
              <div className="flex-1 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo</div>
              <div className="flex-1 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Habitación</div>
              <div className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</div>
            </div>
            
            {/* Virtualized List */}
            {filteredCampers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay acampados registrados
              </div>
            ) : (
              <List
                height={400}
                itemCount={filteredCampers.length}
                itemSize={ITEM_SIZE}
                width="100%"
              >
                {Row}
              </List>
            )}
          </div>
        </div>
      </div>
      
      {showForm && (
        <CamperForm onClose={() => setShowForm(false)} />
      )}
      
      {editingCamper && camperToEdit && (
        <EditCamperForm
          camper={camperToEdit}
          onClose={() => setEditingCamper(null)}
        />
      )}
      
      {showImport && (
        <ImportCampersModal
          onImport={handleImportCampers}
          onClose={() => setShowImport(false)}
        />
      )}
      
      {selectedCamper && (
        <CamperProfileDetail
          camperId={selectedCamper}
          onClose={() => setSelectedCamper(null)}
        />
      )}
    </div>
  );
};

export default Acampados;