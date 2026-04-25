import React, { useState } from 'react';
import { X, Send, Loader } from 'lucide-react';
import { useStore } from '../../store/store';
import { useAuth } from '../../hooks/useAuth';

const EMOJIS = ['📢', '🏕️', '⭐', '🎉', '🏃', '🎨', '🍕', '⛅', '🌿', '💪', '🎶', '📸'];

interface Props {
  rol: 'coordinator' | 'monitor';
  onClose: () => void;
}

const NovedadForm = ({ rol, onClose }: Props) => {
  const { addNovedad, currentCamp } = useStore();
  const { user } = useAuth();
  const [texto, setTexto] = useState('');
  const [emoji, setEmoji] = useState('📢');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || !currentCamp || !user) return;
    setSaving(true);
    addNovedad({
      campId: currentCamp.id,
      texto: texto.trim(),
      autor: user.displayName || user.email?.split('@')[0] || 'Monitor',
      autorId: user.uid,
      rol,
      fecha: new Date(),
      emoji,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <h3 className="font-bold text-gray-800">Nueva novedad</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Emoji selector */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Icono</p>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`text-xl w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    emoji === e ? 'bg-orange-100 ring-2 ring-orange-400 scale-110' : 'bg-stone-50 hover:bg-orange-50'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Text */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Mensaje</p>
            <textarea
              required
              autoFocus
              rows={4}
              value={texto}
              onChange={e => setTexto(e.target.value)}
              placeholder="Ej: ¡Hoy hemos hecho una ruta de senderismo increíble! Los niños lo han dado todo 🥾"
              className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-400 text-right mt-1">{texto.length}/500</p>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-stone-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !texto.trim()}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              {saving ? <Loader size={15} className="animate-spin" /> : <Send size={15} />}
              Publicar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NovedadForm;
