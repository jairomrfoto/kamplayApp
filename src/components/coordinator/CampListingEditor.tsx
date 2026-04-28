import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Save, Loader, Globe, Star, CheckCircle, MapPin, Calendar, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/store';
import { updateCampListing } from '../../services/directoryFirestore';

const ZONAS = [
  'Madrid',
  'Cataluña',
  'Andalucía',
  'Valencia',
  'País Vasco',
  'Galicia',
  'Castilla y León',
  'Aragón',
  'Islas Canarias',
  'Islas Baleares',
  'Internacional',
];

const MAX_DESC = 500;

function formatDate(d: Date | string | undefined) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

const StarDisplay = ({ rating, count }: { rating: number; count: number }) => {
  if (!count) return <span className="text-xs text-gray-400">Sin valoraciones aún</span>;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)} <span className="text-gray-400">({count} valoracion{count !== 1 ? 'es' : ''})</span></span>
    </div>
  );
};

export default function CampListingEditor() {
  const { currentCamp, setCurrentCamp } = useStore();

  const [listed, setListed]       = useState(currentCamp?.listed ?? false);
  const [description, setDesc]    = useState(currentCamp?.description ?? '');
  const [zona, setZona]           = useState(currentCamp?.zona ?? '');
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    if (currentCamp) {
      setListed(currentCamp.listed ?? false);
      setDesc(currentCamp.description ?? '');
      setZona(currentCamp.zona ?? '');
    }
  }, [currentCamp?.id]);

  if (!currentCamp) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Globe size={32} className="mx-auto mb-3" />
        <p className="text-sm">Selecciona un campamento o campus para gestionar su anuncio.</p>
      </div>
    );
  }

  const isCampus = currentCamp.type === 'campus';

  const handleSave = async () => {
    if (listed && !zona) { setError('Elige una zona para publicar el anuncio.'); return; }
    if (listed && !description.trim()) { setError('Añade una descripción para publicar el anuncio.'); return; }
    setSaving(true);
    setError('');
    try {
      await updateCampListing(currentCamp.id, { listed, description, zona });
      setCurrentCamp({ ...currentCamp, listed, description, zona });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('Error al guardar. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const headerGradient = isCampus ? 'from-blue-500 to-indigo-600' : 'from-orange-400 to-amber-500';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-gray-900">Mi anuncio en el directorio</h2>
        <p className="text-sm text-gray-500 mt-1">
          Publica tu programa en el directorio público de Kamplay para que nuevas familias te encuentren.
        </p>
      </div>

      {/* Stats row if already listed */}
      {currentCamp.listed && (currentCamp.ratingCount ?? 0) > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
          <Star size={20} className="text-amber-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Valoraciones recibidas</p>
            <StarDisplay rating={currentCamp.avgRating ?? 0} count={currentCamp.ratingCount ?? 0} />
          </div>
        </div>
      )}

      {/* Toggle card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${listed ? 'bg-green-100' : 'bg-gray-100'}`}>
              {listed ? <Globe size={20} className="text-green-600" /> : <EyeOff size={20} className="text-gray-400" />}
            </div>
            <div>
              <p className="font-bold text-gray-900">{listed ? 'Anuncio publicado' : 'Anuncio no publicado'}</p>
              <p className="text-xs text-gray-500">
                {listed ? 'Las familias pueden encontrarte en el directorio.' : 'Solo tú puedes verlo por ahora.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setListed(l => !l)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${listed ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${listed ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-5">
        <h3 className="font-bold text-gray-900">Información del anuncio</h3>

        {/* Zona */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Zona geográfica <span className="text-red-500">*</span>
          </label>
          <select
            value={zona}
            onChange={e => setZona(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">Selecciona una zona</option>
            {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
          <p className="text-xs text-gray-400 mt-1">Ayuda a las familias de tu zona a encontrarte.</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Descripción del programa <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={e => setDesc(e.target.value.slice(0, MAX_DESC))}
            rows={5}
            placeholder={isCampus
              ? 'Ej: Campus de verano para niños de 6 a 12 años. Actividades deportivas, talleres creativos y excursiones guiadas. Profesores titulados y ratio 1:8. Desayuno y almuerzo incluidos...'
              : 'Ej: Campamento de aventura en plena naturaleza para jóvenes de 8 a 16 años. Senderismo, escalada, kayak y velada nocturna. Monitores con titulación oficial...'
            }
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-400">Cuéntales a las familias qué hace especial tu programa.</p>
            <span className={`text-xs ${description.length > MAX_DESC * 0.9 ? 'text-orange-500' : 'text-gray-400'}`}>
              {description.length}/{MAX_DESC}
            </span>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
        >
          {saved
            ? <><CheckCircle size={17} /> Guardado</>
            : saving
            ? <><Loader size={17} className="animate-spin" /> Guardando...</>
            : <><Save size={17} /> Guardar anuncio</>
          }
        </button>
      </div>

      {/* Preview */}
      <div>
        <h3 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
          <Eye size={15} /> Así verán tu anuncio las familias
        </h3>
        <div className="bg-white rounded-2xl shadow border border-stone-100 overflow-hidden opacity-90 pointer-events-none">
          <div className={`bg-gradient-to-r ${headerGradient} px-5 py-4`}>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isCampus ? 'bg-blue-900/30 text-blue-100' : 'bg-orange-900/30 text-orange-100'}`}>
              {isCampus ? 'Campus' : 'Campamento'}
            </span>
            <h3 className="text-white font-extrabold text-lg mt-1.5">{currentCamp.name}</h3>
          </div>
          <div className="p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={13} className="text-gray-400" />
              <span>{currentCamp.location}</span>
              {zona && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{zona}</span>}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={13} className="text-gray-400" />
              <span>{formatDate(currentCamp.startDate)} – {formatDate(currentCamp.endDate)}</span>
            </div>
            <StarDisplay rating={currentCamp.avgRating ?? 0} count={currentCamp.ratingCount ?? 0} />
            {description && (
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{description}</p>
            )}
            {!description && (
              <p className="text-sm text-gray-300 italic">Sin descripción todavía...</p>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <p className="text-lg font-extrabold text-gray-900">
                {currentCamp.inscriptionFee ? `${(currentCamp.inscriptionFee / 100).toFixed(0)} €` : 'Gratuito'}
              </p>
              <span className={`flex items-center gap-1 text-sm font-bold px-4 py-2 rounded-xl ${isCampus ? 'bg-blue-500 text-white' : 'bg-orange-500 text-white'}`}>
                Me interesa <ChevronRight size={15} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
