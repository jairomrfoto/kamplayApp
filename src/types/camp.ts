export interface Camp {
  id: string;
  name: string;
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