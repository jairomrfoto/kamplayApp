import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  X, Upload, FileText, CheckCircle, AlertCircle, Loader,
  Users, Group, Calendar, Info, ChevronRight, Trash2, RotateCcw,
} from 'lucide-react';
import { useStore } from '../../store/store';
import {
  parseDocument, validateFile, getAcceptedExtensions,
  type ParseDocumentResult, type ParsedAcampado, type ParsedGrupo, type ParsedActividad,
} from '../../services/documentParser';
import {
  firestoreCampers, firestoreGrupos, firestoreActividades,
} from '../../services/firestore';
import type { Camper, Grupo, Actividad } from '../../types';

// ── Helpers ────────────────────────────────────────────────────────────────────

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

function parseDate(fechaStr: string | null, horaStr: string | null, fallbackHour = 9): Date {
  const [h, m] = horaStr ? horaStr.split(':').map(Number) : [fallbackHour, 0];
  if (!fechaStr) {
    const d = new Date();
    d.setHours(h || fallbackHour, m || 0, 0, 0);
    return d;
  }
  const parts = fechaStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts.map(Number);
    return new Date(year, month - 1, day, h || fallbackHour, m || 0, 0);
  }
  return new Date();
}

function toCamper(p: ParsedAcampado): Camper {
  return {
    id: uid(),
    nombre: p.nombre,
    edad: p.edad ?? 0,
    grupo: p.grupo ?? '',
    cabana: p.cabana ?? '',
    contacto: p.contacto ?? '',
    infoMedica: {
      alergias: p.alergias ?? [],
      medicacion: p.medicacion ?? [],
      notas: p.notasMedicas ?? '',
    },
    evaluaciones: [],
  };
}

function toGrupo(p: ParsedGrupo, acampadoIdByName: Map<string, string>): Grupo {
  const acampados = (p.acampadosNombres ?? [])
    .map(name => {
      const lc = name.toLowerCase();
      for (const [k, v] of acampadoIdByName) {
        if (k.toLowerCase().includes(lc) || lc.includes(k.toLowerCase())) return v;
      }
      return null;
    })
    .filter(Boolean) as string[];

  return {
    id: uid(),
    nombre: p.nombre,
    edadMinima: p.edadMinima ?? 0,
    edadMaxima: p.edadMaxima ?? 18,
    monitores: p.monitores ?? [],
    acampados,
    evaluaciones: [],
  };
}

function toActividad(p: ParsedActividad): Actividad {
  const inicio = parseDate(p.fechaStr, p.horaInicio, 9);
  const fin = p.horaFin
    ? parseDate(p.fechaStr, p.horaFin, 10)
    : new Date(inicio.getTime() + (p.duracionMinutos ?? 60) * 60_000);

  return {
    id: uid(),
    titulo: p.titulo,
    inicio,
    fin,
    grupo: p.grupo ?? '',
    monitores: [],
    materiales: [],
    tipo: 'regular',
    categoria: p.categoria ?? 'otro',
    duracion: p.duracionMinutos ?? Math.round((fin.getTime() - inicio.getTime()) / 60_000),
    capacidadMaxima: 30,
    edadMinima: 6,
    edadMaxima: 18,
    descripcion: p.descripcion ?? '',
    ubicacion: p.ubicacion ?? '',
  };
}

// ── Processing messages ────────────────────────────────────────────────────────

const PROCESSING_MSGS = [
  'Leyendo el documento...',
  'Identificando participantes...',
  'Detectando grupos y equipos...',
  'Analizando horarios y actividades...',
  'Extrayendo información del campamento...',
  'Estructurando los datos...',
  'Finalizando análisis...',
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function AcampadoCard({ item, selected, onToggle }: {
  item: ParsedAcampado; selected: boolean; onToggle: () => void;
}) {
  return (
    <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
      selected ? 'border-orange-400 bg-orange-50' : 'border-gray-100 hover:border-gray-200 bg-white'
    }`}>
      <input type="checkbox" checked={selected} onChange={onToggle} className="mt-0.5 accent-orange-500 w-4 h-4 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm">{item.nombre}</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {item.edad != null && (
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{item.edad} años</span>
          )}
          {item.grupo && (
            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{item.grupo}</span>
          )}
          {item.cabana && (
            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">Cabaña: {item.cabana}</span>
          )}
        </div>
        {(item.alergias?.length > 0) && (
          <p className="text-xs text-red-600 mt-1">Alergias: {item.alergias.join(', ')}</p>
        )}
        {item.contacto && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{item.contacto}</p>
        )}
      </div>
    </label>
  );
}

function GrupoCard({ item, selected, onToggle }: {
  item: ParsedGrupo; selected: boolean; onToggle: () => void;
}) {
  return (
    <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
      selected ? 'border-orange-400 bg-orange-50' : 'border-gray-100 hover:border-gray-200 bg-white'
    }`}>
      <input type="checkbox" checked={selected} onChange={onToggle} className="mt-0.5 accent-orange-500 w-4 h-4 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-semibold text-gray-900 text-sm">{item.nombre}</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {(item.edadMinima != null || item.edadMaxima != null) && (
            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
              {item.edadMinima ?? '?'}-{item.edadMaxima ?? '?'} años
            </span>
          )}
          {item.acampadosNombres?.length > 0 && (
            <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
              {item.acampadosNombres.length} acampados
            </span>
          )}
        </div>
        {item.monitores?.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">Monitor(es): {item.monitores.join(', ')}</p>
        )}
      </div>
    </label>
  );
}

function ActividadCard({ item, selected, onToggle }: {
  item: ParsedActividad; selected: boolean; onToggle: () => void;
}) {
  const catColors: Record<string, string> = {
    deportes: 'bg-green-50 text-green-700',
    arte: 'bg-pink-50 text-pink-700',
    naturaleza: 'bg-emerald-50 text-emerald-700',
    juegos: 'bg-yellow-50 text-yellow-700',
    talleres: 'bg-blue-50 text-blue-700',
    otro: 'bg-gray-50 text-gray-600',
  };
  const catClass = catColors[item.categoria] ?? catColors.otro;

  return (
    <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
      selected ? 'border-orange-400 bg-orange-50' : 'border-gray-100 hover:border-gray-200 bg-white'
    }`}>
      <input type="checkbox" checked={selected} onChange={onToggle} className="mt-0.5 accent-orange-500 w-4 h-4 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-semibold text-gray-900 text-sm">{item.titulo}</p>
        <div className="flex flex-wrap gap-2 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full ${catClass}`}>{item.categoria}</span>
          {item.fechaStr && (
            <span className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">{item.fechaStr}</span>
          )}
          {item.horaInicio && (
            <span className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">
              {item.horaInicio}{item.horaFin ? ` - ${item.horaFin}` : ''}
            </span>
          )}
          {item.grupo && (
            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{item.grupo}</span>
          )}
        </div>
        {item.descripcion && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.descripcion}</p>
        )}
      </div>
    </label>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

type Step = 'upload' | 'processing' | 'preview' | 'importing' | 'done' | 'error';
type PreviewTab = 'acampados' | 'grupos' | 'actividades' | 'info';

interface Props {
  onClose: () => void;
}

export default function DocumentImportModal({ onClose }: Props) {
  const { currentCamp, loadFromFirestore } = useStore();

  // ── Step state ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('upload');
  const [errorMsg, setErrorMsg] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [processingMsg, setProcessingMsg] = useState(PROCESSING_MSGS[0]);
  const [parsed, setParsed] = useState<ParseDocumentResult | null>(null);
  const [activeTab, setActiveTab] = useState<PreviewTab>('acampados');
  const [importProgress, setImportProgress] = useState('');
  const [importStats, setImportStats] = useState({ acampados: 0, grupos: 0, actividades: 0 });

  // ── Selection state ─────────────────────────────────────────────────────────
  const [selAcampados, setSelAcampados] = useState<Set<number>>(new Set());
  const [selGrupos, setSelGrupos] = useState<Set<number>>(new Set());
  const [selActividades, setSelActividades] = useState<Set<number>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const msgIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Message cycling during processing ──────────────────────────────────────
  useEffect(() => {
    if (step === 'processing') {
      let idx = 0;
      msgIntervalRef.current = setInterval(() => {
        idx = (idx + 1) % PROCESSING_MSGS.length;
        setProcessingMsg(PROCESSING_MSGS[idx]);
      }, 2200);
    }
    return () => { if (msgIntervalRef.current) clearInterval(msgIntervalRef.current); };
  }, [step]);

  // ── File handling ───────────────────────────────────────────────────────────
  const handleFile = useCallback((f: File) => {
    const err = validateFile(f);
    if (err) { setErrorMsg(err); return; }
    setFile(f);
    setErrorMsg('');
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  // ── Analyze ─────────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!file) return;
    setStep('processing');
    setProcessingMsg(PROCESSING_MSGS[0]);
    try {
      const result = await parseDocument(file);
      setParsed(result);
      // Pre-select all items
      setSelAcampados(new Set(result.acampados.map((_, i) => i)));
      setSelGrupos(new Set(result.grupos.map((_, i) => i)));
      setSelActividades(new Set(result.actividades.map((_, i) => i)));
      // Auto-focus first non-empty tab
      if (result.acampados.length > 0) setActiveTab('acampados');
      else if (result.grupos.length > 0) setActiveTab('grupos');
      else if (result.actividades.length > 0) setActiveTab('actividades');
      else setActiveTab('info');
      setStep('preview');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar el documento.';
      setErrorMsg(msg);
      setStep('error');
    }
  };

  // ── Import ──────────────────────────────────────────────────────────────────
  const handleImport = async () => {
    if (!parsed || !currentCamp?.id) return;
    setStep('importing');

    const campId = currentCamp.id;
    let savedAcampados = 0;
    let savedGrupos = 0;
    let savedActividades = 0;

    try {
      // 1. Save selected acampados
      const camperObjects: Camper[] = [];
      const acampadoIdByName = new Map<string, string>();

      if (selAcampados.size > 0) {
        setImportProgress('Guardando acampados...');
        for (const idx of selAcampados) {
          const raw = parsed.acampados[idx];
          const camper = toCamper(raw);
          camperObjects.push(camper);
          acampadoIdByName.set(raw.nombre, camper.id);
          await firestoreCampers.save(campId, camper);
          savedAcampados++;
        }
      }

      // 2. Save selected grupos (with resolved camper IDs)
      if (selGrupos.size > 0) {
        setImportProgress('Guardando grupos...');
        for (const idx of selGrupos) {
          const grupo = toGrupo(parsed.grupos[idx], acampadoIdByName);
          await firestoreGrupos.save(campId, grupo);
          savedGrupos++;
        }
      }

      // 3. Save selected actividades
      if (selActividades.size > 0) {
        setImportProgress('Guardando actividades...');
        for (const idx of selActividades) {
          const actividad = toActividad(parsed.actividades[idx]);
          await firestoreActividades.save(campId, actividad);
          savedActividades++;
        }
      }

      setImportStats({ acampados: savedAcampados, grupos: savedGrupos, actividades: savedActividades });

      // Refresh store
      setImportProgress('Actualizando datos...');
      await loadFromFirestore(campId, true);

      setStep('done');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar los datos.';
      setErrorMsg(msg);
      setStep('error');
    }
  };

  // ── Toggle helpers ──────────────────────────────────────────────────────────
  const toggle = (set: Set<number>, idx: number) => {
    const next = new Set(set);
    if (next.has(idx)) next.delete(idx); else next.add(idx);
    return next;
  };

  const selectAll = (total: number) => new Set(Array.from({ length: total }, (_, i) => i));
  const deselectAll = () => new Set<number>();

  // ── Render ──────────────────────────────────────────────────────────────────

  const total = parsed
    ? selAcampados.size + selGrupos.size + selActividades.size
    : 0;

  const tabs: { key: PreviewTab; label: string; count: number; icon: React.ReactNode }[] = parsed ? [
    { key: 'acampados', label: 'Acampados', count: parsed.acampados.length, icon: <Users size={15} /> },
    { key: 'grupos', label: 'Grupos', count: parsed.grupos.length, icon: <Group size={15} /> },
    { key: 'actividades', label: 'Actividades', count: parsed.actividades.length, icon: <Calendar size={15} /> },
    { key: 'info', label: 'Info general', count: 0, icon: <Info size={15} /> },
  ] : [];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget && step !== 'importing') onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[95dvh] sm:max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
              <FileText size={18} className="text-orange-500" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base leading-tight">Importar documento</h2>
              <p className="text-xs text-gray-400">Sube tu documento y lo integramos automáticamente</p>
            </div>
          </div>
          {step !== 'importing' && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── STEP: upload ─────────────────────────────────────────────── */}
          {step === 'upload' && (
            <div className="p-6 space-y-5">
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                  dragOver ? 'border-orange-400 bg-orange-50' : file ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={getAcceptedExtensions()}
                  onChange={onInputChange}
                  className="hidden"
                />
                {file ? (
                  <>
                    <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                    <p className="font-semibold text-green-800">{file.name}</p>
                    <p className="text-xs text-green-600 mt-1">{(file.size / 1024).toFixed(0)} KB · listo para analizar</p>
                  </>
                ) : (
                  <>
                    <Upload size={40} className="text-gray-300 mx-auto mb-3" />
                    <p className="font-semibold text-gray-700">Arrastra el archivo aquí</p>
                    <p className="text-sm text-gray-400 mt-1">o haz clic para seleccionarlo</p>
                    <div className="flex justify-center gap-2 mt-4 flex-wrap">
                      {['PDF', 'DOCX', 'CSV', 'TXT'].map(t => (
                        <span key={t} className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">{t}</span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-300 mt-3">Máximo 4 MB</p>
                  </>
                )}
              </div>

              {/* What gets extracted */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-5">
                <p className="text-sm font-bold text-orange-900 mb-3">El sistema detecta y organiza automáticamente:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { icon: '👦', label: 'Acampados', desc: 'Nombre, edad, grupo, alergias, contacto de emergencia' },
                    { icon: '🏕️', label: 'Grupos', desc: 'Nombre, monitores asignados, acampados del grupo' },
                    { icon: '📅', label: 'Actividades', desc: 'Horario completo con fechas, horas y categorías' },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-2.5">
                      <span className="text-xl flex-shrink-0">{item.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-orange-800">{item.label}</p>
                        <p className="text-xs text-orange-600 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          )}

          {/* ── STEP: processing ─────────────────────────────────────────── */}
          {step === 'processing' && (
            <div className="p-12 flex flex-col items-center justify-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-orange-100 flex items-center justify-center">
                  <FileText size={32} className="text-orange-300" />
                </div>
                <Loader size={28} className="absolute -top-1 -right-1 text-orange-500 animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-800 text-lg">Procesando documento</p>
                <p className="text-sm text-gray-400 mt-1 transition-all">{processingMsg}</p>
              </div>
              <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-400 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          )}

          {/* ── STEP: preview ────────────────────────────────────────────── */}
          {step === 'preview' && parsed && (
            <div className="flex flex-col h-full">
              {/* Tabs */}
              <div className="flex gap-1 px-6 pt-4 border-b border-gray-100 overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-t-lg whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === tab.key
                        ? 'border-orange-500 text-orange-600 bg-orange-50'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                        activeTab === tab.key ? 'bg-orange-200 text-orange-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Select all / deselect */}
              {activeTab !== 'info' && (
                <div className="flex items-center justify-between px-6 py-2 bg-gray-50 border-b border-gray-100 flex-shrink-0">
                  <p className="text-xs text-gray-500">
                    {activeTab === 'acampados' && `${selAcampados.size} de ${parsed.acampados.length} seleccionados`}
                    {activeTab === 'grupos' && `${selGrupos.size} de ${parsed.grupos.length} seleccionados`}
                    {activeTab === 'actividades' && `${selActividades.size} de ${parsed.actividades.length} seleccionados`}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (activeTab === 'acampados') setSelAcampados(selectAll(parsed.acampados.length));
                        if (activeTab === 'grupos') setSelGrupos(selectAll(parsed.grupos.length));
                        if (activeTab === 'actividades') setSelActividades(selectAll(parsed.actividades.length));
                      }}
                      className="text-xs text-orange-600 hover:underline font-semibold"
                    >
                      Seleccionar todos
                    </button>
                    <span className="text-gray-300">·</span>
                    <button
                      onClick={() => {
                        if (activeTab === 'acampados') setSelAcampados(deselectAll());
                        if (activeTab === 'grupos') setSelGrupos(deselectAll());
                        if (activeTab === 'actividades') setSelActividades(deselectAll());
                      }}
                      className="text-xs text-gray-400 hover:underline"
                    >
                      Ninguno
                    </button>
                  </div>
                </div>
              )}

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">

                {activeTab === 'acampados' && (
                  parsed.acampados.length === 0
                    ? <EmptyState label="No se detectaron acampados en el documento" />
                    : parsed.acampados.map((item, i) => (
                      <AcampadoCard
                        key={i} item={item}
                        selected={selAcampados.has(i)}
                        onToggle={() => setSelAcampados(toggle(selAcampados, i))}
                      />
                    ))
                )}

                {activeTab === 'grupos' && (
                  parsed.grupos.length === 0
                    ? <EmptyState label="No se detectaron grupos en el documento" />
                    : parsed.grupos.map((item, i) => (
                      <GrupoCard
                        key={i} item={item}
                        selected={selGrupos.has(i)}
                        onToggle={() => setSelGrupos(toggle(selGrupos, i))}
                      />
                    ))
                )}

                {activeTab === 'actividades' && (
                  parsed.actividades.length === 0
                    ? <EmptyState label="No se detectaron actividades en el documento" />
                    : parsed.actividades.map((item, i) => (
                      <ActividadCard
                        key={i} item={item}
                        selected={selActividades.has(i)}
                        onToggle={() => setSelActividades(toggle(selActividades, i))}
                      />
                    ))
                )}

                {activeTab === 'info' && parsed.infoGeneral && (
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 space-y-3">
                    {parsed.infoGeneral.nombre && (
                      <InfoRow label="Nombre" value={parsed.infoGeneral.nombre} />
                    )}
                    {parsed.infoGeneral.fechaInicio && (
                      <InfoRow label="Fecha inicio" value={parsed.infoGeneral.fechaInicio} />
                    )}
                    {parsed.infoGeneral.fechaFin && (
                      <InfoRow label="Fecha fin" value={parsed.infoGeneral.fechaFin} />
                    )}
                    {parsed.infoGeneral.ubicacion && (
                      <InfoRow label="Ubicación" value={parsed.infoGeneral.ubicacion} />
                    )}
                    {parsed.infoGeneral.descripcion && (
                      <InfoRow label="Descripción" value={parsed.infoGeneral.descripcion} />
                    )}
                    {!Object.values(parsed.infoGeneral).some(Boolean) && (
                      <p className="text-sm text-gray-400 text-center py-4">No se detectó información general del campamento</p>
                    )}
                    <div className="pt-2 border-t border-orange-200">
                      <p className="text-xs text-orange-600">
                        Documento: <strong>{parsed.fileName}</strong> · {parsed.charCount.toLocaleString()} caracteres procesados
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP: importing ──────────────────────────────────────────── */}
          {step === 'importing' && (
            <div className="p-12 flex flex-col items-center justify-center gap-5">
              <Loader size={40} className="text-orange-500 animate-spin" />
              <div className="text-center">
                <p className="font-bold text-gray-800">Importando datos...</p>
                <p className="text-sm text-gray-400 mt-1">{importProgress}</p>
              </div>
            </div>
          )}

          {/* ── STEP: done ───────────────────────────────────────────────── */}
          {step === 'done' && (
            <div className="p-10 flex flex-col items-center gap-5 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-xl">¡Importación completada!</p>
                <p className="text-sm text-gray-400 mt-1">Todos los datos han sido guardados en la nube</p>
              </div>
              <div className="flex gap-4 flex-wrap justify-center">
                {importStats.acampados > 0 && (
                  <Stat emoji="👦" count={importStats.acampados} label="acampados" />
                )}
                {importStats.grupos > 0 && (
                  <Stat emoji="🏕️" count={importStats.grupos} label="grupos" />
                )}
                {importStats.actividades > 0 && (
                  <Stat emoji="📅" count={importStats.actividades} label="actividades" />
                )}
              </div>
            </div>
          )}

          {/* ── STEP: error ──────────────────────────────────────────────── */}
          {step === 'error' && (
            <div className="p-10 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">Error al procesar</p>
                <p className="text-sm text-gray-500 mt-1 max-w-sm">{errorMsg}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3 flex-shrink-0">
          {step === 'upload' && (
            <>
              <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium">
                Cancelar
              </button>
              <button
                onClick={handleAnalyze}
                disabled={!file}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                Procesar documento <ChevronRight size={15} />
              </button>
            </>
          )}

          {step === 'preview' && parsed && (
            <>
              <button
                onClick={() => { setFile(null); setStep('upload'); setErrorMsg(''); }}
                className="p-2.5 border border-gray-200 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                title="Cambiar archivo"
              >
                <RotateCcw size={16} />
              </button>
              <div className="flex-1 text-sm text-gray-500">
                <span className="font-semibold text-gray-800">{total}</span> elemento{total !== 1 ? 's' : ''} seleccionado{total !== 1 ? 's' : ''}
              </div>
              <button
                onClick={handleImport}
                disabled={total === 0}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2"
              >
                Importar {total > 0 ? total : ''} elemento{total !== 1 ? 's' : ''}
              </button>
            </>
          )}

          {step === 'done' && (
            <button onClick={onClose} className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-colors">
              Ir al panel de control
            </button>
          )}

          {step === 'error' && (
            <>
              <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                Cerrar
              </button>
              <button
                onClick={() => { setStep('upload'); setErrorMsg(''); }}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-colors"
              >
                Intentar de nuevo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Small helpers ──────────────────────────────────────────────────────────────

function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-12 text-center">
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-xs font-bold text-orange-700 w-24 flex-shrink-0">{label}</span>
      <span className="text-xs text-gray-700">{value}</span>
    </div>
  );
}

function Stat({ emoji, count, label }: { emoji: string; count: number; label: string }) {
  return (
    <div className="flex flex-col items-center bg-green-50 border border-green-100 rounded-2xl px-5 py-3">
      <span className="text-2xl">{emoji}</span>
      <span className="text-xl font-extrabold text-green-700">{count}</span>
      <span className="text-xs text-green-600">{label}</span>
    </div>
  );
}
