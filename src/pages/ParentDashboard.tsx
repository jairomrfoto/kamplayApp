import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { useAuth } from '../hooks/useAuth';
import { getCampByCode, saveUserProfile, firestoreCampers } from '../services/firestore';
import { updateLocalCamp } from '../utils/localProfile';
import {
  Tent, LogOut, ChevronDown, PlusCircle, MapPin, Calendar,
  User, Loader, ArrowLeft, Baby, Heart, Pencil, X, Plus, Check,
  UtensilsCrossed, Baby as ChildIcon, Newspaper, MessageCircle,
} from 'lucide-react';
import type { Camper } from '../types';
import NovedadesFeed from '../components/novedades/NovedadesFeed';
import CampPaymentButton from '../components/stripe/CampPaymentButton';
import ChatPanel from '../components/chat/ChatPanel';
import RateCampPrompt from '../components/parent/RateCampPrompt';

// ─── Medical Info Editor ──────────────────────────────────────────────────────
interface MedicalEditorProps {
  child: Camper;
  campId: string;
  onClose: () => void;
}

const MedicalEditor = ({ child, campId, onClose }: MedicalEditorProps) => {
  const { updateCamper } = useStore();
  const [alergias, setAlergias] = useState<string[]>(child.infoMedica.alergias);
  const [medicacion, setMedicacion] = useState<string[]>(child.infoMedica.medicacion);
  const [notas, setNotas] = useState(child.infoMedica.notas);
  const [newAlergia, setNewAlergia] = useState('');
  const [newMed, setNewMed] = useState('');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const updated: Camper = {
      ...child,
      infoMedica: { alergias, medicacion, notas },
    };
    // updateCamper saves to Firestore → real-time listeners notify monitors & coordinator
    await firestoreCampers.save(campId, updated).catch(console.error);
    updateCamper(updated);
    setLoading(false);
    setSaved(true);
    setTimeout(onClose, 800);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Info médica de {child.nombre}</h3>
            <p className="text-xs text-gray-500 mt-0.5">Visible para monitores y coordinador</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Alergias */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Alergias</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {alergias.map((a, i) => (
                <span key={i} className="flex items-center gap-1 bg-red-100 text-red-700 text-xs px-2.5 py-1 rounded-full">
                  {a}
                  <button onClick={() => setAlergias(alergias.filter((_, j) => j !== i))}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text" value={newAlergia} onChange={e => setNewAlergia(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && newAlergia.trim()) { setAlergias([...alergias, newAlergia.trim()]); setNewAlergia(''); } }}
                placeholder="Ej: cacahuetes, penicilina..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button
                onClick={() => { if (newAlergia.trim()) { setAlergias([...alergias, newAlergia.trim()]); setNewAlergia(''); } }}
                className="bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200">
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Medicación */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Medicación necesaria</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {medicacion.map((m, i) => (
                <span key={i} className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full">
                  {m}
                  <button onClick={() => setMedicacion(medicacion.filter((_, j) => j !== i))}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text" value={newMed} onChange={e => setNewMed(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && newMed.trim()) { setMedicacion([...medicacion, newMed.trim()]); setNewMed(''); } }}
                placeholder="Ej: Ventolín (asma), Insulina..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button
                onClick={() => { if (newMed.trim()) { setMedicacion([...medicacion, newMed.trim()]); setNewMed(''); } }}
                className="bg-blue-100 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-200">
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Otras notas médicas</label>
            <textarea
              value={notas} onChange={e => setNotas(e.target.value)}
              rows={3} placeholder="Ej: Lleva epipen en la mochila. Diabético tipo 1..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>
        </div>

        <div className="p-5 border-t border-gray-100">
          <button
            onClick={handleSave} disabled={loading || saved}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
            {saved ? <><Check size={18} /> Guardado</> : loading ? <><Loader size={18} className="animate-spin" /> Guardando...</> : 'Guardar info médica'}
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">
            Los monitores y el coordinador verán este cambio inmediatamente
          </p>
        </div>
      </div>
    </div>
  );
};

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
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
          <input
            type="number" required min={1} max={18} value={edad} onChange={e => setEdad(e.target.value)}
            placeholder="Ej: 10"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-2.5 rounded-xl flex items-center justify-center gap-2">
            {loading ? <><Loader size={16} className="animate-spin" /> Guardando...</> : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  );
};

// ─── Join Camp Form ───────────────────────────────────────────────────────────
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

      updateLocalCamp(user.uid, camp.id, camp);
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
        <Tent size={40} className="text-orange-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Únete a un campamento</h2>
        <p className="text-gray-500 text-sm mb-6">Introduce el código PAD- que te ha dado el coordinador</p>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <input
            type="text" required value={code} onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="PAD-XXXXXX"
            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-center text-xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-orange-400 uppercase"
          />
          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
          <button type="submit" disabled={loading || code.length < 4}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
            {loading ? <><Loader size={18} className="animate-spin" /> Verificando...</> : 'Acceder al campamento'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Main ParentDashboard ─────────────────────────────────────────────────────
const MenuCalendar = () => {
  const { menus, currentCamp } = useStore();
  const upcomingMenus = menus
    .filter(m => m.fecha && new Date(m.fecha) >= new Date(new Date().setHours(0,0,0,0)))
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .slice(0, 7);

  const formatDay = (d: Date | string) =>
    new Date(d).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });

  if (!currentCamp) return null;

  if (upcomingMenus.length === 0) {
    return (
      <div className="text-center py-8">
        <UtensilsCrossed size={32} className="text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">El coordinador aún no ha publicado el menú.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {upcomingMenus.map(menu => (
        <div key={menu.id} className="border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-orange-700 capitalize mb-3">{formatDay(menu.fecha)}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {menu.comidas.desayuno && (
              <div className="bg-yellow-50 rounded-lg p-2">
                <p className="font-medium text-yellow-800 mb-1">Desayuno</p>
                <p className="text-gray-600">{menu.comidas.desayuno}</p>
              </div>
            )}
            {menu.comidas.almuerzo && (
              <div className="bg-orange-50 rounded-lg p-2">
                <p className="font-medium text-orange-800 mb-1">Almuerzo</p>
                <p className="text-gray-600">{menu.comidas.almuerzo}</p>
              </div>
            )}
            {menu.comidas.merienda && (
              <div className="bg-green-50 rounded-lg p-2">
                <p className="font-medium text-green-800 mb-1">Merienda</p>
                <p className="text-gray-600">{menu.comidas.merienda}</p>
              </div>
            )}
            {menu.comidas.cena && (
              <div className="bg-blue-50 rounded-lg p-2">
                <p className="font-medium text-blue-800 mb-1">Cena</p>
                <p className="text-gray-600">{menu.comidas.cena}</p>
              </div>
            )}
          </div>
          {menu.alergenos && menu.alergenos.length > 0 && (
            <p className="text-xs text-red-600 mt-2">⚠ Alérgenos: {menu.alergenos.join(', ')}</p>
          )}
        </div>
      ))}
    </div>
  );
};

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { currentCamp, campers, addCamper } = useStore();
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'children' | 'novedades' | 'menu' | 'chat'>('novedades');
  const [addingChild, setAddingChild] = useState(false);
  const [editingMedical, setEditingMedical] = useState<Camper | null>(null);
  const [joinedCampId, setJoinedCampId] = useState<string | null>(null);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Padre/Madre';
  const initial = displayName.charAt(0).toUpperCase();
  const myChildren = campers.filter(c => c.parentUid === user?.uid);
  const activeCampId = currentCamp?.id || joinedCampId;

  const handleLogout = async () => { await signOut(); navigate('/login'); };
  const formatDate = (d: Date | string) =>
    new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏕️</span>
            <span className="text-lg font-extrabold">Kamplay</span>
            <span className="text-green-300 text-sm hidden sm:inline">· Familias</span>
          </div>
          <div className="flex items-center gap-3">
            {activeCampId && (
              <Link to="/join-camp"
                className="flex items-center gap-1.5 text-sm bg-white text-orange-600 font-medium px-3 py-1.5 rounded-lg hover:bg-orange-50">
                <PlusCircle size={15} />
                <span className="hidden sm:inline">Otro campamento</span>
              </Link>
            )}
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-orange-600">
                <div className="w-7 h-7 bg-orange-400 rounded-full flex items-center justify-center text-sm font-medium">
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
        {!activeCampId && user && (
          <JoinCampForm
            user={{ uid: user.uid, email: user.email }}
            onJoined={id => setJoinedCampId(id)}
          />
        )}

        {activeCampId && (
          <div className="space-y-6">
            {currentCamp && (
              <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
                <h2 className="text-lg font-bold text-gray-900">{currentCamp.name}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-orange-500" /> {currentCamp.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-orange-500" />
                    {formatDate(currentCamp.startDate)} – {formatDate(currentCamp.endDate)}
                  </span>
                </div>
                {currentCamp.inscriptionFee && currentCamp.inscriptionFee > 0 && (
                  <CampPaymentButton
                    campId={currentCamp.id}
                    campName={currentCamp.name}
                    inscriptionFee={currentCamp.inscriptionFee}
                  />
                )}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setActiveTab('novedades')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === 'novedades' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <Newspaper size={15} /> Novedades
              </button>
              <button
                onClick={() => setActiveTab('children')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === 'children' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <Baby size={15} /> Mis hijos
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === 'menu' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <UtensilsCrossed size={15} /> Menú
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === 'chat' ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                <MessageCircle size={15} /> Chat
              </button>
            </div>

            {/* Rating prompt — shown after camp ends */}
            {currentCamp && <RateCampPrompt camp={currentCamp} />}

            {/* Novedades tab */}
            {activeTab === 'novedades' && (
              <NovedadesFeed rol="parent" />
            )}

            {/* Menu tab */}
            {activeTab === 'menu' && (
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <UtensilsCrossed size={18} className="text-orange-500" /> Menú del campamento
                </h3>
                <MenuCalendar />
              </div>
            )}

            {/* Chat tab */}
            {activeTab === 'chat' && (
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageCircle size={18} className="text-orange-500" /> Chat del campamento
                </h3>
                <ChatPanel
                  userRole="parent"
                  userName={displayName}
                />
              </div>
            )}

            {activeTab === 'children' && addingChild && user && (
              <AddChildForm
                campId={activeCampId}
                parentUid={user.uid}
                onSave={camper => { addCamper(camper); setAddingChild(false); }}
                onCancel={() => setAddingChild(false)}
              />
            )}

            {activeTab === 'children' && !addingChild && (
              <div className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Baby size={18} className="text-orange-500" />
                    Mis hijos en este campamento
                  </h3>
                  <button onClick={() => setAddingChild(true)}
                    className="flex items-center gap-1.5 text-sm bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600">
                    <PlusCircle size={14} /> Añadir hijo
                  </button>
                </div>

                {myChildren.length === 0 ? (
                  <div className="text-center py-8">
                    <Baby size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm mb-4">Aún no has añadido ningún hijo a este campamento.</p>
                    <button onClick={() => setAddingChild(true)}
                      className="bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm hover:bg-orange-600">
                      Añadir mi primer hijo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myChildren.map(child => (
                      <div key={child.id} className="border border-gray-200 rounded-xl overflow-hidden">
                        {/* Child header */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                            <User size={18} className="text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900">{child.nombre}</p>
                            <p className="text-sm text-gray-500">{child.edad} años
                              {child.grupo && <span className="ml-2">· Grupo: {child.grupo}</span>}
                              {child.cabana && <span className="ml-2">· Cabaña: {child.cabana}</span>}
                            </p>
                          </div>
                          <button
                            onClick={() => setEditingMedical(child)}
                            className="flex items-center gap-1.5 text-xs bg-white border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 shrink-0">
                            <Heart size={13} className="text-red-400" /> Info médica
                          </button>
                        </div>

                        {/* Medical info summary */}
                        {(child.infoMedica.alergias.length > 0 || child.infoMedica.medicacion.length > 0 || child.infoMedica.notas) && (
                          <div className="px-4 py-3 space-y-2 text-sm">
                            {child.infoMedica.alergias.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 items-center">
                                <span className="text-xs text-gray-500 font-medium">Alergias:</span>
                                {child.infoMedica.alergias.map((a, i) => (
                                  <span key={i} className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">{a}</span>
                                ))}
                              </div>
                            )}
                            {child.infoMedica.medicacion.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 items-center">
                                <span className="text-xs text-gray-500 font-medium">Medicación:</span>
                                {child.infoMedica.medicacion.map((m, i) => (
                                  <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{m}</span>
                                ))}
                              </div>
                            )}
                            {child.infoMedica.notas && (
                              <p className="text-gray-600 text-xs italic">{child.infoMedica.notas}</p>
                            )}
                          </div>
                        )}

                        {!child.infoMedica.alergias.length && !child.infoMedica.medicacion.length && !child.infoMedica.notas && (
                          <div className="px-4 py-3">
                            <button onClick={() => setEditingMedical(child)}
                              className="flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-800">
                              <Pencil size={12} /> Añadir información médica
                            </button>
                          </div>
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

      {/* Medical info editor modal */}
      {editingMedical && activeCampId && (
        <MedicalEditor
          child={editingMedical}
          campId={activeCampId}
          onClose={() => setEditingMedical(null)}
        />
      )}
    </div>
  );
};

export default ParentDashboard;
