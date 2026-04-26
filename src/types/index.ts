export interface CabinNote {
  id: string;
  fecha: Date;
  texto: string;
  estadoLimpieza: 'Limpia' | 'Necesita Atención' | 'En Limpieza';
  realizadaPor: string;
}

export interface Camper {
  id: string;
  nombre: string;
  edad: number;
  contacto?: string;
  foto?: string;
  grupo: string;
  cabana: string;
  parentUid?: string;   // links camper to their parent's Firebase user
  infoMedica: {
    alergias: string[];
    medicacion: string[];
    notas: string;
    medicacionProgramada?: {
      id: string;
      nombre: string;
      horario: string;
      dosis: string;
      administrada: boolean;
      fechaAdministracion?: Date;
      administradaPor?: string;
    }[];
  };
  evaluaciones: EvaluacionCamper[];
}

export interface Monitor {
  id: string;
  nombre: string;
  especialidad: string;
  grupoAsignado: string;
  cabanaAsignada: string;
  encuestas: EncuestaMonitor[];
  permisos: {
    editarActividades: boolean;
    editarMateriales: boolean;
    editarGrupos: boolean;
    editarCabanas: boolean;
    editarAreaMedica: boolean;
  };
  foto?: string;
  email?: string;
}

export interface EncuestaMonitor {
  id: string;
  monitorId: string;
  fecha: Date;
  respuestas: Record<string, string | number | boolean>;
}

export interface EvaluacionGrupo {
  id: string;
  grupoId: string;
  fecha: Date;
  puntuacion: number;
  comentarios: string;
}

export interface EvaluacionCamper {
  id: string;
  camperId: string;
  fecha: Date;
  participacion: number;
  comportamiento: number;
  integracion: number;
  comentarios?: string;
}

export interface Grupo {
  id: string;
  nombre: string;
  edadMinima: number;
  edadMaxima: number;
  monitores: string[];
  acampados: string[];
  evaluaciones: EvaluacionGrupo[];
}

export interface Cabana {
  id: string;
  numero: string;
  capacidad: number;
  ocupantes: string[];
  monitorEncargado?: string;
  ultimaRevision: Date;
  estado: 'Limpia' | 'Necesita Revisión' | 'En Limpieza';
  notas?: CabinNote[];
}

export interface Material {
  id: string;
  nombre: string;
  cantidad: number;
  estado: 'Disponible' | 'En Uso' | 'Mantenimiento';
  categoria: string;
}

export interface Actividad {
  id: string;
  titulo: string;
  inicio: Date;
  fin: Date;
  grupo: string;
  monitores: string[];
  materiales: string[];
  tipo: 'regular' | 'especial';
  categoria: string;
  duracion: number;
  capacidadMaxima: number;
  edadMinima: number;
  edadMaxima: number;
  descripcion?: string;
  ubicacion: string;
}

export interface HorarioDiario {
  id: string;
  dia: Date;
  actividades: string[];
}

export interface MenuItem {
  id: string;
  fecha: Date;
  comidas: {
    desayuno: string[];
    almuerzo: {
      primerPlato: string;
      segundoPlato: string;
      postre: string;
    };
    merienda: string[];
    cena: {
      primerPlato: string;
      segundoPlato: string;
      postre: string;
    };
  };
  alergenos: string[];
  observaciones?: string;
}

export interface Novedad {
  id: string;
  campId: string;
  texto: string;
  autor: string;
  autorId: string;
  rol: 'coordinator' | 'monitor';
  fecha: Date;
  emoji?: string;
  imagenUrl?: string;
  grupo?: string;
}

export interface Incident {
  id: string;
  tipo: 'leve' | 'moderada' | 'grave';
  categoria: 'medica' | 'comportamiento' | 'seguridad' | 'infraestructura' | 'otra';
  descripcion: string;
  fecha: Date;
  ubicacion: string;
  reportadoPor: string;
  estado: 'pendiente' | 'en_proceso' | 'resuelta';
  accionesTomadas: string;
  acampadosAfectados: string[];
  impacto: 'bajo' | 'medio' | 'alto';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  seguimiento?: {
    fecha: Date;
    comentario: string;
    realizadoPor: string;
    estado?: 'pendiente' | 'en_proceso' | 'resuelta';
    acciones?: string;
  }[];
}

export interface UserProfile {
  uid: string;
  campId: string;
  campIds?: string[];
  role: 'coordinator' | 'monitor' | 'parent';
  email: string;
  nombre: string;
  // Stripe — written only by Cloud Functions (Admin SDK)
  subscriptionStatus?: 'active' | 'past_due' | 'canceled' | 'trialing' | string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeConnectId?: string;
  connectOnboarded?: boolean;
}

export interface ActividadPersonal {
  id: string;
  titulo: string;
  descripcion?: string;
  categoria: string;
  duracion: number;
  edadMinima: number;
  edadMaxima: number;
  capacidadMaxima: number;
  ubicacion: string;
  campId: string;
  campNombre: string;
  fechaGuardado: Date;
}
