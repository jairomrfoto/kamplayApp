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
  };
  coordinators: string[];
  mainCoordinator: string;
}

export interface CampCoordinator {
  id: string;
  campId: string;
  email: string;
  name: string;
  role: 'coordinator';
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