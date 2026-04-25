import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Tent, Plus } from 'lucide-react';
import { useStore } from '../store/store';

interface Props {
  /** 'sidebar' = vertical compact style; 'header' = horizontal pill style */
  variant?: 'sidebar' | 'header';
}

const CampSwitcher = ({ variant = 'sidebar' }: Props) => {
  const { currentCamp, userCamps, switchCampFn } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSwitch = (campId: string) => {
    if (campId === currentCamp?.id) { setOpen(false); return; }
    switchCampFn?.(campId);
    setOpen(false);
  };

  const campName = currentCamp?.name || 'Sin campamento';

  if (variant === 'header') {
    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-3 py-1.5 rounded-lg text-white text-sm transition-colors"
        >
          <Tent size={14} />
          <span className="max-w-[140px] truncate">{campName}</span>
          {userCamps.length > 1 && <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />}
        </button>

        {open && (
          <div className="absolute top-full mt-1 left-0 bg-white rounded-xl shadow-xl border border-gray-100 w-64 z-50 overflow-hidden">
            <div className="p-2 space-y-0.5">
              {userCamps.map(camp => (
                <button
                  key={camp.id}
                  onClick={() => handleSwitch(camp.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                    camp.id === currentCamp?.id
                      ? 'bg-orange-50 text-orange-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <p className="text-sm font-medium leading-tight">{camp.name}</p>
                  {camp.location && <p className="text-xs text-gray-400 mt-0.5">{camp.location}</p>}
                </button>
              ))}
            </div>
            <div className="border-t p-2">
              <button
                onClick={() => { setOpen(false); navigate('/join-camp'); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-orange-600 text-sm transition-colors"
              >
                <Plus size={14} />
                Unirse a otro campamento
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // sidebar variant
  return (
    <div ref={ref} className="relative px-4 pb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 bg-orange-50 hover:bg-orange-100 px-3 py-2.5 rounded-lg transition-colors group"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Tent size={16} className="text-orange-600 flex-shrink-0" />
          <span className="text-sm font-medium text-orange-700 truncate">{campName}</span>
        </div>
        <ChevronDown
          size={14}
          className={`text-orange-500 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-4 right-4 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="p-1.5 space-y-0.5">
            {userCamps.map(camp => (
              <button
                key={camp.id}
                onClick={() => handleSwitch(camp.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                  camp.id === currentCamp?.id
                    ? 'bg-orange-50 text-orange-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <p className="text-sm font-medium leading-tight">{camp.name}</p>
                {camp.location && <p className="text-xs text-gray-400 mt-0.5">{camp.location}</p>}
              </button>
            ))}
          </div>
          <div className="border-t p-1.5">
            <button
              onClick={() => { setOpen(false); navigate('/join-camp'); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-orange-600 text-sm transition-colors"
            >
              <Plus size={14} />
              Unirse a otro campamento
            </button>
            <button
              onClick={() => { setOpen(false); navigate('/create-camp'); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-orange-600 text-sm transition-colors"
            >
              <Plus size={14} />
              Crear campamento
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampSwitcher;
