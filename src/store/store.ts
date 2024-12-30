import { create } from 'zustand';
import { initialData } from './initialData';
import type { 
  Camper, Monitor, Grupo, Cabana, Material, 
  Actividad, HorarioDiario, EncuestaMonitor,
  EvaluacionGrupo, EvaluacionCamper 
} from '../types';

interface AppState {
  currentCamp?: Camp;
  campHistory: any[];
  campers: Camper[];
  monitores: Monitor[];
  currentCoordinator?: CampCoordinator;
  grupos: Grupo[];
  cabanas: Cabana[];
  materiales: Material[];
  actividades: Actividad[];
  horariosDiarios: HorarioDiario[];
  menus: MenuItem[];
  currentMonitor?: Monitor;
  currentCoordinator?: CampCoordinator;
  incidencias: Incident[];
  
  addIncident: (incident: Omit<Incident, 'id'>) => void;
  updateIncident: (incident: Incident) => void;
  addIncidentFollowUp: (incidentId: string, followUp: { comentario: string; realizadoPor: string }) => void;
  joinCamp: (code: string, type: 'monitor' | 'family') => boolean;
  updateMonitor: (monitor: Monitor) => void;
  updateMonitorPermisos: (monitorId: string, permisos: Monitor['permisos']) => void;
  updateMonitorPermisos: (monitorId: string, permisos: Monitor['permisos']) => void;
  updateCamper: (camper: Camper) => void;
  addCamper: (camper: Camper) => void;
  addMonitor: (monitor: Monitor) => void;
  addActividad: (actividad: Actividad) => void;
  addGrupo: (grupo: Grupo) => void;
  addMaterial: (material: Material) => void;
  updateCabana: (cabana: Cabana) => void;
  addCabana: (cabana: Cabana) => void;
  updateMaterial: (material: Material) => void;
  addEncuestaMonitor: (encuesta: EncuestaMonitor) => void;
  addEvaluacionGrupo: (evaluacion: EvaluacionGrupo) => void;
  addEvaluacionCamper: (evaluacion: EvaluacionCamper) => void;
  addHorarioDiario: (horario: HorarioDiario) => void;
  asignarMonitorACabana: (monitorId: string, cabanaId: string) => void;
  addMenu: (menu: MenuItem) => void;
  updateMenu: (menu: MenuItem) => void;
  addCoordinator: (coordinator: CampCoordinator) => void;
  removeCoordinator: (coordinatorId: string) => void;
  updateCoordinatorPermissions: (coordinatorId: string, permissions: CampCoordinator['permissions']) => void;
  updateCoordinator: (coordinator: CampCoordinator) => void;
  transferMainCoordinator: (newMainCoordinatorId: string) => void;
}

export const useStore = create<AppState>((set) => ({
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
  currentMonitor: initialData.monitores[0], // For demo purposes
  incidencias: initialData.incidencias,

  addIncident: (incident) => set((state) => ({
    incidencias: [...state.incidencias, { id: crypto.randomUUID(), ...incident }]
  })),


  updateIncident: (updatedIncident) => set((state) => ({
    incidencias: state.incidencias.map(inc => 
      inc.id === updatedIncident.id ? updatedIncident : inc
    )
  })),


  addIncidentFollowUp: (incidentId, followUp) => set((state) => ({
    incidencias: state.incidencias.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          seguimiento: [
            ...(inc.seguimiento || []),
            { ...followUp, fecha: new Date() }
          ]
        };
      }
      return inc;
    })
  })),
  currentCoordinator: {
    id: 'coord-1',
    campId: 'camp-1',
    email: 'coordinator@example.com',
    name: 'Coordinador Principal',
    role: 'coordinator',
    permissions: {
      manageCoordinators: true,
      manageMonitors: true,
      manageCampers: true,
      manageActivities: true,
      manageSchedule: true,
      viewReports: true
    },
    isMainCoordinator: true,
    photo: '',
    location: 'Madrid'
  },

  joinCamp: (code, type) => {
    // Simulated camp data - in a real app this would come from the database
    const camps = [{
      id: '1',
      name: 'Campamento Verano 2024',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-15'),
      location: 'Sierra de Gredos',
      maxCampers: 50,
      monitorsCount: 5,
      joinCodes: {
        monitors: 'MON123',
        families: 'FAM123'
      },
      adminId: 'admin1'
    }];

    const camp = camps.find(c => 
      type === 'monitor' ? c.joinCodes.monitors === code : c.joinCodes.families === code
    );

    if (camp) {
      set({ currentCamp: camp });
      return true;
    }

    return false;
  },

  updateMonitor: (updatedMonitor) => set((state) => ({
    monitores: state.monitores.map(m => 
      m.id === updatedMonitor.id ? updatedMonitor : m
    ),
    currentMonitor: state.currentMonitor?.id === updatedMonitor.id ? updatedMonitor : state.currentMonitor
  })),

  updateMonitorPermisos: (monitorId, permisos) => set((state) => ({
    monitores: state.monitores.map(m => 
      m.id === monitorId 
        ? { ...m, permisos: { ...m.permisos, ...permisos } }
        : m
    )
  })),
  updateMonitorPermisos: (monitorId, permisos) => set((state) => ({
    monitores: state.monitores.map(m => 
      m.id === monitorId 
        ? { ...m, permisos: { ...m.permisos, ...permisos } }
        : m
    )
  })),
  updateCamper: (updatedCamper) => set((state) => ({
    campers: state.campers.map(c => 
      c.id === updatedCamper.id ? updatedCamper : c
    )
  })),

  addCamper: (camper) => set((state) => ({ 
    campers: [...state.campers, camper] 
  })),

  addMonitor: (monitor) => set((state) => ({ 
    monitores: [...state.monitores, monitor] 
  })),
  
  addGrupo: (grupo) => set((state) => ({
    grupos: [...state.grupos, grupo]
  })),

  addActividad: (actividad) => set((state) => ({ 
    actividades: [...state.actividades, actividad] 
  })),
  
  addMaterial: (material) => set((state) => ({
    materiales: [...state.materiales, material]
  })),
  
  addCabana: (cabana) => set((state) => ({
    cabanas: [...state.cabanas, cabana]
  })),

  updateCabana: (cabana) => set((state) => ({
    cabanas: state.cabanas.map(c => 
      c.id === cabana.id ? cabana : c
    ),
    // Update estado based on latest note if exists
    cabanas: state.cabanas.map(c => {
      if (c.id === cabana.id) {
        const latestNote = [...(cabana.notas || [])].sort(
          (a, b) => b.fecha.getTime() - a.fecha.getTime()
        )[0];
        return {
          ...cabana,
          estado: latestNote?.estadoLimpieza === 'Necesita Atención' 
            ? 'Necesita Revisión'
            : cabana.estado
        };
      }
      return c;
    })
  })),

  updateMaterial: (material) => set((state) => ({
    materiales: state.materiales.map(m => 
      m.id === material.id ? material : m
    )
  })),

  addEncuestaMonitor: (encuesta) => set((state) => ({
    monitores: state.monitores.map(m => 
      m.id === encuesta.monitorId 
        ? { ...m, encuestas: [...m.encuestas, encuesta] }
        : m
    )
  })),

  addEvaluacionGrupo: (evaluacion) => set((state) => ({
    grupos: state.grupos.map(g => 
      g.id === evaluacion.grupoId 
        ? { ...g, evaluaciones: [...g.evaluaciones, evaluacion] }
        : g
    )
  })),

  addEvaluacionCamper: (evaluacion) => set((state) => ({
    campers: state.campers.map(c => 
      c.id === evaluacion.camperId 
        ? { ...c, evaluaciones: [...c.evaluaciones, evaluacion] }
        : c
    )
  })),

  addHorarioDiario: (horario) => set((state) => ({
    horariosDiarios: [...state.horariosDiarios, horario]
  })),
  
  addMenu: (menu) => set((state) => ({
    menus: [...state.menus, menu]
  })),
  
  updateMenu: (menu) => set((state) => ({
    menus: state.menus.map(m => m.id === menu.id ? menu : m)
  })),

  asignarMonitorACabana: (monitorId, cabanaId) => set((state) => {
    const cabanasActualizadas = state.cabanas.map(c => ({
      ...c,
      monitorEncargado: c.monitorEncargado === monitorId ? undefined : c.monitorEncargado
    }));

    const cabanaIndex = cabanasActualizadas.findIndex(c => c.id === cabanaId);
    if (cabanaIndex !== -1) {
      cabanasActualizadas[cabanaIndex].monitorEncargado = monitorId;
    }

    const monitoresActualizados = state.monitores.map(m => 
      m.id === monitorId 
        ? { ...m, cabanaAsignada: cabanaId }
        : m
    );

    return {
      cabanas: cabanasActualizadas,
      monitores: monitoresActualizados
    };
  }),

  addCoordinator: (coordinator) => set((state) => {
    if (!state.currentCamp) return state;
    
    return {
      currentCamp: {
        ...state.currentCamp,
        coordinators: [...state.currentCamp.coordinators, coordinator.id]
      }
    };
  }),

  removeCoordinator: (coordinatorId) => set((state) => {
    if (!state.currentCamp) return state;
    if (state.currentCamp.mainCoordinator === coordinatorId) return state;
    
    return {
      currentCamp: {
        ...state.currentCamp,
        coordinators: state.currentCamp.coordinators.filter(id => id !== coordinatorId)
      }
    };
  }),

  updateCoordinatorPermissions: (coordinatorId, permissions) => set((state) => {
    if (!state.currentCoordinator?.isMainCoordinator) return state;
    
    // Update permissions logic here
    return state;
  }),

  updateCoordinator: (updatedCoordinator) => set((state) => ({
    currentCoordinator: state.currentCoordinator?.id === updatedCoordinator.id 
      ? updatedCoordinator 
      : state.currentCoordinator
  })),

  transferMainCoordinator: (newMainCoordinatorId) => set((state) => {
    if (!state.currentCamp || !state.currentCoordinator?.isMainCoordinator) return state;
    
    return {
      currentCamp: {
        ...state.currentCamp,
        mainCoordinator: newMainCoordinatorId
      }
    };
  })
}));