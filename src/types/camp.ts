export interface Camp {
  id: string;
  name: string;
  type?: 'campamento' | 'campus';
  startDate: Date;
  endDate: Date;
  location: string;
  maxCampers: number;
  monitorsCount: number;
  joinCodes: {
    monitors: string;
    families: string;
    teachers?: string;
  };
  coordinators: string[];
  mainCoordinator: string;
  inscriptionFee?: number; // en céntimos (ej. 5000 = 50 €)
  // Plan de pago
  planType?: 'subscription' | 'standard' | 'express';
  status?: 'draft' | 'active' | 'archived';
  expiresAt?: Date;
  // Directorio público
  listed?: boolean;
  description?: string;
  zona?: string;
  photos?: string[];
  ageMin?: number;
  ageMax?: number;
  avgRating?: number;
  ratingCount?: number;
}

export interface CampCoordinator {
  id: string;
  campId: string;
  email: string;
  name: string;
  role: 'coordinator';
  photo?: string;
  location?: string;
  permissions: {
    manageCoordinators: boolean;
    manageMonitors: boolean;
    manageCampers: boolean;
    manageActivities: boolean;
    manageSchedule: boolean;
    viewReports: boolean;
  };
  isMainCoordinator: boolean;
  experiencia?: {
    campamento: string;
    periodo: string;
    rol: string;
  }[];
  certificaciones?: {
    nombre: string;
    emisor: string;
    fecha: string;
  }[];
  formacion?: {
    titulo: string;
    institucion: string;
    año: string;
  }[];
}