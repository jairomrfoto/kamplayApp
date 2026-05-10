import React, { useState } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { Plus, Filter, BookOpen, Layers, User, Clock, Users, MapPin, Package } from 'lucide-react';
import { useStore } from '../store/store';
import ActividadForm from '../components/actividades/ActividadForm';
import DemoSectionBanner from '../components/DemoSectionBanner';
import ActividadCard from '../components/actividades/ActividadCard';
import CategoriaFilter from '../components/actividades/CategoriaFilter';
import PlantillaCard from '../components/actividades/PlantillaCard';
import MiActividadForm from '../components/MiActividadForm';
import { actividadesEjemplo } from '../data/actividadesEjemplo';
import type { ActividadPlantilla } from '../data/actividadesEjemplo';
import type { ActividadPersonal } from '../types';
import { categorias } from '../utils/actividadesConfig';

const CARD_WIDTH = 340;
const CARD_HEIGHT = 320;
const GRID_GAP = 24;

const Actividades = () => {
  const { actividades, misActividades, currentCamp, loadFromFirestore, addActividad } = useStore();
  React.useEffect(() => { if (currentCamp?.id) loadFromFirestore(currentCamp.id, true); }, [currentCamp?.id]);
  const isCampus = currentCamp?.type === 'campus';

  const [tab, setTab] = useState<'campamento' | 'banco' | 'mia'>('campamento');
  const [showForm, setShowForm] = useState(false);
  const [showMiaForm, setShowMiaForm] = useState(false);
  const [plantillaInicial, setPlantillaInicial] = useState<Partial<ActividadPlantilla> | undefined>();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('todas');
  const [gridWidth, setGridWidth] = useState(window.innerWidth - 384);

  const actividadesFiltradas = categoriaSeleccionada === 'todas'
    ? actividades
    : actividades.filter(a => a.categoria === categoriaSeleccionada);

  const plantillasFiltradas = categoriaSeleccionada === 'todas'
    ? actividadesEjemplo
    : actividadesEjemplo.filter(p => p.categoria === categoriaSeleccionada);

  React.useEffect(() => {
    const onResize = () => setGridWidth(window.innerWidth - 384);
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const columnCount = Math.max(1, Math.floor((gridWidth + GRID_GAP) / (CARD_WIDTH + GRID_GAP)));
  const rowCount = Math.ceil(actividadesFiltradas.length / columnCount);

  const Cell = ({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
    const index = rowIndex * columnCount + columnIndex;
    const actividad = actividadesFiltradas[index];
    if (!actividad) return null;
    return (
      <div style={{ ...style, padding: '12px', width: CARD_WIDTH }}>
        <ActividadCard actividad={actividad} />
      </div>
    );
  };

  const handleUsarPlantilla = (plantilla: ActividadPlantilla) => {
    setPlantillaInicial(plantilla);
    setShowForm(true);
    setTab('campamento');
  };

  const handleUsarMia = (a: ActividadPersonal) => {
    setPlantillaInicial({
      titulo: a.titulo,
      descripcion: a.descripcion,
      categoria: a.categoria,
      duracion: a.duracion,
      edadMinima: a.edadMinima,
      edadMaxima: a.edadMaxima,
      capacidadMaxima: a.capacidadMaxima,
      ubicacion: a.ubicacion,
    });
    setShowForm(true);
    setTab('campamento');
  };

  const catNombre = (id: string) => categorias.find(c => c.id === id)?.nombre || id;

  return (
    <div className="space-y-6">
      <DemoSectionBanner description="Catálogo de actividades del campamento. Crea nuevas actividades, asigna monitores y grupos, define los materiales necesarios y fija el horario de cada sesión." />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Actividades</h2>
        {tab === 'mia' ? (
          <button
            onClick={() => setShowMiaForm(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center gap-2"
          >
            <Plus size={20} />
            Crear actividad
          </button>
        ) : (
          <button
            onClick={() => { setPlantillaInicial(undefined); setShowForm(true); }}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center gap-2"
          >
            <Plus size={20} />
            Nueva Actividad
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab('campamento')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'campamento' ? 'bg-white text-orange-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Layers size={16} />
          {isCampus ? 'Del campus' : 'Del campamento'}
          {actividades.length > 0 && (
            <span className="ml-1 bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded-full">
              {actividades.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('banco')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'banco' ? 'bg-white text-orange-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <BookOpen size={16} />
          Banco de actividades
          <span className="ml-1 bg-gray-200 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
            {actividadesEjemplo.length}
          </span>
        </button>
        <button
          onClick={() => setTab('mia')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'mia' ? 'bg-white text-orange-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <User size={16} />
          Mi Biblioteca
          {misActividades.length > 0 && (
            <span className="ml-1 bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5 rounded-full">
              {misActividades.length}
            </span>
          )}
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
        <Filter size={20} className="text-gray-500 flex-shrink-0" />
        <CategoriaFilter
          categoriaSeleccionada={categoriaSeleccionada}
          onCategoriaChange={setCategoriaSeleccionada}
        />
      </div>

      {/* Tab: campamento */}
      {tab === 'campamento' && (
        actividadesFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium mb-1">No hay actividades en esta categoría</p>
            <p className="text-gray-400 text-sm mb-4">
              Crea una nueva o inspírate en el banco de actividades
            </p>
            <button
              onClick={() => setTab('banco')}
              className="text-orange-600 hover:text-orange-800 text-sm font-medium underline"
            >
              Ver banco de actividades →
            </button>
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
        )
      )}

      {/* Tab: banco */}
      {tab === 'banco' && (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            Actividades de ejemplo listas para usar. Haz clic en <strong>"Usar como plantilla"</strong> para añadirlas al {isCampus ? 'campus' : 'campamento'} y personalizar fechas, grupo y monitores.
          </p>
          {plantillasFiltradas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No hay actividades en esta categoría</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {plantillasFiltradas.map(p => (
                <PlantillaCard key={p.id} plantilla={p} onUsar={handleUsarPlantilla} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: mi biblioteca */}
      {tab === 'mia' && (
        <div>
          {misActividades.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <User size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium mb-1">Tu biblioteca personal está vacía</p>
              <p className="text-gray-400 text-sm mb-5">
                Crea plantillas propias y vincúlalas a cualquier campamento cuando quieras.
              </p>
              <button
                onClick={() => setShowMiaForm(true)}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-colors"
              >
                <Plus size={16} />
                Crear actividad
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Tus plantillas guardadas. Usa <strong>"Añadir al {isCampus ? 'campus' : 'campamento'}"</strong> para programarlas aquí.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {misActividades.map(a => (
                  <div key={a.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800 line-clamp-2 flex-1 text-sm leading-snug">{a.titulo}</h3>
                      <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                        {catNombre(a.categoria)}
                      </span>
                    </div>
                    {a.descripcion && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">{a.descripcion}</p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1"><Clock size={11} />{a.duracion} min</span>
                      <span className="flex items-center gap-1"><Users size={11} />{a.edadMinima}-{a.edadMaxima} años</span>
                      {a.ubicacion && <span className="flex items-center gap-1"><MapPin size={11} />{a.ubicacion}</span>}
                    </div>
                    <button
                      onClick={() => handleUsarMia(a)}
                      className="mt-auto w-full text-sm bg-orange-50 text-orange-700 hover:bg-orange-100 px-3 py-2 rounded-xl font-medium transition-colors"
                    >
                      + Añadir al {isCampus ? 'campus' : 'campamento'}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Camp activity form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <ActividadForm
            onClose={() => { setShowForm(false); setPlantillaInicial(undefined); }}
            initialData={plantillaInicial}
          />
        </div>
      )}

      {/* Personal activity form */}
      {showMiaForm && (
        <MiActividadForm onClose={() => setShowMiaForm(false)} />
      )}
    </div>
  );
};

export default Actividades;
