import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { saveUserProfile, getUserProfile } from '../services/firestore';
import { getLocalProfile, setLocalProfile } from '../utils/localProfile';

type Role = 'coordinator' | 'monitor' | 'parent' | 'profesor';

function redirectByRole(role: Role, navigate: (path: string, opts?: object) => void, replace = false) {
  const opts = replace ? { replace: true } : undefined;
  if (role === 'coordinator') navigate('/coordinator-dashboard', opts);
  else if (role === 'monitor') navigate('/monitor-dashboard', opts);
  else if (role === 'profesor') navigate('/join-camp', opts);
  else navigate('/parent-dashboard', opts);
}

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }

    // Block unverified email accounts (Google is always verified)
    if (!user.emailVerified) { navigate('/login'); return; }

    // Admin shortcut — check admins collection (no email in client bundle)
    getDoc(doc(db, 'admins', user.uid)).then(snap => {
      if (!snap.exists()) return;
      const adminProfile = {
        uid: user.uid, campId: '',
        role: 'coordinator' as Role,
        email: user.email || '',
        nombre: user.displayName || user.email?.split('@')[0] || '',
      };
      setLocalProfile(user.uid, { role: 'coordinator', campId: '' });
      saveUserProfile(adminProfile).catch(() => {});
      navigate('/admin', { replace: true });
    }).catch(() => {});

    const cached = getLocalProfile(user.uid);
    if (cached?.role) {
      redirectByRole(cached.role, navigate, true);
      return;
    }

    const timeout = setTimeout(() => setChecking(false), 5000);
    getUserProfile(user.uid)
      .then(profile => {
        clearTimeout(timeout);
        if (profile?.role) {
          setLocalProfile(user.uid, { role: profile.role as Role, campId: profile.campId || '' });
          redirectByRole(profile.role as Role, navigate);
        } else {
          // First access after email verification — send welcome email once
          httpsCallable(getFunctions(undefined, 'europe-west1'), 'sendWelcomeEmail')({}).catch(() => {});
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

    setLocalProfile(user.uid, { role, campId: '' });

    const profile = {
      uid: user.uid,
      campId: '',
      role,
      email: user.email || '',
      nombre: user.displayName || user.email?.split('@')[0] || '',
    };
    saveUserProfile(profile).catch(() => {});

    redirectByRole(role, navigate);
  };

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  const roles = [
    {
      role: 'coordinator' as Role,
      emoji: '🛡️',
      label: 'Coordinador',
      desc: 'Creo y gestiono campamentos y campus',
      bg: 'bg-orange-50 hover:bg-orange-100 border-orange-200 hover:border-orange-400',
      dot: 'bg-orange-500',
    },
    {
      role: 'monitor' as Role,
      emoji: '⭐',
      label: 'Monitor',
      desc: 'Accedo a mi panel y me uno al programa',
      bg: 'bg-green-50 hover:bg-green-100 border-green-200 hover:border-green-400',
      dot: 'bg-green-500',
    },
    {
      role: 'parent' as Role,
      emoji: '❤️',
      label: 'Padre / Tutor',
      desc: 'Sigo el día a día de mi hijo en el programa',
      bg: 'bg-amber-50 hover:bg-amber-100 border-amber-200 hover:border-amber-400',
      dot: 'bg-amber-500',
    },
    {
      role: 'profesor' as Role,
      emoji: '🎓',
      label: 'Profesor / Profesora',
      desc: 'Accedo al campus o campamento de mi colegio',
      bg: 'bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-400',
      dot: 'bg-blue-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex flex-col justify-center py-12 px-4">
      <div className="mx-auto w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <div className="relative inline-block">
              <img src="/mascota.png" alt="Kiko" className="w-28 h-28 object-contain kiko-float" />
            </div>
          </div>
          <div className="inline-block bg-white border-2 border-orange-300 rounded-2xl px-4 py-2.5 shadow-md mb-5 relative">
            <p className="text-sm font-bold text-gray-800">¡Hola! Soy Kiko 👋 ¿Cuál es tu rol?</p>
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l-2 border-t-2 border-orange-300 rotate-45" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">¡Bienvenido a Kamplay!</h1>
          <p className="text-gray-500 mt-2">Elige tu perfil para acceder a tu panel</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 space-y-3">
          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{error}</p>}

          {roles.map(({ role, emoji, label, desc, bg }) => (
            <button
              key={role}
              onClick={() => handleRoleSelect(role)}
              disabled={saving}
              className={`w-full flex items-center gap-4 border-2 ${bg} px-5 py-4 rounded-xl transition-all duration-200 disabled:opacity-50 active:scale-98`}
            >
              <span className="text-3xl flex-shrink-0">{emoji}</span>
              <div className="text-left">
                <p className="font-bold text-gray-800">{label}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            </button>
          ))}

          {saving && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 pt-2">
              <Loader size={16} className="animate-spin" /> Accediendo...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
