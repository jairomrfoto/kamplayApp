import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Check, X, Save, Loader } from 'lucide-react';
import { useStore } from '../store/store';
import { firestoreAsistencia, getDocRest } from '../services/firestore';
import type { Asistencia as AsistenciaType, RegistroAsistencia } from '../types';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr: string, n: number) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function formatDisplay(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

const Asistencia = () => {
  const { currentCamp, campers } = useStore();
  const [fecha, setFecha] = useState(todayStr());
  const [registros, setRegistros] = useState<RegistroAsistencia[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const campId = currentCamp?.id || '';

  const makeDefaultRegistros = useCallback(() =>
    campers.map(c => ({ acampadoId: c.id, nombre: c.nombre, presente: true, nota: '' })),
    [campers]
  );

  useEffect(() => {
    if (!campId) return;
    setLoading(true);
    setSaved(false);
    const id = `${campId}_${fecha}`;

    getDocRest(`campamentos/${campId}/asistencia/${id}`)
      .then(data => {
        if (data && Array.isArray(data.registros)) {
          setRegistros(data.registros as RegistroAsistencia[]);
        } else {
          setRegistros(makeDefaultRegistros());
        }
      })
      .catch(() => setRegistros(makeDefaultRegistros()))
      .finally(() => setLoading(false));
  }, [fecha, campId, makeDefaultRegistros]);

  const toggle = (id: string) => {
    setRegistros(prev => prev.map(r => r.acampadoId === id ? { ...r, presente: !r.presente } : r));
    setSaved(false);
  };

  const setNota = (id: string, nota: string) => {
    setRegistros(prev => prev.map(r => r.acampadoId === id ? { ...r, nota } : r));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!campId) return;
    setSaving(true);
    const record: AsistenciaType = {
      id: `${campId}_${fecha}`,
      campId,
      fecha,
      registros,
    };
    try {
      await firestoreAsistencia.save(campId, record);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const presentes = registros.filter(r => r.presente).length;
  const ausentes = registros.length - presentes;

  if (!currentCamp) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <p>No hay campamento seleccionado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800">Asistencia 📋</h2>
          <p className="text-sm text-gray-500 mt-0.5">Pasa lista diaria de participantes</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || campers.length === 0}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          {saving ? <Loader size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
          {saving ? 'Guardando...' : saved ? 'Guardado' : 'Guardar lista'}
        </button>
      </div>

      {/* Date navigator */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between gap-4">
        <button
          onClick={() => setFecha(addDays(fecha, -1))}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center flex-1">
          <p className="font-bold text-gray-900 capitalize text-sm sm:text-base">{formatDisplay(fecha)}</p>
          <input
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            className="mt-1.5 text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <button
          onClick={() => setFecha(addDays(fecha, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold text-gray-800">{registros.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold text-green-700">{presentes}</p>
          <p className="text-xs text-green-600 mt-0.5">Presentes</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-extrabold text-red-600">{ausentes}</p>
          <p className="text-xs text-red-500 mt-0.5">Ausentes</p>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader size={24} className="animate-spin text-orange-500" />
          </div>
        ) : registros.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-1">No hay participantes</p>
            <p className="text-sm">Añade participantes en la sección {currentCamp?.type === 'campus' ? 'Participantes' : 'Acampados'}.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {registros.map((r, i) => (
              <li key={r.acampadoId} className={`flex items-center gap-3 px-4 py-3 ${r.presente ? '' : 'bg-red-50/40'}`}>
                <span className="text-sm text-gray-400 w-6 text-right shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{r.nombre}</p>
                  {!r.presente && (
                    <input
                      type="text"
                      placeholder="Motivo de ausencia (opcional)"
                      value={r.nota || ''}
                      onChange={e => setNota(r.acampadoId, e.target.value)}
                      className="mt-1 w-full text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-400"
                    />
                  )}
                </div>
                <button
                  onClick={() => toggle(r.acampadoId)}
                  className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    r.presente
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-red-100 hover:bg-red-200 text-red-500'
                  }`}
                >
                  {r.presente ? <Check size={18} /> : <X size={18} />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Asistencia;
