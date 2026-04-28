import React, { useState, useEffect } from 'react';
import { Star, Send, Check, X, Loader } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { submitRating, getMyRating } from '../../services/directoryFirestore';
import type { Camp } from '../../types/camp';

interface Props {
  camp: Camp;
}

const STORAGE_KEY = (uid: string, campId: string) => `kamplay_rated_${uid}_${campId}`;

export default function RateCampPrompt({ camp }: Props) {
  const { user } = useAuth();
  const [dismissed, setDismissed]   = useState(false);
  const [alreadyRated, setAlready]  = useState(false);
  const [hover, setHover]           = useState(0);
  const [selected, setSelected]     = useState(0);
  const [comentario, setComentario] = useState('');
  const [saving, setSaving]         = useState(false);
  const [done, setDone]             = useState(false);
  const [error, setError]           = useState('');

  const campEnded = camp.endDate && new Date(camp.endDate) < new Date();

  useEffect(() => {
    if (!user || !campEnded) return;
    // Check localStorage first (fast)
    if (localStorage.getItem(STORAGE_KEY(user.uid, camp.id))) {
      setAlready(true);
      return;
    }
    // Then check Firestore (slow, background)
    getMyRating(camp.id).then(r => {
      if (r) {
        setAlready(true);
        localStorage.setItem(STORAGE_KEY(user.uid, camp.id), '1');
      }
    });
  }, [user?.uid, camp.id]);

  if (!campEnded || dismissed || alreadyRated || !user) return null;

  const handleSubmit = async () => {
    if (!selected) return;
    setSaving(true);
    setError('');
    try {
      const name = user.displayName || user.email?.split('@')[0] || 'Familia';
      await submitRating(camp.id, {
        estrellas: selected as 1 | 2 | 3 | 4 | 5,
        comentario: comentario.trim() || undefined,
        autorNombre: name,
      });
      localStorage.setItem(STORAGE_KEY(user.uid, camp.id), '1');
      setDone(true);
    } catch {
      setError('Error al guardar. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
          <Check size={20} className="text-green-600" />
        </div>
        <div>
          <p className="font-bold text-green-900">¡Gracias por tu valoración!</p>
          <p className="text-sm text-green-700 mt-0.5">Tu opinión ayuda a otras familias a elegir el programa ideal.</p>
        </div>
      </div>
    );
  }

  const starLabel = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-amber-400 hover:text-amber-600"
      >
        <X size={16} />
      </button>

      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
          <Star size={20} className="text-amber-500" />
        </div>
        <div>
          <p className="font-bold text-amber-900">Valora {camp.name}</p>
          <p className="text-sm text-amber-700 mt-0.5">
            El programa ha terminado. ¿Qué te pareció? Tu opinión ayuda a otras familias.
          </p>
        </div>
      </div>

      {/* Stars */}
      <div className="flex items-center gap-2 mb-1">
        {[1, 2, 3, 4, 5].map(i => (
          <button
            key={i}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setSelected(i)}
            className="transition-transform hover:scale-110"
          >
            <svg
              className={`w-9 h-9 transition-colors ${i <= (hover || selected) ? 'text-amber-400' : 'text-gray-200'}`}
              fill="currentColor" viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
        {(hover || selected) > 0 && (
          <span className="text-sm font-semibold text-amber-700 ml-1">
            {starLabel[hover || selected]}
          </span>
        )}
      </div>

      {/* Comment */}
      {selected > 0 && (
        <div className="mt-3 space-y-3">
          <textarea
            value={comentario}
            onChange={e => setComentario(e.target.value.slice(0, 300))}
            rows={2}
            placeholder="Cuéntanos tu experiencia (opcional)..."
            className="w-full border border-amber-200 bg-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          />
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors"
          >
            {saving ? <><Loader size={14} className="animate-spin" /> Enviando...</> : <><Send size={14} /> Enviar valoración</>}
          </button>
        </div>
      )}
    </div>
  );
}
