import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { useAuth } from '../hooks/useAuth';
import { getCampByCode, saveUserProfile } from '../services/firestore';
import { firestoreCampers } from '../services/firestore';
import { setLocalProfile } from '../utils/localProfile';
import {
  Tent, LogOut, ChevronDown, PlusCircle, MapPin, Calendar,
  User, Loader, ArrowLeft, Baby
} from 'lucide-react';
import type { Camper } from '../types';

// ─── Add Child Form ───────────────────────────────────────────────────────────
interface AddChildFormProps {
  campId: string;
  parentUid: string;
  onSave: (camper: Camper) => void;
  onCancel: () => void;
}

const AddChildForm = ({ campId, parentUid, onSave, onCancel }: AddChildFormProps) => {
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const newCamper: Camper = {
        id: crypto.randomUUID(),
        nombre: nombre.trim(),
        edad: parseInt(edad),
        parentUid,
        grupo: '',
        cabana: '',
        infoMedica: { alergias: [], medicacion: [], notas: '' },
        evaluaciones: [],
      };
      await firestoreCampers.save(campId, newCamper);
      onSave(newCamper);
    } catch (err) {
      console.error(err);
      setError('Error al guardar. Comprueba tu conexión.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <button onClick={onCancel} className="flex items-center gap-1 text-gray-500 text-sm mb-4 hover:text-gray-700">
        <ArrowLeft size={14} /> Volver
      </button>
      <h3 className="font-bold text-gray-900 text-lg mb-4">Añadir hijo/a al campamento</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
          <input
            type="text" required value={nombre} onChange={e => setNombre(e.target.value)}
            placeholder="Ej: María García"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
          <input
            type="number" required min={1} max={18} value={edad} onChange={e => setEdad(e.target.value)}
            placeholder="Ej: 10"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-xl flex items-center justify-center gap-2">
            {loading ? <><Loader size={16} className="animate-spin" /> Guardando...</> : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

// ─── Join Camp Form (for parents without a camp) ──────────────────────────────
interface JoinCampFormProps {
  user: { uid: string; email: string | null };
  onJoined: (campId: string) => void;
}

const JoinCampForm = ({ user, onJoined }: JoinCampFormProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const trimmed = code.trim().toUpperCase();
      if (!trimmed.startsWith('PAD-')) {
        setError('El código de padres empieza por PAD-');
        setLoading(false);
        return;
      }
      const camp = await getCampByCode(trimmed, 'family');
      if (!camp) { setError('Código no encontrado.'); setLoading(false); return; }

      setLocalProfile(user.uid, { role: 'parent', campId: camp.id });
      saveUserProfile({ uid: user.uid, campId: camp.id, role: 'parent', email: user.email || '', nombre: '' })
        .catch(() => {});
      onJoined(camp.id);
    } catch {
      setError('Error al verificar el código. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <Tent size={40} className="text-indigo-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Únete a un campamento</h2>
        <p className="text-gray-500 text-sm mb-6">Introduce el código PAD- que te ha dado el coordinador</p>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <input
            type="text" required value={code} onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="PAD-XXXXXX"
            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
          />
          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
          <button type="submit" disabled={loading || code.length < 4}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
            {loading ? <><Loader size={18} className="animate-spin" /> Verificando...</> : 'Acceder al campamento'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Main ParentDashboard ─────────────────────────────────────────────────────
const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { currentCamp, campers, addCamper } = useStore();
  const [showMenu, setShowMenu] = useState(false);
  const [addingChild, setAddingChild] = useState(false);
  const [joinedCampId, setJoinedCampId] = useState<string | null>(null);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Padre/Madre';
  const initial = displayName.charAt(0).toUpperCase();

  // My children = campers in this camp linked to my uid
  const myChildren = campers.filter(c => c.parentUid === user?.uid);

  const activeCampId = currentCamp?.id || joinedCampId;

  const handleLogout = async () => { await signOut(); navigate('/login'); };

  const formatDate = (d: Date | string) =>
    new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-indigo-600 text-white p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tent size={22} />
            <span className="text-lg font-bold">Kamplay</span>
            <span className="text-indigo-300 text-sm hidden sm:inline">· Familias</span>
          </div>
          <div className="flex items-center gap-3">
            {activeCampId && (
              <Link to="/join-camp"
                className="flex items-center gap-1.5 text-sm bg-white text-indigo-600 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50">
                <PlusCircle size={15} />
                <span className="hidden sm:inline">Otro campamento</span>
              </Link>
            )}
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-indigo-700">
                <div className="w-7 h-7 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-medium">
                  {initial}
                </div>
                <ChevronDown size={14} />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg py-2 text-gray-900 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium truncate">{displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 w-full">
                      <LogOut size={15} /> Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-6 px-4">
        {/* No camp yet */}
        {!activeCampId && user && (
          <JoinCampForm
            user={{ uid: user.uid, email: user.email }}
            onJoined={id => setJoinedCampId(id)}
          />
        )}

        {/* Has a camp */}
        {activeCampId && (
          <div className="space-y-6">
            {/* Camp info */}
            {currentCamp && (
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-3">{currentCamp.name}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-indigo-500" /> {currentCamp.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-indigo-500" />
                    {formatDate(currentCamp.startDate)} – {formatDate(currentCamp.endDate)}
                  </span>
                </div>
              </div>
            )}

            {/* Add child form */}
            {addingChild && user && (
              <AddChildForm
                campId={activeCampId}
                parentUid={user.uid}
                onSave={camper => { addCamper(camper); setAddingChild(false); }}
                onCancel={() => setAddingChild(false)}
              />
            )}

            {/* Children list */}
            {!addingChild && (
              <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Baby size={18} className="text-indigo-500" />
                    Mis hijos en este campamento
                  </h3>
                  <button
                    onClick={() => setAddingChild(true)}
                    className="flex items-center gap-1.5 text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700">
                    <PlusCircle size={14} /> Añadir hijo
                  </button>
                </div>

                {myChildren.length === 0 ? (
                  <div className="text-center py-8">
                    <Baby size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm mb-4">Aún no has añadido ningún hijo a este campamento.</p>
                    <button
                      onClick={() => setAddingChild(true)}
                      className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm hover:bg-indigo-700">
                      Añadir mi primer hijo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myChildren.map(child => (
                      <div key={child.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                          <User size={18} className="text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">{child.nombre}</p>
                          <p className="text-sm text-gray-500">{child.edad} años</p>
                        </div>
                        {child.grupo && (
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full shrink-0">
                            Grupo: {child.grupo}
                          </span>
                        )}
                        {child.cabana && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full shrink-0">
                            Cabaña: {child.cabana}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ParentDashboard;
