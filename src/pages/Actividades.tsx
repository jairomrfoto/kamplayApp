import React, { useState } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { Plus, Filter } from 'lucide-react';
import { useStore } from '../store/store';
import ActividadForm from '../components/actividades/ActividadForm';
import ActividadCard from '../components/actividades/ActividadCard';
import CategoriaFilter from '../components/actividades/CategoriaFilter';

const CARD_WIDTH = 340;
const CARD_HEIGHT = 320;
const GRID_GAP = 24;

const Actividades = () => {
  const { actividades } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('todas');
  const [gridWidth, setGridWidth] = useState(window.innerWidth - 384); // Account for sidebar width (320px) + padding

  const actividadesFiltradas = categoriaSeleccionada === 'todas'
    ? actividades
    : actividades.filter(actividad => actividad.categoria === categoriaSeleccionada);

  React.useEffect(() => {
    const handleResize = () => {
      setGridWidth(window.innerWidth - 384);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const columnCount = Math.max(1, Math.floor((gridWidth + GRID_GAP) / (CARD_WIDTH + GRID_GAP)));
  const rowCount = Math.ceil(actividadesFiltradas.length / columnCount);

  const Cell = ({ columnIndex, rowIndex, style }: { 
    columnIndex: number; 
    rowIndex: number; 
    style: React.CSSProperties;
  }) => {
    const index = rowIndex * columnCount + columnIndex;
    const actividad = actividadesFiltradas[index];

    if (!actividad) return null;

    return (
      <div style={{
        ...style,
        padding: '12px',
        width: CARD_WIDTH,
      }}>
        <ActividadCard actividad={actividad} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Actividades</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Actividad
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm mb-4">
        <Filter size={20} className="text-gray-500" />
        <CategoriaFilter
          categoriaSeleccionada={categoriaSeleccionada}
          onCategoriaChange={setCategoriaSeleccionada}
        />
      </div>

      {actividadesFiltradas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay actividades en esta categoría
        </div>
      ) : (
        <Grid
          columnCount={columnCount}
          columnWidth={CARD_WIDTH + GRID_GAP}
          height={600}
          rowCount={rowCount}
          rowHeight={CARD_HEIGHT + GRID_GAP}
          width={gridWidth}
          className="overflow-auto"
        >
          {Cell}
        </Grid>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <ActividadForm onClose={() => setShowForm(false)} />
        </div>
      )}
    </div>
  );
};

export default Actividades;