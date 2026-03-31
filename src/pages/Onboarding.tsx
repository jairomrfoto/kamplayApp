import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tent, Users, UserCog, UserPlus, Loader } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { saveUserProfile, getUserProfile } from '../services/firestore';

type Role = 'coordinator' | 'monitor' | 'parent';

// ── localStorage helpers keyed by uid ────────────────────────────────────────
function localKey(uid: string) { return `kamplay_role_${uid}`; }

function getLocalRole(uid: string): Role | null {
  try {
    const val = localStorage.getItem(localKey(uid));
    return val as Role | null;
  } catch { return null; }
}

function setLocalRole(uid: string, role: Role) {
  try { localStorage.setItem(localKey(uid), role); } catch { /* ignore */ }
}

function redirectByRole(role: Role, navigate: (path: string) => void) {
  if (role === 'coordinator') navigate('/coordinator-dashboard');
  else if (role === 'monitor') navigate('/monitor-dashboard');
  else navigate('/parent-dashboard');
}

// ─────────────────────────────────────────────────────────────────────────────

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // On load: check localStorage first (instant), then Firestore (background)
  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }

    // 1. Instant check: localStorage
    const cached = getLocalRole(user.uid);
    if (cached) {
      redirectByRole(cached, navigate);
      return;
    }

    // 2. Firestore check (best effort, don't block forever)
    const timeout = setTimeout(() => setChecking(false), 5000); // max 5s wait
    getUserProfile(user.uid)
      .then(profile => {
        clearTimeout(timeout);
        if (profile?.role) {
          setLocalRole(user.uid, profile.role as Role);
          redirectByRole(profile.role as Role, navigate);
        } else {
          setChecking(false);
        }
      })
      .catch(() => {
        clearTimeout(timeout);
        setChecking(false);
      });

    return () => clearTimeout(timeout);
  }, [user, authLoading]);

  const handleRoleSelect = async (role: Role) => {
    if (!user) return;
    setSaving(true);
    setError('');

    // Save to localStorage immediately — no network needed
    setLocalRole(user.uid, role);

    // Try Firestore in background — don't block navigation
    const profile = {
      uid: user.uid,
      campId: '',
      role,
      email: user.email || '',
      nombre: user.displayName || user.email?.split('@')[0] || '',
    };
    saveUserProfile(profile).catch(() => {
      // Will retry next time they're online; localStorage keeps them going
    });

    // Navigate immediately
    redirectByRole(role, navigate);
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Tent className="h-12 w-12 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kamplay</h1>
            <p className="text-indigo-600 font-medium text-sm">Tu pasión, su felicidad</p>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-xl space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">¡Bienvenido!</h2>
            <p className="mt-2 text-gray-600">¿Cuál es tu rol en el campamento?</p>
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

          <button
            onClick={() => handleRoleSelect('coordinator')}
            disabled={saving}
            className="w-full flex items-center gap-4 bg-green-50 border-2 border-green-200 hover:border-green-500 text-gray-800 px-5 py-4 rounded-xl transition-all disabled:opacity-50"
          >
            <div className="bg-green-100 p-2 rounded-lg">
              <UserPlus size={24} className="text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Coordinador</p>
              <p className="text-sm text-gray-500">Creo y gestiono campamentos</p>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect('monitor')}
            disabled={saving}
            className="w-full flex items-center gap-4 bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-500 text-gray-800 px-5 py-4 rounded-xl transition-all disabled:opacity-50"
          >
            <div className="bg-indigo-100 p-2 rounded-lg">
              <UserCog size={24} className="text-indigo-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Monitor</p>
              <p className="text-sm text-gray-500">Accedo a mi panel y me uno al campamento</p>
            </div>
          </button>

          <button
            onClick={() => handleRoleSelect('parent')}
            disabled={saving}
            className="w-full flex items-center gap-4 bg-blue-50 border-2 border-blue-200 hover:border-blue-500 text-gray-800 px-5 py-4 rounded-xl transition-all disabled:opacity-50"
          >
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users size={24} className="text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Padre / Tutor</p>
              <p className="text-sm text-gray-500">Accedo a mi panel y me uno al campamento</p>
            </div>
          </button>

          {saving && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Loader size={16} className="animate-spin" /> Accediendo...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
