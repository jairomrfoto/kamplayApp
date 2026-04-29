import React, { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, X, Clock, MapPin,
  Users, Trash2, Edit2, BookOpen, Search,
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useStore } from '../store/store';
import { categorias } from '../utils/actividadesConfig';
import { actividadesEjemplo } from '../data/actividadesEjemplo';
import type { Actividad } from '../types';

// ── Layout constants ────────────────────────────────────────────────────────
const HOUR_START  = 8;
const HOUR_END    = 22;
const TOTAL_HOURS = HOUR_END - HOUR_START;
const ROW_PX      = 64;

// ── Category colors (bg / border / text) ────────────────────────────────────
const CAT_COLOR: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  manualidades: { bg: 'bg-amber-100',   border: 'border-amber-400',   text: 'text-amber-900',   dot: 'bg-amber-400'   },
  deportivas:   { bg: 'bg-green-100',   border: 'border-green-500',   text: 'text-green-900',   dot: 'bg-green-500'   },
  cohesion:     { bg: 'bg-blue-100',    border: 'border-blue-400',    text: 'text-blue-900',    dot: 'bg-blue-400'    },
  dinamicas:    { bg: 'bg-purple-100',  border: 'border-purple-400',  text: 'text-purple-900',  dot: 'bg-purple-400'  },
  naturaleza:   { bg: 'bg-emerald-100', border: 'border-emerald-500', text: 'text-emerald-900', dot: 'bg-emerald-500' },
  musica:       { bg: 'bg-pink-100',    border: 'border-pink-400',    text: 'text-pink-900',    dot: 'bg-pink-400'    },
  teatro:       { bg: 'bg-violet-100',  border: 'border-violet-400',  text: 'text-violet-900',  dot: 'bg-violet-400'  },
  ciencia:      { bg: 'bg-cyan-100',    border: 'border-cyan-500',    text: 'text-cyan-900',    dot: 'bg-cyan-500'    },
  cocina:       { bg: 'bg-orange-100',  border: 'border-orange-400',  text: 'text-orange-900',  dot: 'bg-orange-400'  },
  juegos:       { bg: 'bg-red-100',     border: 'border-red-400',     text: 'text-red-900',     dot: 'bg-red-400'     },
  gymkana:      { bg: 'bg-indigo-100',  border: 'border-indigo-400',  text: 'text-indigo-900',  dot: 'bg-indigo-400'  },
  veladas:      { bg: 'bg-slate-200',   border: 'border-slate-500',   text: 'text-slate-900',   dot: 'bg-slate-500'   },
};
const fallbackColor = { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-900', dot: 'bg-gray-400' };

// ── Date helpers ─────────────────────────────────────────────────────────────
const DAYS_ES   = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

function getMondayOf(d: Date) {
  const date = new Date(d);
  const dow = date.getDay();
  date.setDate(date.getDate() - (dow === 0 ? 6 : dow - 1));
  date.setHours(0, 0, 0, 0);
  return date;
}
function addDays(d: Date, n: number) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}
function fmtTime(d: Date) {
  return new Date(d).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}
function actTop(inicio: Date) {
  const mins = new Date(inicio).getHours() * 60 + new Date(inicio).getMinutes() - HOUR_START * 60;
  return Math.max(0, (mins / 60) * ROW_PX);
}
function actHeight(inicio: Date, fin: Date) {
  const mins = (new Date(fin).getTime() - new Date(inicio).getTime()) / 60000;
  return Math.max(22, (mins / 60) * ROW_PX - 2);
}

// ── Form types ───────────────────────────────────────────────────────────────
interface FormState {
  titulo: string;
  descripcion: string;
  categoria: string;
  duracion: number;
  ubicacion: string;
  inicio: Date;
  fin: Date;
  capacidadMaxima: number;
  edadMinima: number;
  edadMaxima: number;
}

function makeForm(inicio: Date, duracion = 60, base?: Partial<FormState>): FormState {
  return {
    titulo: '', descripcion: '', categoria: '', ubicacion: '',
    capacidadMaxima: 20, edadMinima: 6, edadMaxima: 16,
    ...base,
    duracion: base?.duracion ?? duracion,
    inicio,
    fin: new Date(inicio.getTime() + (base?.duracion ?? duracion) * 60000),
  };
}

type ModalTab = 'nueva' | 'mis' | 'biblioteca';

// ── AddEditModal ─────────────────────────────────────────────────────────────
interface AddEditModalProps {
  form: FormState;
  editingId: string | null;
  onClose: () => void;
  onSave: (form: FormState, editingId: string | null) => void;
  misActividades: any[];
}

const AddEditModal: React.FC<AddEditModalProps> = ({ form: initialForm, editingId, onClose, onSave, misActividades }) => {
  const [tab, setTab]   = useState<ModalTab>('nueva');
  const [form, setForm] = useState<FormState>(initialForm);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('todas');

  const applyTemplate = (t: any) => {
    const dur = t.duracion ?? 60;
    setForm(prev => ({
      ...prev,
      titulo: t.titulo ?? t.nombre ?? '',
      descripcion: t.descripcion ?? '',
      categoria: t.categoria ?? '',
      duracion: dur,
      ubicacion: t.ubicacion ?? prev.ubicacion,
      capacidadMaxima: t.capacidadMaxima ?? prev.capacidadMaxima,
      edadMinima: t.edadMinima ?? prev.edadMinima,
      edadMaxima: t.edadMaxima ?? prev.edadMaxima,
      fin: new Date(prev.inicio.getTime() + dur * 60000),
    }));
    setTab('nueva');
  };

  const filteredLib = useMemo(() => actividadesEjemplo.filter(a => {
    const mc = catFilter === 'todas' || a.categoria === catFilter;
    const ms = !search || a.titulo.toLowerCase().includes(search.toLowerCase()) ||
      (a.descripcion ?? '').toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  }), [search, catFilter]);

  const filteredMis = misActividades.filter(a =>
    !search || a.titulo.toLowerCase().includes(search.toLowerCase())
  );

  const inputCls = 'mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400';
  const labelCls = 'text-xs font-semibold text-gray-500 uppercase tracking-wide';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="font-bold text-gray-900 text-base">
            {editingId ? 'Editar actividad' : 'Añadir actividad'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs — only show when creating */}
        {!editingId && (
          <div className="flex border-b border-gray-100 px-5 flex-shrink-0">
            {(['nueva', 'mis', 'biblioteca'] as ModalTab[]).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setSearch(''); }}
                className={`py-3 px-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === t
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                {t === 'nueva' ? 'Nueva' : t === 'mis' ? 'Mis actividades' : 'Biblioteca'}
                {t === 'mis' && misActividades.length > 0 && (
                  <span className="ml-1.5 bg-orange-100 text-orange-600 text-xs px-1.5 py-0.5 rounded-full">
                    {misActividades.length}
                  </span>
                )}
                {t === 'biblioteca' && (
                  <span className="ml-1.5 bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded-full">
                    {actividadesEjemplo.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="overflow-y-auto flex-1 p-5">

          {/* ── Nueva / Edit form ── */}
          {(tab === 'nueva' || editingId) && (
            <form onSubmit={e => { e.preventDefault(); onSave(form, editingId); }} className="space-y-4">

              <div>
                <label className={labelCls}>Título *</label>
                <input
                  required value={form.titulo}
                  onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
                  className={inputCls} placeholder="Nombre de la actividad"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Categoría *</label>
                  <select
                    required value={form.categoria}
                    onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))}
                    className={inputCls}
                  >
                    <option value="">Seleccionar...</option>
                    {categorias.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Duración (min)</label>
                  <input
                    type="number" min={15} step={15} value={form.duracion}
                    onChange={e => {
                      const d = parseInt(e.target.value) || 60;
                      setForm(p => ({ ...p, duracion: d, fin: new Date(p.inicio.getTime() + d * 60000) }));
                    }}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Hora inicio</label>
                  <DatePicker
                    selected={form.inicio}
                    onChange={date => {
                      if (date) setForm(p => ({ ...p, inicio: date, fin: new Date(date.getTime() + p.duracion * 60000) }));
                    }}
                    showTimeSelect showTimeSelectOnly
                    timeIntervals={15} timeFormat="HH:mm" dateFormat="HH:mm"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Hora fin</label>
                  <DatePicker
                    selected={form.fin}
                    onChange={date => { if (date) setForm(p => ({ ...p, fin: date })); }}
                    showTimeSelect showTimeSelectOnly
                    timeIntervals={15} timeFormat="HH:mm" dateFormat="HH:mm"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Ubicación</label>
                <input
                  value={form.ubicacion}
                  onChange={e => setForm(p => ({ ...p, ubicacion: e.target.value }))}
                  className={inputCls} placeholder="Zona exterior, sala polivalente..."
                />
              </div>

              <div>
                <label className={labelCls}>Descripción</label>
                <textarea
                  rows={2} value={form.descripcion}
                  onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Capacidad</label>
                  <input type="number" min={1} value={form.capacidadMaxima}
                    onChange={e => setForm(p => ({ ...p, capacidadMaxima: parseInt(e.target.value) || 20 }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Edad mín.</label>
                  <input type="number" min={3} max={99} value={form.edadMinima}
                    onChange={e => setForm(p => ({ ...p, edadMinima: parseInt(e.target.value) || 6 }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Edad máx.</label>
                  <input type="number" min={3} max={99} value={form.edadMaxima}
                    onChange={e => setForm(p => ({ ...p, edadMaxima: parseInt(e.target.value) || 16 }))}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
                >
                  {editingId ? 'Guardar cambios' : 'Añadir al calendario'}
                </button>
              </div>
            </form>
          )}

          {/* ── Mis actividades ── */}
          {tab === 'mis' && !editingId && (
            <div className="space-y-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar..." className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              {filteredMis.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <BookOpen size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No tienes actividades guardadas todavía</p>
                </div>
              ) : (
                filteredMis.map((a: any) => {
                  const c = CAT_COLOR[a.categoria] ?? fallbackColor;
                  return (
                    <button key={a.id} onClick={() => applyTemplate(a)}
                      className="w-full text-left p-3 border border-gray-100 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.dot}`} />
                        <span className="font-semibold text-sm text-gray-900 group-hover:text-orange-700">{a.titulo}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 ml-4.5">{a.duracion} min · {a.campNombre}</p>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* ── Biblioteca ── */}
          {tab === 'biblioteca' && !editingId && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder={`Buscar en ${actividadesEjemplo.length} actividades...`}
                    className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400 max-w-[120px]"
                >
                  <option value="todas">Todas</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <p className="text-xs text-gray-400">{filteredLib.length} actividades</p>
              <div className="space-y-2">
                {filteredLib.slice(0, 60).map(a => {
                  const c = CAT_COLOR[a.categoria] ?? fallbackColor;
                  return (
                    <button key={a.id} onClick={() => applyTemplate(a)}
                      className="w-full text-left p-3 border border-gray-100 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.dot}`} />
                        <span className="font-semibold text-sm text-gray-900 group-hover:text-orange-700 truncate">{a.titulo}</span>
                        <span className={`ml-auto flex-shrink-0 text-xs px-1.5 py-0.5 rounded-md ${c.bg} ${c.text}`}>
                          {a.dificultad}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 ml-4 line-clamp-1">{a.descripcion}</p>
                      <p className="text-xs text-gray-300 mt-0.5 ml-4">{a.duracion} min · {a.ubicacion}</p>
                    </button>
                  );
                })}
                {filteredLib.length > 60 && (
                  <p className="text-xs text-center text-gray-400 py-2">
                    Mostrando 60 de {filteredLib.length}. Usa el buscador o filtra por categoría.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── EventPopover ─────────────────────────────────────────────────────────────
interface EventPopoverProps {
  actividad: Actividad;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const EventPopover: React.FC<EventPopoverProps> = ({ actividad, onClose, onDelete, onEdit }) => {
  const catLabel = categorias.find(c => c.id === actividad.categoria)?.nombre ?? actividad.categoria;
  const c = CAT_COLOR[actividad.categoria] ?? fallbackColor;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-2.5 min-w-0">
            <span className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${c.dot}`} />
            <div className="min-w-0">
              <h4 className="font-bold text-gray-900 leading-tight">{actividad.titulo}</h4>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 font-medium ${c.bg} ${c.text}`}>
                {catLabel}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2 text-sm mb-5">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={14} className="text-orange-400 flex-shrink-0" />
            <span>{fmtTime(actividad.inicio)} – {fmtTime(actividad.fin)} · {actividad.duracion} min</span>
          </div>
          {actividad.ubicacion && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={14} className="text-orange-400 flex-shrink-0" />
              <span>{actividad.ubicacion}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <Users size={14} className="text-orange-400 flex-shrink-0" />
            <span>Máx. {actividad.capacidadMaxima} · {actividad.edadMinima}–{actividad.edadMaxima} años</span>
          </div>
          {actividad.descripcion && (
            <p className="text-gray-400 text-xs mt-2 leading-relaxed pl-5">{actividad.descripcion}</p>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={onDelete}
            className="flex-1 py-2.5 border border-red-200 text-red-500 rounded-xl text-sm hover:bg-red-50 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Trash2 size={14} /> Eliminar
          </button>
          <button onClick={onEdit}
            className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm hover:bg-orange-600 flex items-center justify-center gap-1.5 transition-colors font-semibold"
          >
            <Edit2 size={14} /> Editar
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Calendario ───────────────────────────────────────────────────────────
const Calendario: React.FC = () => {
  const { actividades, addActividad, updateActividad, deleteActividad, misActividades } = useStore();

  const [weekStart, setWeekStart]         = useState(() => getMondayOf(new Date()));
  const [modalForm, setModalForm]         = useState<FormState | null>(null);
  const [editingId, setEditingId]         = useState<string | null>(null);
  const [popover, setPopover]             = useState<Actividad | null>(null);

  const today    = useMemo(() => new Date(), []);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const hours    = useMemo(() => Array.from({ length: TOTAL_HOURS }, (_, i) => HOUR_START + i), []);

  const weekLabel = useMemo(() => {
    const s = weekDays[0], e = weekDays[6];
    if (s.getMonth() === e.getMonth())
      return `${s.getDate()}–${e.getDate()} de ${MONTHS_ES[s.getMonth()]} ${s.getFullYear()}`;
    return `${s.getDate()} ${MONTHS_ES[s.getMonth()]} – ${e.getDate()} ${MONTHS_ES[e.getMonth()]} ${e.getFullYear()}`;
  }, [weekDays]);

  const actsByDay = useMemo(() => {
    const map: Record<number, Actividad[]> = {};
    weekDays.forEach((_, i) => { map[i] = []; });
    actividades.forEach(a => {
      weekDays.forEach((day, i) => {
        if (isSameDay(new Date(a.inicio), day)) map[i].push(a);
      });
    });
    return map;
  }, [actividades, weekDays]);

  const openAdd = (date: Date) => {
    setEditingId(null);
    setModalForm(makeForm(date));
  };

  const openEdit = (act: Actividad) => {
    setPopover(null);
    setEditingId(act.id);
    setModalForm(makeForm(new Date(act.inicio), act.duracion, {
      titulo: act.titulo, descripcion: act.descripcion ?? '',
      categoria: act.categoria, duracion: act.duracion,
      ubicacion: act.ubicacion, capacidadMaxima: act.capacidadMaxima,
      edadMinima: act.edadMinima, edadMaxima: act.edadMaxima,
      inicio: new Date(act.inicio), fin: new Date(act.fin),
    }));
  };

  const handleSave = (form: FormState, id: string | null) => {
    if (id) {
      const existing = actividades.find(a => a.id === id);
      if (existing) updateActividad({ ...existing, ...form });
    } else {
      addActividad({
        id: crypto.randomUUID(),
        titulo: form.titulo, descripcion: form.descripcion,
        inicio: form.inicio, fin: form.fin,
        grupo: '', monitores: [], materiales: [], tipo: 'regular',
        categoria: form.categoria, duracion: form.duracion,
        capacidadMaxima: form.capacidadMaxima, edadMinima: form.edadMinima,
        edadMaxima: form.edadMaxima, ubicacion: form.ubicacion,
      });
    }
    setModalForm(null);
    setEditingId(null);
  };

  const handleDelete = (act: Actividad) => {
    deleteActividad(act.id);
    setPopover(null);
  };

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Calendario de actividades</h2>
          <p className="text-sm text-gray-400 mt-0.5">{weekLabel}</p>
        </div>
        <button
          onClick={() => openAdd(new Date())}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl hover:bg-orange-600 font-semibold text-sm transition-colors shadow-sm shadow-orange-200"
        >
          <Plus size={17} /> Nueva actividad
        </button>
      </div>

      {/* ── Week navigation ── */}
      <div className="flex items-center gap-2">
        <button onClick={() => setWeekStart(d => addDays(d, -7))}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors">
          <ChevronLeft size={17} />
        </button>
        <button onClick={() => setWeekStart(getMondayOf(new Date()))}
          className="px-3 py-1.5 text-sm font-semibold text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
          Hoy
        </button>
        <button onClick={() => setWeekStart(d => addDays(d, 7))}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors">
          <ChevronRight size={17} />
        </button>
        <span className="text-sm text-gray-400 ml-1 hidden sm:inline">{weekLabel}</span>
      </div>

      {/* ── Calendar grid ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Day headers */}
        <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: '48px repeat(7, 1fr)' }}>
          <div />
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, today);
            return (
              <div key={i} className={`py-3 text-center border-l border-gray-100 ${isToday ? 'bg-orange-50' : ''}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide ${isToday ? 'text-orange-500' : 'text-gray-400'}`}>
                  {DAYS_ES[i]}
                </p>
                <p className={`text-base font-bold mt-0.5 w-8 h-8 flex items-center justify-center rounded-full mx-auto ${
                  isToday ? 'bg-orange-500 text-white' : 'text-gray-800'
                }`}>
                  {day.getDate()}
                </p>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="overflow-y-auto" style={{ maxHeight: 580 }}>
          <div className="grid" style={{ gridTemplateColumns: '48px repeat(7, 1fr)' }}>

            {/* Hour labels */}
            <div>
              {hours.map(h => (
                <div key={h} style={{ height: ROW_PX }}
                  className="border-b border-gray-50 flex items-start justify-end pr-2 pt-1">
                  <span className="text-xs text-gray-300 tabular-nums">{h}:00</span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, di) => {
              const isToday = isSameDay(day, today);
              return (
                <div key={di}
                  className={`relative border-l border-gray-100 ${isToday ? 'bg-orange-50/30' : ''}`}
                  style={{ height: TOTAL_HOURS * ROW_PX }}
                >
                  {/* Clickable hour slots */}
                  {hours.map(h => {
                    const slotDate = new Date(day);
                    slotDate.setHours(h, 0, 0, 0);
                    return (
                      <div key={h}
                        onClick={() => openAdd(slotDate)}
                        style={{ top: (h - HOUR_START) * ROW_PX, height: ROW_PX }}
                        className="absolute w-full border-b border-gray-50 hover:bg-orange-50/50 cursor-pointer group transition-colors"
                      >
                        <Plus size={11}
                          className="absolute right-1 top-1 text-orange-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    );
                  })}

                  {/* Activity blocks */}
                  {actsByDay[di]?.map(act => {
                    const top    = actTop(act.inicio);
                    const height = actHeight(act.inicio, act.fin);
                    const c      = CAT_COLOR[act.categoria] ?? fallbackColor;
                    return (
                      <div key={act.id}
                        onClick={e => { e.stopPropagation(); setPopover(act); }}
                        className={`absolute left-0.5 right-0.5 ${c.bg} ${c.text} border-l-[3px] ${c.border} rounded-r-lg px-1.5 py-1 cursor-pointer hover:brightness-95 transition-all z-10 shadow-sm overflow-hidden`}
                        style={{ top, height }}
                      >
                        <p className="font-semibold text-xs leading-tight truncate">{act.titulo}</p>
                        {height > 38 && (
                          <p className="text-xs opacity-60 mt-0.5 tabular-nums">{fmtTime(act.inicio)}</p>
                        )}
                        {height > 54 && act.ubicacion && (
                          <p className="text-xs opacity-50 truncate">{act.ubicacion}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Category legend ── */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
        {categorias.map(cat => {
          const c = CAT_COLOR[cat.id] ?? fallbackColor;
          const count = actividades.filter(a => a.categoria === cat.id).length;
          return (
            <div key={cat.id} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.dot}`} />
              <span className="text-xs text-gray-500">{cat.nombre}</span>
              {count > 0 && (
                <span className="text-xs font-semibold text-gray-400">({count})</span>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Add/Edit modal ── */}
      {modalForm && (
        <AddEditModal
          form={modalForm}
          editingId={editingId}
          onClose={() => { setModalForm(null); setEditingId(null); }}
          onSave={handleSave}
          misActividades={misActividades}
        />
      )}

      {/* ── Event popover ── */}
      {popover && (
        <EventPopover
          actividad={popover}
          onClose={() => setPopover(null)}
          onDelete={() => handleDelete(popover)}
          onEdit={() => openEdit(popover)}
        />
      )}
    </div>
  );
};

export default Calendario;
