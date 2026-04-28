import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Star, ChevronRight, X, Users, Baby, ChevronLeft } from 'lucide-react';
import { getListedCamps } from '../services/directoryFirestore';
import { ZONAS } from '../components/coordinator/CampListingEditor';
import type { Camp } from '../types/camp';

const FILTER_ZONAS = ['Todas las zonas', ...ZONAS];

function formatDate(d: Date | string | undefined) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

function campDuration(start: Date, end: Date) {
  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
  return days === 1 ? '1 día' : `${days} días`;
}

function formatPrice(fee: number | undefined) {
  if (!fee || fee === 0) return 'Gratuito';
  return `${(fee / 100).toFixed(0)} €`;
}

const Stars = ({ rating, count }: { rating: number; count: number }) => {
  if (!count) return <span className="text-xs text-gray-400">Sin valoraciones aún</span>;
  const full = Math.floor(rating);
  const half = rating - full >= 0.4;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={13}
          className={
            i <= full
              ? 'text-amber-400 fill-amber-400'
              : i === full + 1 && half
              ? 'text-amber-300 fill-amber-300'
              : 'text-gray-200 fill-gray-200'
          }
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)} ({count})</span>
    </div>
  );
};

const PhotoGallery = ({ photos, name }: { photos: string[]; name: string }) => {
  const [idx, setIdx] = useState(0);
  if (!photos.length) return null;
  return (
    <div className="relative h-44 bg-gray-100 overflow-hidden">
      <img src={photos[idx]} alt={name} className="w-full h-full object-cover transition-opacity duration-300" />
      {photos.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + photos.length) % photos.length); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % photos.length); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition-colors"
          >
            <ChevronRight size={14} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setIdx(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const CampCard = ({ camp }: { camp: Partial<Camp> }) => {
  const [expanded, setExpanded] = useState(false);
  const isCampus = camp.type === 'campus';
  const now = new Date();
  const isActive = camp.startDate && camp.endDate
    ? new Date(camp.startDate) <= now && new Date(camp.endDate) >= now : false;
  const isUpcoming = camp.startDate ? new Date(camp.startDate) > now : false;
  const hasPhotos = (camp.photos?.length ?? 0) > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Header: photo or gradient */}
      {hasPhotos ? (
        <div className="relative">
          <PhotoGallery photos={camp.photos!} name={camp.name ?? ''} />
          <div className={`absolute top-3 left-3 flex items-center gap-2`}>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full shadow ${isCampus ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'}`}>
              {isCampus ? 'Campus' : 'Campamento'}
            </span>
            {isActive  && <span className="text-xs bg-green-500 text-white font-bold px-2 py-0.5 rounded-full animate-pulse shadow">Activo</span>}
            {isUpcoming && !isActive && <span className="text-xs bg-white/90 text-gray-700 font-medium px-2 py-0.5 rounded-full shadow">Próximo</span>}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 pt-6 pb-3">
            <h3 className="text-white font-extrabold text-base leading-tight line-clamp-1">{camp.name}</h3>
          </div>
        </div>
      ) : (
        <div className={`bg-gradient-to-r ${isCampus ? 'from-blue-500 to-indigo-600' : 'from-orange-400 to-amber-500'} px-5 py-4 flex items-start justify-between`}>
          <div className="flex-1 min-w-0">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isCampus ? 'bg-blue-900/30 text-blue-100' : 'bg-orange-900/30 text-orange-100'}`}>
              {isCampus ? 'Campus' : 'Campamento'}
            </span>
            <h3 className="text-white font-extrabold text-lg mt-1.5 leading-tight">{camp.name}</h3>
          </div>
          {isActive   && <span className="text-xs bg-green-400 text-white font-bold px-2 py-0.5 rounded-full ml-2 shrink-0 animate-pulse">Activo</span>}
          {isUpcoming && !isActive && <span className="text-xs bg-white/20 text-white font-medium px-2 py-0.5 rounded-full ml-2 shrink-0">Próximo</span>}
        </div>
      )}

      <div className="p-5 flex flex-col flex-1 gap-2.5">
        {/* Location + zone */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <MapPin size={13} className="text-gray-400 shrink-0" />
            <span className="truncate">{camp.location}</span>
          </div>
          {camp.zona && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{camp.zona}</span>}
        </div>

        {/* Dates */}
        {camp.startDate && camp.endDate && (
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Calendar size={13} className="text-gray-400 shrink-0" />
            <span>{formatDate(camp.startDate)} – {formatDate(camp.endDate)}</span>
            <span className="text-xs text-gray-400 ml-1">· {campDuration(new Date(camp.startDate), new Date(camp.endDate))}</span>
          </div>
        )}

        {/* Ages + capacity row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {(camp.ageMin != null || camp.ageMax != null) && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Baby size={13} className="text-gray-400 shrink-0" />
              <span>
                {camp.ageMin != null && camp.ageMax != null
                  ? `${camp.ageMin} – ${camp.ageMax} años`
                  : camp.ageMin != null
                  ? `Desde ${camp.ageMin} años`
                  : `Hasta ${camp.ageMax} años`}
              </span>
            </div>
          )}
          {camp.maxCampers != null && camp.maxCampers > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Users size={13} className="text-gray-400 shrink-0" />
              <span>{camp.maxCampers} plazas</span>
            </div>
          )}
        </div>

        {/* Stars */}
        <Stars rating={camp.avgRating ?? 0} count={camp.ratingCount ?? 0} />

        {/* Description */}
        {camp.description && (
          <p className={`text-sm text-gray-600 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
            {camp.description}
          </p>
        )}
        {camp.description && camp.description.length > 140 && (
          <button onClick={() => setExpanded(e => !e)} className="text-xs text-orange-500 hover:text-orange-700 font-medium text-left -mt-1">
            {expanded ? 'Mostrar menos' : 'Leer más'}
          </button>
        )}

        <div className="flex-1" />

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Inscripción</p>
            <p className="text-lg font-extrabold text-gray-900">{formatPrice(camp.inscriptionFee)}</p>
          </div>
          <Link
            to="/login"
            className={`flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl transition-colors ${
              isCampus ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            Me interesa <ChevronRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
};

const CampDirectory = () => {
  const [camps,      setCamps]      = useState<Partial<Camp>[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [filterType, setFilterType] = useState<'all' | 'campamento' | 'campus'>('all');
  const [filterZona, setFilterZona] = useState('Todas las zonas');
  const [filterTime, setFilterTime] = useState<'all' | 'upcoming' | 'active'>('all');

  useEffect(() => {
    getListedCamps()
      .then(data => { setCamps(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    return camps.filter(c => {
      if (search && !c.name?.toLowerCase().includes(search.toLowerCase()) &&
          !c.location?.toLowerCase().includes(search.toLowerCase()) &&
          !c.description?.toLowerCase().includes(search.toLowerCase()) &&
          !c.zona?.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterType !== 'all' && (c.type ?? 'campamento') !== filterType) return false;
      if (filterZona !== 'Todas las zonas' && c.zona !== filterZona) return false;
      if (filterTime === 'upcoming' && c.startDate && new Date(c.startDate) < now) return false;
      if (filterTime === 'active') {
        if (!c.startDate || !c.endDate) return false;
        if (new Date(c.startDate) > now || new Date(c.endDate) < now) return false;
      }
      return true;
    });
  }, [camps, search, filterType, filterZona, filterTime]);

  const hasFilters = filterType !== 'all' || filterZona !== 'Todas las zonas' || filterTime !== 'all' || search;
  const clearFilters = () => { setFilterType('all'); setFilterZona('Todas las zonas'); setFilterTime('all'); setSearch(''); };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="text-2xl">🏕️</span>
            <span className="text-lg font-extrabold text-gray-900">Kamplay</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 hidden sm:block">
              Iniciar sesión
            </Link>
            <Link to="/create-camp" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
              Soy coordinador
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 to-amber-600 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-orange-200 text-sm font-bold uppercase tracking-widest mb-4">Encuentra tu programa perfecto</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">Campamentos disponibles</h1>
          <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
            Programas verificados con fichas completas y valoraciones reales de otras familias.
          </p>
          <div className="relative max-w-lg mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Busca por nombre, lugar, zona o descripción..."
              className="w-full pl-11 pr-4 py-4 rounded-2xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filters + grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Type filter */}
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            {(['all', 'campamento', 'campus'] as const).map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === t ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                {t === 'all' ? 'Todos' : t === 'campamento' ? 'Campamentos' : 'Campus'}
              </button>
            ))}
          </div>

          {/* Zone filter */}
          <select value={filterZona} onChange={e => setFilterZona(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
            {FILTER_ZONAS.map(z => <option key={z}>{z}</option>)}
          </select>

          {/* Time filter */}
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            {([
              { id: 'all'      as const, label: 'Todos'    },
              { id: 'upcoming' as const, label: 'Próximos' },
              { id: 'active'   as const, label: 'En curso' },
            ]).map(({ id, label }) => (
              <button key={id} onClick={() => setFilterTime(id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterTime === id ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                {label}
              </button>
            ))}
          </div>

          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-xl hover:bg-gray-100">
              <X size={14} /> Limpiar
            </button>
          )}
          <span className="ml-auto text-sm text-gray-500 font-medium">
            {loading ? 'Cargando...' : `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                  <div className="h-3 bg-gray-100 rounded-full w-2/3" />
                  <div className="h-16 bg-gray-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🏕️</p>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {camps.length === 0 ? 'Aún no hay programas publicados' : 'Sin resultados'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {camps.length === 0 ? '¿Eres coordinador? Publica tu campamento o campus.' : 'Prueba a cambiar los filtros.'}
            </p>
            {hasFilters
              ? <button onClick={clearFilters} className="text-orange-500 hover:text-orange-700 font-semibold">Ver todos</button>
              : <Link to="/create-camp" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">Publicar mi programa</Link>
            }
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(c => <CampCard key={c.id} camp={c} />)}
          </div>
        )}

        {/* CTA for coordinators */}
        {!loading && camps.length > 0 && (
          <div className="mt-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-extrabold mb-2">¿Tienes un campamento o campus?</h2>
            <p className="text-orange-100 mb-6 max-w-md mx-auto text-sm">
              Publica tu programa aquí y llega a las familias que buscan exactamente lo que ofreces.
            </p>
            <Link to="/create-camp"
              className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-6 py-3 rounded-xl hover:bg-orange-50 shadow-md">
              Crear mi programa gratis <ChevronRight size={16} />
            </Link>
          </div>
        )}
      </div>

      <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white">
            <span>🏕️</span><span className="font-extrabold">Kamplay</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link to="/" className="hover:text-white">Inicio</Link>
            <Link to="/login" className="hover:text-white">Iniciar sesión</Link>
            <Link to="/create-camp" className="hover:text-white">Soy coordinador</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CampDirectory;
