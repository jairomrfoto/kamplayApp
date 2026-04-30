import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Tent, CreditCard, LogOut, RefreshCw, Loader,
  Search, Shield, FlaskConical,
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import {
  adminGetAllUsers, adminGetAllCamps, adminGetAllPayments, adminGetCampStats,
  type AdminUser, type AdminPayment,
} from '../services/adminFirestore';
import type { Camp } from '../types/camp';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;

type Tab = 'overview' | 'usuarios' | 'campamentos' | 'pagos';

// ── Role badge ────────────────────────────────────────────────────────────────
const RoleBadge = ({ role }: { role: string }) => {
  const map: Record<string, string> = {
    coordinator: 'bg-orange-100 text-orange-700',
    monitor:     'bg-green-100 text-green-700',
    parent:      'bg-amber-100 text-amber-700',
    profesor:    'bg-blue-100 text-blue-700',
  };
  const labels: Record<string, string> = {
    coordinator: 'Coordinador',
    monitor:     'Monitor',
    parent:      'Padre/Tutor',
    profesor:    'Profesor',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[role] ?? 'bg-gray-100 text-gray-600'}`}>
      {labels[role] ?? role}
    </span>
  );
};

const SubBadge = ({ status }: { status?: string }) => {
  if (!status) return <span className="text-xs text-gray-400">–</span>;
  const map: Record<string, string> = {
    active:   'bg-green-100 text-green-700',
    trialing: 'bg-blue-100 text-blue-700',
    past_due: 'bg-red-100 text-red-700',
    canceled: 'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

// ── Camp stats cache ──────────────────────────────────────────────────────────
interface CampRow extends Camp {
  _campers?: number;
  _monitores?: number;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();

  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [users, setUsers]     = useState<AdminUser[]>([]);
  const [camps, setCamps]     = useState<CampRow[]>([]);
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [campStats, setCampStats] = useState<Record<string, { campers: number; monitores: number }>>({});

  const [userSearch, setUserSearch] = useState('');
  const [campSearch, setCampSearch] = useState('');

  // Guard: wait for auth, then redirect if not admin
  useEffect(() => {
    if (authLoading) return;
    if (user === null) { navigate('/login', { replace: true }); return; }
    if (ADMIN_EMAIL && user.email !== ADMIN_EMAIL) { navigate('/', { replace: true }); }
  }, [user, authLoading, navigate]);

  const load = useCallback(async () => {
    try {
      const [u, c, p] = await Promise.all([
        adminGetAllUsers(),
        adminGetAllCamps(),
        adminGetAllPayments(),
      ]);
      setUsers(u);
      setCamps(c);
      setPayments(p);
      c.slice(0, 20).forEach(camp => {
        adminGetCampStats(camp.id).then(stats => {
          setCampStats(prev => ({ ...prev, [camp.id]: stats }));
        });
      });
    } catch (e) {
      console.error('Admin load error:', e);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) load().finally(() => setLoading(false));
  }, [load, authLoading, user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleChangeRole = async (u: AdminUser, newRole: string) => {
    await updateDoc(doc(db, 'usuarios', u.uid), { role: newRole });
    setUsers(prev => prev.map(usr => usr.uid === u.uid ? { ...usr, role: newRole } : usr));
  };

  const handleChangeSubscription = async (u: AdminUser, newStatus: string) => {
    await updateDoc(doc(db, 'usuarios', u.uid), { subscriptionStatus: newStatus });
    setUsers(prev => prev.map(usr => usr.uid === u.uid ? { ...usr, subscriptionStatus: newStatus } : usr));
  };

  // ── Derived stats ────────────────────────────────────────────────────────
  const totalRevenueCents = payments
    .filter(p => p.status === 'succeeded' || p.status === 'paid')
    .reduce((s, p) => s + (p.amount ?? 0), 0);

  const activeSubscriptions = users.filter(u =>
    u.subscriptionStatus === 'active' || u.subscriptionStatus === 'trialing'
  ).length;

  const byRole = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  const filteredUsers = users.filter(u =>
    !userSearch ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.nombre?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredCamps = camps.filter(c =>
    !campSearch ||
    c.name?.toLowerCase().includes(campSearch.toLowerCase()) ||
    c.location?.toLowerCase().includes(campSearch.toLowerCase())
  );

  const formatDate = (d?: Date | string) => {
    if (!d) return '–';
    return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatMoney = (cents: number) =>
    (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

  const getCampStatus = (camp: Camp) => {
    const now = Date.now();
    const start = new Date(camp.startDate).getTime();
    const end   = new Date(camp.endDate).getTime();
    if (now < start) return { label: 'Pendiente', color: 'bg-amber-100 text-amber-700' };
    if (now <= end)  return { label: 'En curso',  color: 'bg-green-100 text-green-700' };
    return              { label: 'Finalizado', color: 'bg-gray-100 text-gray-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader size={32} className="animate-spin text-orange-400" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'overview',    label: 'Vista general', icon: Shield },
    { id: 'usuarios',    label: 'Usuarios',      icon: Users,      count: users.length },
    { id: 'campamentos', label: 'Programas',     icon: Tent,       count: camps.length },
    { id: 'pagos',       label: 'Pagos',         icon: CreditCard, count: payments.length },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Navbar */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-lg leading-none">Kamplay Admin</h1>
              <p className="text-gray-500 text-xs mt-0.5">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              Actualizar
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <LogOut size={15} /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 p-1 rounded-xl w-fit">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <t.icon size={15} />
              {t.label}
              {t.count !== undefined && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.id ? 'bg-white/20' : 'bg-gray-700'
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total usuarios',       value: users.length,         sub: `${byRole.coordinator ?? 0} coordinadores`, color: 'text-orange-400' },
                { label: 'Programas creados',    value: camps.length,         sub: `${camps.filter(c => c.type === 'campus').length} campus`, color: 'text-blue-400' },
                { label: 'Suscripciones activas',value: activeSubscriptions,  sub: `${activeSubscriptions} de ${byRole.coordinator ?? 0} coords.`, color: 'text-green-400' },
                { label: 'Ingresos (pagos)',      value: formatMoney(totalRevenueCents), sub: `${payments.filter(p => p.status === 'succeeded' || p.status === 'paid').length} transacciones`, color: 'text-purple-400' },
              ].map(s => (
                <div key={s.label} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{s.label}</p>
                  <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Users by role */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <h3 className="font-bold text-white mb-4">Usuarios por rol</h3>
                <div className="space-y-3">
                  {[
                    { role: 'coordinator', label: 'Coordinadores', color: 'bg-orange-500' },
                    { role: 'monitor',     label: 'Monitores',     color: 'bg-green-500' },
                    { role: 'parent',      label: 'Padres/Tutores',color: 'bg-amber-500' },
                    { role: 'profesor',    label: 'Profesores',    color: 'bg-blue-500' },
                  ].map(({ role, label, color }) => {
                    const count = byRole[role] ?? 0;
                    const pct = users.length ? Math.round((count / users.length) * 100) : 0;
                    return (
                      <div key={role}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">{label}</span>
                          <span className="text-gray-400">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <h3 className="font-bold text-white mb-4">Últimos programas creados</h3>
                {camps.length === 0 ? (
                  <p className="text-gray-500 text-sm">Sin programas aún</p>
                ) : (
                  <ul className="divide-y divide-gray-800">
                    {[...camps]
                      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                      .slice(0, 5)
                      .map(c => (
                        <li key={c.id} className="py-2.5 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{c.name}</p>
                            <p className="text-xs text-gray-500">{c.location}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                            c.type === 'campus' ? 'bg-blue-900 text-blue-300' : 'bg-orange-900 text-orange-300'
                          }`}>
                            {c.type === 'campus' ? 'Campus' : 'Campamento'}
                          </span>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── USUARIOS ── */}
        {tab === 'usuarios' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar por email o nombre..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <p className="text-sm text-gray-500">{filteredUsers.length} resultados</p>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email / Nombre</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Rol</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Suscripción</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredUsers.map(u => (
                      <tr key={u.uid} className="hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-gray-200 text-sm">{u.nombre || '–'}</p>
                          <p className="text-gray-500 font-mono text-xs">{u.email || '–'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={u.role || ''}
                            onChange={e => handleChangeRole(u, e.target.value)}
                            className="bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
                          >
                            <option value="coordinator">Coordinador</option>
                            <option value="monitor">Monitor</option>
                            <option value="parent">Padre/Tutor</option>
                            <option value="profesor">Profesor</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={u.subscriptionStatus || ''}
                            onChange={e => handleChangeSubscription(u, e.target.value)}
                            className="bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-orange-500"
                          >
                            <option value="">Sin suscripción</option>
                            <option value="trialing">Prueba (trialing)</option>
                            <option value="active">Activa (active)</option>
                            <option value="past_due">Vencida (past_due)</option>
                            <option value="canceled">Cancelada (canceled)</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            {u.emailVerified === false && (
                              <span className="text-xs text-amber-400">Sin verificar</span>
                            )}
                            {!u.hasProfile && (
                              <span className="text-xs text-gray-500">Sin perfil</span>
                            )}
                            {u.emailVerified !== false && u.hasProfile && (
                              <span className="text-xs text-green-400">Activo</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Sin resultados</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── CAMPAMENTOS ── */}
        {tab === 'campamentos' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o ubicación..."
                  value={campSearch}
                  onChange={e => setCampSearch(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
              <p className="text-sm text-gray-500">{filteredCamps.length} resultados</p>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nombre</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ubicación</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Fechas</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Participantes</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {filteredCamps.map(c => {
                      const status = getCampStatus(c);
                      const stats  = campStats[c.id];
                      return (
                        <tr key={c.id} className="hover:bg-gray-800/50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-gray-200 font-medium">{c.name}</p>
                            <p className="text-gray-500 text-xs font-mono">{c.id.slice(0, 8)}…</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              c.type === 'campus'
                                ? 'bg-blue-900 text-blue-300'
                                : 'bg-orange-900 text-orange-300'
                            }`}>
                              {c.type === 'campus' ? '🏫 Campus' : '🏕️ Campamento'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400">{c.location || '–'}</td>
                          <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                            {formatDate(c.startDate)} → {formatDate(c.endDate)}
                          </td>
                          <td className="px-4 py-3 text-gray-300">
                            {stats
                              ? `${stats.campers} / ${c.maxCampers}`
                              : <Loader size={13} className="animate-spin text-gray-500" />}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredCamps.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Sin resultados</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── PAGOS ── */}
        {tab === 'pagos' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                {
                  label: 'Total cobrado',
                  value: formatMoney(totalRevenueCents),
                  color: 'text-green-400',
                },
                {
                  label: 'Transacciones completadas',
                  value: payments.filter(p => p.status === 'succeeded' || p.status === 'paid').length,
                  color: 'text-white',
                },
                {
                  label: 'Pendientes / fallidos',
                  value: payments.filter(p => p.status !== 'succeeded' && p.status !== 'paid').length,
                  color: 'text-amber-400',
                },
              ].map(s => (
                <div key={s.label} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                  <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                  <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Camp ID</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Parent UID</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Importe</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {payments.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Sin pagos registrados</td></tr>
                    ) : (
                      [...payments]
                        .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
                        .map(p => (
                          <tr key={p.id} className="hover:bg-gray-800/50 transition-colors">
                            <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.id.slice(0, 10)}…</td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-xs">{p.campId?.slice(0, 10)}…</td>
                            <td className="px-4 py-3 text-gray-400 font-mono text-xs">{p.parentUid?.slice(0, 10)}…</td>
                            <td className="px-4 py-3 text-gray-200 font-semibold">{p.amount ? formatMoney(p.amount) : '–'}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                p.status === 'succeeded' || p.status === 'paid'
                                  ? 'bg-green-900 text-green-300'
                                  : 'bg-amber-900 text-amber-300'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{formatDate(p.createdAt)}</td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
