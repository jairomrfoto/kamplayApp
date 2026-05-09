import { create } from 'zustand';
import { initialData } from './initialData';
import type {
  Camper, Monitor, Grupo, Cabana, Material,
  Actividad, HorarioDiario, MenuItem, Incident,
  EncuestaMonitor, EvaluacionGrupo, EvaluacionCamper, ActividadPersonal, Novedad,
} from '../types';
import type { Camp, CampCoordinator } from '../types/camp';
import {
  firestoreCampers, firestoreMonitores, firestoreGrupos,
  firestoreCabanas, firestoreMateriales, firestoreActividades,
  firestoreHorarios, firestoreMenus, firestoreIncidencias, firestoreNovedades,
  loadCampData, getCampByCode, saveCampInfo, saveCoordinator,
  saveUserActividad, deleteUserActividad,
} from '../services/firestore';
import type { CampData } from '../services/firestore';
import { auth } from '../config/firebase';

interface AppState {
  // ── Estado ──────────────────────────────────────────────────────────────
  isLoading: boolean;
  currentCamp?: Camp;
  userCamps: Camp[];
  campHistory: unknown[];
  campers: Camper[];
  monitores: Monitor[];
  currentMonitor?: Monitor;
  currentCoordinator?: CampCoordinator;
  grupos: Grupo[];
  cabanas: Cabana[];
  materiales: Material[];
  actividades: Actividad[];
  horariosDiarios: HorarioDiario[];
  menus: MenuItem[];
  incidencias: Incident[];
  misActividades: ActividadPersonal[];
  novedades: Novedad[];

  // ── Acciones de carga ────────────────────────────────────────────────────
  loadFromFirestore: (campId: string, silent?: boolean) => Promise<void>;
  setCurrentCamp: (camp: Camp) => void;
  setUserCamps: (camps: Camp[]) => void;
  addCampToUser: (camp: Camp) => void;
  removeCampFromUser: (campId: string) => void;
  /** Mobile sidebar open state */
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  /** Registered by useFirestoreSync — switches active camp + restarts polling */
  switchCampFn: ((campId: string) => void) | null;
  setSwitchCampFn: (fn: (campId: string) => void) => void;
  /** Preloaded data for all user camps — instant switch without network wait */
  campCache: Record<string, CampData>;
  setCampCache: (campId: string, data: CampData) => void;
  /** Instantly apply cached data for campId; returns true if cache hit */
  applyCampCache: (campId: string) => boolean;

  // ── Incidencias ──────────────────────────────────────────────────────────
  addIncident: (incident: Omit<Incident, 'id'>) => void;
  updateIncident: (incident: Incident) => void;
  addIncidentFollowUp: (incidentId: string, followUp: { comentario: string; realizadoPor: string }) => void;
  setIncidencias: (incidencias: Incident[]) => void;
  setCampers: (campers: Camper[]) => void;
  setMonitores: (monitores: Monitor[]) => void;

  // ── Campamento ───────────────────────────────────────────────────────────
  joinCamp: (code: string, type: 'monitor' | 'family') => Promise<boolean>;

  // ── Monitores ────────────────────────────────────────────────────────────
  updateMonitor: (monitor: Monitor) => void;
  updateMonitorPermisos: (monitorId: string, permisos: Monitor['permisos']) => void;
  addMonitor: (monitor: Monitor) => void;
  removeMonitor: (monitorId: string) => void;
  setCurrentMonitor: (monitor: Monitor | undefined) => void;

  // ── Acampados ────────────────────────────────────────────────────────────
  updateCamper: (camper: Camper) => void;
  addCamper: (camper: Camper) => void;
  deleteCamper: (camperId: string) => void;

  // ── Actividades ──────────────────────────────────────────────────────────
  addActividad: (actividad: Actividad) => void;
  updateActividad: (actividad: Actividad) => void;
  deleteActividad: (actividadId: string) => void;
  setMisActividades: (actividades: ActividadPersonal[]) => void;
  addMiActividad: (actividad: ActividadPersonal) => void;
  deleteMiActividad: (actividadId: string) => void;
  updateMiActividad: (actividad: ActividadPersonal) => void;

  // ── Novedades ────────────────────────────────────────────────────────────
  setNovedades: (novedades: Novedad[]) => void;
  addNovedad: (novedad: Omit<Novedad, 'id'>) => void;
  deleteNovedad: (novedadId: string) => void;

  // ── Grupos ───────────────────────────────────────────────────────────────
  addGrupo: (grupo: Grupo) => void;

  // ── Materiales ───────────────────────────────────────────────────────────
  addMaterial: (material: Material) => void;
  updateMaterial: (material: Material) => void;

  // ── Cabañas ──────────────────────────────────────────────────────────────
  addCabana: (cabana: Cabana) => void;
  updateCabana: (cabana: Cabana) => void;
  asignarMonitorACabana: (monitorId: string, cabanaId: string) => void;

  // ── Encuestas y evaluaciones ─────────────────────────────────────────────
  addEncuestaMonitor: (encuesta: EncuestaMonitor) => void;
  addEvaluacionGrupo: (evaluacion: EvaluacionGrupo) => void;
  addEvaluacionCamper: (evaluacion: EvaluacionCamper) => void;

  // ── Horarios ─────────────────────────────────────────────────────────────
  addHorarioDiario: (horario: HorarioDiario) => void;

  // ── Menú ─────────────────────────────────────────────────────────────────
  addMenu: (menu: MenuItem) => void;
  updateMenu: (menu: MenuItem) => void;

  // ── Coordinadores ────────────────────────────────────────────────────────
  setCurrentCoordinator: (coordinator: CampCoordinator | undefined) => void;
  addCoordinator: (coordinator: CampCoordinator) => void;
  removeCoordinator: (coordinatorId: string) => void;
  updateCoordinatorPermissions: (coordinatorId: string, permissions: CampCoordinator['permissions']) => void;
  updateCoordinator: (coordinator: CampCoordinator) => void;
  transferMainCoordinator: (newMainCoordinatorId: string) => void;

  // ── Demo mode ────────────────────────────────────────────────────────────
  isDemoMode: boolean;
  setDemoMode: (val: boolean) => void;
  setGrupos: (grupos: Grupo[]) => void;
  setCabanas: (cabanas: Cabana[]) => void;
  setMateriales: (materiales: Material[]) => void;
  setActividades: (actividades: Actividad[]) => void;
  setMenus: (menus: MenuItem[]) => void;
  setHorariosDiarios: (horarios: HorarioDiario[]) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // ── Estado inicial ───────────────────────────────────────────────────────
  isLoading: false,
  isDemoMode: false,
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  currentCamp: undefined,
  userCamps: [],
  switchCampFn: null,
  campCache: {},
  campHistory: initialData.campHistory,
  campers: initialData.campers,
  monitores: initialData.monitores,
  grupos: initialData.grupos,
  cabanas: initialData.cabanas,
  materiales: initialData.materiales,
  actividades: initialData.actividades,
  menus: initialData.menus,
  horariosDiarios: initialData.horariosDiarios,
  currentMonitor: undefined,
  incidencias: initialData.incidencias,
  currentCoordinator: undefined,
  misActividades: [],
  novedades: [],

  // ── Carga desde Firestore ────────────────────────────────────────────────
  loadFromFirestore: async (campId: string, silent = false) => {
    if (!silent) set({ isLoading: true });
    try {
      const data = await loadCampData(campId);
      set({ ...data, isLoading: false });
    } catch (error) {
      console.error('Error cargando datos desde Firestore:', error);
      if (!silent) set({ isLoading: false });
    }
  },

  setCurrentCamp: (camp: Camp) => set({ currentCamp: camp }),
  setUserCamps: (camps) => set({ userCamps: camps }),
  addCampToUser: (camp) => set((state) => ({
    userCamps: state.userCamps.some(c => c.id === camp.id)
      ? state.userCamps.map(c => c.id === camp.id ? camp : c)
      : [...state.userCamps, camp],
  })),
  removeCampFromUser: (campId) => set((state) => ({
    userCamps: state.userCamps.filter(c => c.id !== campId),
    currentCamp: state.currentCamp?.id === campId ? undefined : state.currentCamp,
  })),
  setSwitchCampFn: (fn) => set({ switchCampFn: fn }),
  setCampCache: (campId, data) => set((state) => ({
    campCache: { ...state.campCache, [campId]: data },
  })),
  applyCampCache: (campId) => {
    const cached = get().campCache[campId];
    if (!cached) return false;
    set({
      campers: cached.campers,
      monitores: cached.monitores,
      grupos: cached.grupos,
      cabanas: cached.cabanas,
      materiales: cached.materiales,
      actividades: cached.actividades,
      horariosDiarios: cached.horariosDiarios,
      menus: cached.menus,
      incidencias: cached.incidencias,
      novedades: cached.novedades ?? [],
    });
    return true;
  },

  // ── Incidencias ──────────────────────────────────────────────────────────
  setIncidencias: (incidencias) => set({ incidencias }),
  setCampers: (campers) => set({ campers }),
  setMonitores: (monitores) => set({ monitores }),

  addIncident: (incident) => {
    const newIncident: Incident = { id: crypto.randomUUID(), ...incident };
    set((state) => ({ incidencias: [...state.incidencias, newIncident] }));
    const { currentCamp } = get();
    if (currentCamp?.id) {
      firestoreIncidencias.save(currentCamp.id, newIncident).catch(console.error);
    }
  },

  updateIncident: (updatedIncident) => {
    set((state) => ({
      incidencias: state.incidencias.map(inc =>
        inc.id === updatedIncident.id ? updatedIncident : inc
      ),
    }));
    const { currentCamp } = get();
    if (currentCamp?.id) {
      firestoreIncidencias.save(currentCamp.id, updatedIncident).catch(console.error);
    }
  },

  addIncidentFollowUp: (incidentId, followUp) => {
    let updatedIncident: Incident | undefined;
    set((state) => {
      const incidencias = state.incidencias.map(inc => {
        if (inc.id === incidentId) {
          updatedIncident = {
            ...inc,
            seguimiento: [
              ...(inc.seguimiento || []),
              { ...followUp, fecha: new Date() },
            ],
          };
          return updatedIncident;
        }
        return inc;
      });
      return { incidencias };
    });
    const { currentCamp } = get();
    if (currentCamp?.id && updatedIncident) {
      firestoreIncidencias.save(currentCamp.id, updatedIncident).catch(console.error);
    }
  },

  // ── Campamento ───────────────────────────────────────────────────────────
  joinCamp: async (code, type) => {
    try {
      const camp = await getCampByCode(code, type);
      if (camp) {
        set({ currentCamp: camp });
        return true;
      }
    } catch (error) {
      console.error('Error buscando campamento:', error);
    }
    return false;
  },

  // ── Monitores ────────────────────────────────────────────────────────────
  setCurrentMonitor: (monitor) => set({ currentMonitor: monitor }),

  updateMonitor: (updatedMonitor) => {
    set((state) => ({
      monitores: state.monitores.map(m =>
        m.id === updatedMonitor.id ? updatedMonitor : m
      ),
      currentMonitor:
        state.currentMonitor?.id === updatedMonitor.id
          ? updatedMonitor
          : state.currentMonitor,
    }));
    const { currentCamp } = get();
    if (currentCamp?.id) {
      firestoreMonitores.save(currentCamp.id, updatedMonitor).catch(console.error);
    }
  },

  updateMonitorPermisos: (monitorId, permisos) => {
    set((state) => ({
      monitores: state.monitores.map(m =>
        m.id === monitorId ? { ...m, permisos: { ...m.permisos, ...permisos }, pendiente: false } : m
      ),
    }));
    const { currentCamp, monitores } = get();
    if (currentCamp?.id) {
      const monitor = monitores.find(m => m.id === monitorId);
      if (monitor) {
        firestoreMonitores.save(currentCamp.id, monitor).catch(console.error);
      }
    }
  },

  addMonitor: (monitor) => {
    set((state) => ({ monitores: [...state.monitores, monitor] }));
    const { currentCamp } = get();
    if (currentCamp?.id) {
      firestoreMonitores.save(currentCamp.id, monitor).catch(console.error);
    }
  },

  removeMonitor: (monitorId) => {
    set((state) => ({ monitores: state.monitores.filter(m => m.id !== monitorId) }));
    const { currentCamp } = get();
    if (currentCamp?.id) {
      firestoreMonitores.delete(currentCamp.id, monitorId).catch(console.error);
    }
  },

  // ── Acampados ────────────────────────────────────────────────────────────
  updateCamper: (updatedCamper) => {
    set((state) => ({
      campers: state.campers.map(c =>
        c.id === updatedCamper.id ? updatedCamper : c
      ),
    }));
    const { currentCamp } = get();
    if (currentCamp?.id) {
      firestoreCampers.save(currentCamp.id, updatedCamper).catch(console.error);
    }
  },

  addCamper: (camper) => {
    set((state) => ({ campers: [...state.campers, camper] }));
    const { currentCamp } = get();
    if (currentCamp?.id) {
      firestoreCampers.save(currentCamp.id, camper).catch(console.error);
    }
  },

  deleteCamper: (camperId) => {
    set((state) => ({ campers: state.campers.filter(c => c.id !== camperId) }));
    const { currentCamp } = get();
    if (currentCamp?.id) {
      firestoreCampers.delete(currentCamp.id, camperId).catch(console.error);
    }
  },

  // ── Actividades ──────────────────────────────────────────────────────────
  addActividad: (actividad) => {
    set((state) => ({ actividades: [...state.actividades, actividad] }));
    const { currentCamp } = get();
    if (currentCamp?.id) {
      firestoreActividades.save(currentCamp.id, actividad).catch(console.error);
    }
    // Auto-save to personal library
    const uid = auth.currentUser?.uid;
    if (uid && currentCamp) {
      const personal: ActividadPersonal = {
        id: actividad.id,
        titulo: actividad.titulo,
        descripcion: actividad.descripcion,
        categoria: actividad.categoria,
        duracion: actividad.duracion,
        edadMinima: actividad.edadMinima,
        edadMaxima: actividad.edadMaxima,
        capacidadMaxima: actividad.capacidadMaxima,
        ubicacion: actividad.ubicacion,
        campId: currentCamp.id,
        campNombre: currentCamp.nombre,
        fechaGuardado: new Date(),
      };
      set((state) => ({
        misActividades: state.misActividades.some(a => a.id === personal.id)
          ? state.misActividades
          : [...state.misActividades, personal],
      }));
      saveUserActividad(uid, personal).catch(console.error);
    }
  },

  updateActividad: (actividad) => {
    set((state) => ({
      actividades: state.actividades.map(a => a.id === actividad.id ? actividad : a),
    }));
    const { currentCamp } = get();
    if (currentCamp?.id) {
      firestoreActividades.update(currentCamp.id, actividad).catch(console.error);
    }
  },

  deleteActividad: (actividadId) => {
    set((state) => ({
      actividades: state.actividades.filter(a => a.id !== actividadId),
    }));
    const { currentCamp } = get();
    if (currentCamp?.id) {
      firestoreActividades.delete(currentCamp.id, actividadId).catch(console.error);
    }
  },

  setMisActividades: (actividades) => set({ misActividades: actividades }),
  addMiActividad: (actividad) => {
    set((state) => ({
      misActividades: state.misActividades.some(a => a.id === actividad.id)
        ? state.misActividades
        : [...state.misActividades, actividad],
    }));
    const uid = auth.currentUser?.uid;
    if (uid) saveUserActividad(uid, actividad).catch(console.error);
  },

  deleteMiActividad: (actividadId) => {
    set((state) => ({ misActividades: state.misActividades.filter(a => a.id !== actividadId) }));
    const uid = auth.currentUser?.uid;
    if (uid) deleteUserActividad(uid, actividadId).catch(console.error);
  },

  updateMiActividad: (actividad) => {
    set((state) => ({
      misActividades: state.misActividades.map(a => a.id === actividad.id ? actividad : a),
    }));
    const uid = auth.currentUser?.uid;
    if (uid) saveUserActividad(uid, actividad).catch(console.error);
  },

  // ── Novedades ────────────────────────────────────────────────────────────
  setNovedades: (novedades) => set({ novedades }),
  addNovedad: (novedad) => {
    const newNovedad: Novedad = { id: crypto.randomUUID(), ...novedad };
    set((state) => ({ novedades: [newNovedad, ...state.novedades] }));
    const { currentCamp } = get();
    if (currentCamp?.id) {
      firestoreNovedades.save(currentCamp.id, newNovedad).catch(console.error);
    }
  },
  deleteNovedad: (novedadId) => {
    set((state) => ({ novedades: state.novedades.filter(n => n.id !== novedadId) }));
    const { currentCamp } = get();
    if (currentCamp?.id) {
      firestoreNovedades.delete(currentCamp.id, novedadId).catch(console.error);
    }
  },

  // ── Grupos ───────────────────────────────────────────────────────────────
  addGrupo: (grupo) => {
    set((state) => ({ grupos: [...state.grupos, grupo] }));
    const { currentCamp } = get();
    if (currentCamp?.id) {
      firestoreGrupos.save(currentCamp.id, grupo).catch(console.error);
    }
  },

  // ── Materiales ───────────────────────────────────────────────────────────
  addMaterial: (material) => {
    set((state) => ({ materiales: [...state.materiales, material] }));
    const { currentCamp } = get();
    if (currentCamp?.id) {
      firestoreMateriales.save(currentCamp.id, material).catch(console.error);
    }
  },

  updateMaterial: (material) => {
    set((state) => ({
      materiales: state.materiales.map(m => m.id === material.id ? material : m),
    }));
    const { currentCamp } = get();
    if (currentCamp?.id) {
      firestoreMateriales.save(currentCamp.id, material).catch(console.error);
    }
  },

  // ── Cabañas ──────────────────────────────────────────────────────────────
  addCabana: (cabana) => {
    set((state) => ({ cabanas: [...state.cabanas, cabana] }));
    const { currentCamp } = get();
    if (currentCamp?.id) {
      firestoreCabanas.save(currentCamp.id, cabana).catch(console.error);
    }
  },

  updateCabana: (cabana) => {
    const latestNote = [...(cabana.notas || [])].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    )[0];
    const updatedCabana: Cabana = {
      ...cabana,
      estado:
        latestNote?.estadoLimpieza === 'Necesita Atención'
          ? 'Necesita Revisión'
          : cabana.estado,
    };
    set((state) => ({
      cabanas: state.cabanas.map(c => c.id === cabana.id ? updatedCabana : c),
    }));
    const { currentCamp } = get();
    if (currentCamp?.id) {
      firestoreCabanas.save(currentCamp.id, updatedCabana).catch(console.error);
    }
  },

  asignarMonitorACabana: (monitorId, cabanaId) => {
    set((state) => {
      const cabanas = state.cabanas.map(c => ({
        ...c,
        monitorEncargado: c.monitorEncargado === monitorId ? undefined : c.monitorEncargado,
      }));
      const idx = cabanas.findIndex(c => c.id === cabanaId);
      if (idx !== -1) cabanas[idx] = { ...cabanas[idx], monitorEncargado: monitorId };

      const monitores = state.monitores.map(m =>
        m.id === monitorId ? { ...m, cabanaAsignada: cabanaId } : m
      );
      return { cabanas, monitores };
    });
    const { currentCamp, cabanas, monitores } = get();
    if (currentCamp?.id) {
      const cabana = cabanas.find(c => c.id === cabanaId);
      const monitor = monitores.find(m => m.id === monitorId);
      if (cabana) firestoreCabanas.save(currentCamp.id, cabana).catch(console.error);
      if (monitor) firestoreMonitores.save(currentCamp.id, monitor).catch(console.error);
    }
  },

  // ── Encuestas y evaluaciones ─────────────────────────────────────────────
  addEncuestaMonitor: (encuesta) => {
    set((state) => ({
      monitores: state.monitores.map(m =>
        m.id === encuesta.monitorId
          ? { ...m, encuestas: [...m.encuestas, encuesta] }
          : m
      ),
    }));
    const { currentCamp, monitores } = get();
    if (currentCamp?.id) {
      const monitor = monitores.find(m => m.id === encuesta.monitorId);
      if (monitor) firestoreMonitores.save(currentCamp.id, monitor).catch(console.error);
    }
  },

  addEvaluacionGrupo: (evaluacion) => {
    set((state) => ({
      grupos: state.grupos.map(g =>
        g.id === evaluacion.grupoId
          ? { ...g, evaluaciones: [...g.evaluaciones, evaluacion] }
          : g
      ),
    }));
    const { currentCamp, grupos } = get();
    if (currentCamp?.id) {
      const grupo = grupos.find(g => g.id === evaluacion.grupoId);
      if (grupo) firestoreGrupos.save(currentCamp.id, grupo).catch(console.error);
    }
  },

  addEvaluacionCamper: (evaluacion) => {
    set((state) => ({
      campers: state.campers.map(c =>
        c.id === evaluacion.camperId
          ? { ...c, evaluaciones: [...c.evaluaciones, evaluacion] }
          : c
      ),
    }));
    const { currentCamp, campers } = get();
    if (currentCamp?.id) {
      const camper = campers.find(c => c.id === evaluacion.camperId);
      if (camper) firestoreCampers.save(currentCamp.id, camper).catch(console.error);
    }
  },

  // ── Horarios ─────────────────────────────────────────────────────────────
  addHorarioDiario: (horario) => {
    set((state) => ({ horariosDiarios: [...state.horariosDiarios, horario] }));
    const { currentCamp } = get();
    if (currentCamp?.id) {
      firestoreHorarios.save(currentCamp.id, horario).catch(console.error);
    }
  },

  // ── Menú ─────────────────────────────────────────────────────────────────
  addMenu: (menu) => {
    set((state) => ({ menus: [...state.menus, menu] }));
    const { currentCamp } = get();
    if (currentCamp?.id) {
      firestoreMenus.save(currentCamp.id, menu).catch(console.error);
    }
  },

  updateMenu: (menu) => {
    set((state) => ({
      menus: state.menus.map(m => m.id === menu.id ? menu : m),
    }));
    const { currentCamp } = get();
    if (currentCamp?.id) {
      firestoreMenus.save(currentCamp.id, menu).catch(console.error);
    }
  },

  // ── Coordinadores ────────────────────────────────────────────────────────
  setCurrentCoordinator: (coordinator) => set({ currentCoordinator: coordinator }),

  addCoordinator: (coordinator) => {
    set((state) => {
      if (!state.currentCamp) return state;
      return {
        currentCamp: {
          ...state.currentCamp,
          coordinators: [...state.currentCamp.coordinators, coordinator.id],
        },
      };
    });
    const { currentCamp } = get();
    if (currentCamp?.id) {
      saveCoordinator(currentCamp.id, coordinator).catch(console.error);
      saveCampInfo(currentCamp).catch(console.error);
    }
  },

  removeCoordinator: (coordinatorId) => {
    set((state) => {
      if (!state.currentCamp) return state;
      if (state.currentCamp.mainCoordinator === coordinatorId) return state;
      return {
        currentCamp: {
          ...state.currentCamp,
          coordinators: state.currentCamp.coordinators.filter(id => id !== coordinatorId),
        },
      };
    });
    const { currentCamp } = get();
    if (currentCamp?.id) saveCampInfo(currentCamp).catch(console.error);
  },

  updateCoordinatorPermissions: (coordinatorId, permissions) => {
    set((state) => ({
      currentCoordinator:
        state.currentCoordinator?.id === coordinatorId
          ? { ...state.currentCoordinator, permissions }
          : state.currentCoordinator,
    }));
    const { currentCamp, currentCoordinator } = get();
    if (currentCamp?.id && currentCoordinator) {
      const updated = { ...currentCoordinator, permissions };
      saveCoordinator(currentCamp.id, updated).catch(console.error);
    }
  },

  updateCoordinator: (updatedCoordinator) => {
    set((state) => ({
      currentCoordinator:
        state.currentCoordinator?.id === updatedCoordinator.id
          ? updatedCoordinator
          : state.currentCoordinator,
    }));
    const { currentCamp } = get();
    if (currentCamp?.id) saveCoordinator(currentCamp.id, updatedCoordinator).catch(console.error);
  },

  setDemoMode: (val) => set({ isDemoMode: val }),
  setGrupos: (grupos) => set({ grupos }),
  setCabanas: (cabanas) => set({ cabanas }),
  setMateriales: (materiales) => set({ materiales }),
  setActividades: (actividades) => set({ actividades }),
  setMenus: (menus) => set({ menus }),
  setHorariosDiarios: (horariosDiarios) => set({ horariosDiarios }),

  transferMainCoordinator: (newMainCoordinatorId) => {
    set((state) => {
      if (!state.currentCamp || !state.currentCoordinator?.isMainCoordinator) return state;
      return {
        currentCamp: {
          ...state.currentCamp,
          mainCoordinator: newMainCoordinatorId,
        },
      };
    });
    const { currentCamp } = get();
    if (currentCamp?.id) saveCampInfo(currentCamp).catch(console.error);
  },
}));
