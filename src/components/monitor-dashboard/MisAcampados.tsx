import React, { useState } from 'react';
import { useStore } from '../../store/store';
import { Users, Heart, ShieldAlert, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import type { Camper } from '../../types';

// ─── Medical info — visible only if coordinator granted permission ─────────────
const MedicalInfo = ({ info }: { info: Camper['infoMedica'] }) => {
  const hasInfo = info.alergias.length > 0 || info.medicacion.length > 0 || info.notas;
  if (!hasInfo) return <p className="text-xs text-gray-400 italic">Sin información médica registrada</p>;
  return (
    <div className="space-y-1.5 text-xs">
      {info.alergias.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center">
          <span className="text-gray-500 font-medium">Alergias:</span>
          {info.alergias.map((a, i) => (
            <span key={i} className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{a}</span>
          ))}
        </div>
      )}
      {info.medicacion.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center">
          <span className="text-gray-500 font-medium">Medicación:</span>
          {info.medicacion.map((m, i) => (
            <span key={i} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{m}</span>
          ))}
        </div>
      )}
      {info.notas && <p className="text-gray-600 italic">{info.notas}</p>}
    </div>
  );
};

// ─── Single camper card ───────────────────────────────────────────────────────
const CamperCard = ({ camper, canSeeMedical }: { camper: Camper; canSeeMedical: boolean }) => {
  const [open, setOpen] = useState(false);
  const hasMedical = camper.infoMedica.alergias.length > 0 || camper.infoMedica.medicacion.length > 0 || camper.infoMedica.notas;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setOpen(!open)}
      >
        <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-semibold text-sm shrink-0">
          {camper.nombre.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{camper.nombre}</p>
          <p className="text-xs text-gray-500">{camper.edad} años
            {camper.cabana && <span className="ml-2">· Cabaña {camper.cabana}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasMedical && (
            <Heart size={14} className={canSeeMedical ? 'text-red-400' : 'text-gray-300'} />
          )}
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
            <Heart size={13} className="text-red-400" /> Información médica
          </p>
          {canSeeMedical ? (
            <MedicalInfo info={camper.infoMedica} />
          ) : (
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
              <Lock size={13} />
              <span>El coordinador no te ha concedido acceso a la información médica.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const MisAcampados = () => {
  const { campers, currentMonitor, currentCamp } = useStore();
  const [search, setSearch] = useState('');

  if (!currentCamp) {
    return (
      <div className="p-6 text-center">
        <Users size={32} className="text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Sin campamento vinculado.</p>
      </div>
    );
  }

  const canSeeMedical = currentMonitor?.permisos?.editarAreaMedica ?? false;

  // Filter campers by monitor's assigned group; if no group, show all
  const groupName = currentMonitor?.grupoAsignado;
  const myCampers = groupName
    ? campers.filter(c => c.grupo === groupName)
    : campers;

  const filtered = myCampers.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 p-4">
      {/* Permission banner */}
      {!canSeeMedical && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <ShieldAlert size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Acceso médico restringido</p>
            <p className="text-xs mt-0.5">El coordinador no te ha concedido permiso para ver información médica. Contacta con él si lo necesitas.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-gray-900">
            {groupName ? `Grupo: ${groupName}` : 'Todos los acampados'}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">{filtered.length} acampados</p>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar acampado..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
      />

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-10">
          <Users size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            {myCampers.length === 0 ? 'No hay acampados en tu grupo.' : 'No hay resultados.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(camper => (
            <CamperCard key={camper.id} camper={camper} canSeeMedical={canSeeMedical} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MisAcampados;
