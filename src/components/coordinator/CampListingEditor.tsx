import React, { useState, useEffect, useRef } from 'react';
import {
  Eye, EyeOff, Save, Loader, Globe, Star, CheckCircle,
  MapPin, Calendar, ChevronRight, Upload, X, Users, Baby,
} from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../config/firebase';
import { useStore } from '../../store/store';
import { updateCampListing } from '../../services/directoryFirestore';

export const ZONAS = [
  'Andalucía',
  'Aragón',
  'Asturias',
  'Islas Baleares',
  'Islas Canarias',
  'Cantabria',
  'Castilla-La Mancha',
  'Castilla y León',
  'Cataluña',
  'Extremadura',
  'Galicia',
  'La Rioja',
  'Madrid',
  'Murcia',
  'Navarra',
  'País Vasco',
  'Valencia',
  'Internacional',
];

const MAX_DESC  = 600;
const MAX_FOTOS = 3;

function formatDate(d: Date | string | undefined) {
  if (!d) return '—';
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
      <span className="text-sm text-gray-600 ml-1">
        {rating.toFixed(1)} <span className="text-gray-400">({count} valoracion{count !== 1 ? 'es' : ''})</span>
      </span>
    </div>
  );
};

export default function CampListingEditor() {
  const { currentCamp, setCurrentCamp } = useStore();

  const [listed,      setListed]      = useState(currentCamp?.listed ?? false);
  const [description, setDesc]        = useState(currentCamp?.description ?? '');
  const [zona,        setZona]        = useState(currentCamp?.zona ?? '');
  const [photos,      setPhotos]      = useState<string[]>(currentCamp?.photos ?? []);
  const [ageMin,      setAgeMin]      = useState<string>(currentCamp?.ageMin != null ? String(currentCamp.ageMin) : '');
  const [ageMax,      setAgeMax]      = useState<string>(currentCamp?.ageMax != null ? String(currentCamp.ageMax) : '');
  const [uploading,   setUploading]   = useState(false);
  const [uploadPct,   setUploadPct]   = useState(0);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentCamp) {
      setListed(currentCamp.listed ?? false);
      setDesc(currentCamp.description ?? '');
      setZona(currentCamp.zona ?? '');
      setPhotos(currentCamp.photos ?? []);
      setAgeMin(currentCamp.ageMin != null ? String(currentCamp.ageMin) : '');
      setAgeMax(currentCamp.ageMax != null ? String(currentCamp.ageMax) : '');
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = MAX_FOTOS - photos.length;
    const toUpload = files.slice(0, remaining);
    setUploading(true);
    setUploadPct(0);
    const urls: string[] = [];
    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i];
      const path = `campamentos/${currentCamp.id}/fotos/${Date.now()}_${file.name}`;
      const url = await new Promise<string>((resolve, reject) => {
        const task = uploadBytesResumable(ref(storage, path), file);
        task.on(
          'state_changed',
          snap => setUploadPct(Math.round(((i + snap.bytesTransferred / snap.totalBytes) / toUpload.length) * 100)),
          reject,
          async () => resolve(await getDownloadURL(task.snapshot.ref)),
        );
      });
      urls.push(url);
    }
    setPhotos(prev => [...prev, ...urls]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (idx: number) => setPhotos(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (listed && !zona)             { setError('Elige una zona geográfica para publicar el anuncio.'); return; }
    if (listed && !description.trim()) { setError('Añade una descripción para publicar el anuncio.'); return; }
    setSaving(true);
    setError('');
    try {
      const minVal = ageMin !== '' ? parseInt(ageMin, 10) : null;
      const maxVal = ageMax !== '' ? parseInt(ageMax, 10) : null;
      await updateCampListing(currentCamp.id, { listed, description, zona, photos, ageMin: minVal, ageMax: maxVal });
      setCurrentCamp({ ...currentCamp, listed, description, zona, photos, ageMin: minVal ?? undefined, ageMax: maxVal ?? undefined });
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
        <h2 className="text-xl font-extrabold text-gray-900">Mi anuncio en Campamentos disponibles</h2>
        <p className="text-sm text-gray-500 mt-1">
          Publica tu programa para que nuevas familias te encuentren desde la web de Kamplay.
        </p>
      </div>

      {/* Ratings banner */}
      {currentCamp.listed && (currentCamp.ratingCount ?? 0) > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
          <Star size={20} className="text-amber-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Valoraciones recibidas</p>
            <StarDisplay rating={currentCamp.avgRating ?? 0} count={currentCamp.ratingCount ?? 0} />
          </div>
        </div>
      )}

      {/* Publish toggle */}
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
            Comunidad autónoma <span className="text-red-500">*</span>
          </label>
          <select
            value={zona}
            onChange={e => setZona(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">Selecciona una comunidad autónoma</option>
            {ZONAS.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>

        {/* Age range */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Baby size={15} /> Rango de edades
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <input
                type="number" min={2} max={25} value={ageMin}
                onChange={e => setAgeMin(e.target.value)}
                placeholder="Mín."
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <span className="text-gray-400 font-medium">—</span>
            <div className="flex-1">
              <input
                type="number" min={2} max={25} value={ageMax}
                onChange={e => setAgeMax(e.target.value)}
                placeholder="Máx."
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <span className="text-sm text-gray-400 whitespace-nowrap">años</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Indica las edades a las que va dirigido.</p>
        </div>

        {/* Photos */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Upload size={15} /> Fotos del programa
            <span className="text-xs font-normal text-gray-400 ml-1">({photos.length}/{MAX_FOTOS})</span>
          </label>

          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {photos.map((url, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden aspect-video bg-gray-100">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {photos.length < MAX_FOTOS && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full border-2 border-dashed border-gray-300 hover:border-orange-400 rounded-xl py-4 flex flex-col items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    <span>Subiendo... {uploadPct}%</span>
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    <span>Añadir {photos.length > 0 ? 'más ' : ''}fotos</span>
                    <span className="text-xs text-gray-400">JPG, PNG · máx. {MAX_FOTOS - photos.length} foto{MAX_FOTOS - photos.length !== 1 ? 's' : ''}</span>
                  </>
                )}
              </button>
            </>
          )}
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
              : 'Ej: Campamento de aventura en plena naturaleza para jóvenes de 8 a 16 años. Senderismo, escalada, kayak y velada nocturna. Monitores con titulación oficial...'}
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
          disabled={saving || saved || uploading}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
        >
          {saved
            ? <><CheckCircle size={17} /> Guardado</>
            : saving
            ? <><Loader size={17} className="animate-spin" /> Guardando...</>
            : <><Save size={17} /> Guardar anuncio</>}
        </button>
      </div>

      {/* Preview */}
      <div>
        <h3 className="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
          <Eye size={15} /> Así verán tu anuncio las familias
        </h3>
        <div className="bg-white rounded-2xl shadow border border-stone-100 overflow-hidden opacity-90 pointer-events-none">
          {/* Photo hero */}
          {photos.length > 0 ? (
            <div className="relative h-40">
              <img src={photos[0]} alt="" className="w-full h-full object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-t ${isCampus ? 'from-indigo-900/70' : 'from-amber-900/70'} to-transparent`} />
              <div className="absolute bottom-0 left-0 px-5 py-4">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isCampus ? 'bg-blue-900/40 text-blue-100' : 'bg-orange-900/40 text-orange-100'}`}>
                  {isCampus ? 'Campus' : 'Campamento'}
                </span>
                <h3 className="text-white font-extrabold text-lg mt-1.5 leading-tight">{currentCamp.name}</h3>
              </div>
              {photos.length > 1 && (
                <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  +{photos.length - 1} foto{photos.length > 2 ? 's' : ''}
                </div>
              )}
            </div>
          ) : (
            <div className={`bg-gradient-to-r ${headerGradient} px-5 py-4`}>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isCampus ? 'bg-blue-900/30 text-blue-100' : 'bg-orange-900/30 text-orange-100'}`}>
                {isCampus ? 'Campus' : 'Campamento'}
              </span>
              <h3 className="text-white font-extrabold text-lg mt-1.5">{currentCamp.name}</h3>
            </div>
          )}

          <div className="p-5 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-gray-400" />
                <span>{currentCamp.location}</span>
              </div>
              {zona && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{zona}</span>}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Calendar size={13} className="text-gray-400" />
              <span>{formatDate(currentCamp.startDate)} – {formatDate(currentCamp.endDate)}</span>
            </div>
            {(ageMin || ageMax) && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Baby size={13} className="text-gray-400" />
                <span>
                  {ageMin && ageMax ? `${ageMin} – ${ageMax} años` : ageMin ? `Desde ${ageMin} años` : `Hasta ${ageMax} años`}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Users size={13} className="text-gray-400" />
              <span>{currentCamp.maxCampers} plazas</span>
            </div>
            <StarDisplay rating={currentCamp.avgRating ?? 0} count={currentCamp.ratingCount ?? 0} />
            {description ? (
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{description}</p>
            ) : (
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
