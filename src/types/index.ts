export interface Camper {
  id: string;
  nombre: string;
  edad: number;
  contacto?: string;
  foto?: string;
  grupo: string;
  cabana: string;
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
  evaluaciones: any[];
}

export interface Material {
  id: string;
  nombre: string;
  cantidad: number;
  estado: 'Disponible' | 'En Uso' | 'Mantenimiento';
  categoria: string;
}

export interface CabinNote {
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