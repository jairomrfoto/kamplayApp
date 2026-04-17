import { create } from 'zustand';
import { initialData } from './initialData';
import type {
  Camper, Monitor, Grupo, Cabana, Material,
  Actividad, HorarioDiario, MenuItem, Incident,
  EncuestaMonitor, EvaluacionGrupo, EvaluacionCamper,
} from '../types';
import type { Camp, CampCoordinator } from '../types/camp';
import {
  firestoreCampers, firestoreMonitores, firestoreGrupos,
  firestoreCabanas, firestoreMateriales, firestoreActividades,
  firestoreHorarios, firestoreMenus, firestoreIncidencias,
  loadCampData, getCampByCode, saveCampInfo, saveCoordinator,
} from '../services/firestore';

interface AppState {
  // ── Estado ──────────────────────────────────────────────────────────────
  isLoading: boolean;
  currentCamp?: Camp;
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

  // ── Acciones de carga ────────────────────────────────────────────────────
  loadFromFirestore: (campId: string) => Promise<void>;
  setCurrentCamp: (camp: Camp) => void;

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
  setCurrentMonitor: (monitor: Monitor | undefined) => void;

  // ── Acampados ────────────────────────────────────────────────────────────
  updateCamper: (camper: Camper) => void;
  addCamper: (camper: Camper) => void;
  deleteCamper: (camperId: string) => void;

  // ── Actividades ──────────────────────────────────────────────────────────
  addActividad: (actividad: Actividad) => void;

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
}

export const useStore = create<AppState>((set, get) => ({
  // ── Estado inicial ───────────────────────────────────────────────────────
  isLoading: false,
  currentCamp: undefined,
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

  // ── Carga desde Firestore ────────────────────────────────────────────────
  loadFromFirestore: async (campId: string) => {
    set({ isLoading: true });
    try {
      const data = await loadCampData(campId);
      set({ ...data, isLoading: false });
    } catch (error) {
      console.error('Error cargando datos desde Firestore:', error);
      set({ isLoading: false });
    }
  },

  setCurrentCamp: (camp: Camp) => set({ currentCamp: camp }),

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
        m.id === monitorId ? { ...m, permisos: { ...m.permisos, ...permisos } } : m
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
