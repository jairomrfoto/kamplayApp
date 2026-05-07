import type { Camp } from '../types/camp';
import type {
  Camper, Monitor, Grupo, Cabana, Material,
  Actividad, HorarioDiario, MenuItem, Incident, Novedad,
} from '../types';

export const DEMO_CAMP_ID = '__demo__';

const d = (month: number, day: number, hour = 0, min = 0) =>
  new Date(2026, month - 1, day, hour, min);

// ── Campamento ────────────────────────────────────────────────────────────────
export const demoCamp: Camp = {
  id: DEMO_CAMP_ID,
  name: 'Campamento Verano Demo',
  type: 'campamento',
  startDate: d(7, 1),
  endDate: d(7, 14),
  location: 'Sierra de Gredos, Ávila',
  maxCampers: 40,
  monitorsCount: 4,
  joinCodes: { monitors: 'DEMO-MON', families: 'DEMO-FAM' },
  coordinators: ['__demo_coord__'],
  mainCoordinator: '__demo_coord__',
  planType: 'standard',
  status: 'active',
  description: 'Campamento de demostración — todos los datos son de ejemplo para que explores la aplicación.',
};

// ── Monitores ─────────────────────────────────────────────────────────────────
export const demoMonitores: Monitor[] = [
  {
    id: 'mon1', nombre: 'Laura Martínez', especialidad: 'Deportes acuáticos',
    grupoAsignado: 'grp1', cabanaAsignada: 'cab1', encuestas: [],
    permisos: { editarActividades: true, editarMateriales: true, editarGrupos: true, editarCabanas: false, editarAreaMedica: false, asistencia: true },
    foto: '', email: 'laura@demo.kamplay.es',
  },
  {
    id: 'mon2', nombre: 'Carlos Ruiz', especialidad: 'Aventura y montaña',
    grupoAsignado: 'grp2', cabanaAsignada: 'cab2', encuestas: [],
    permisos: { editarActividades: true, editarMateriales: false, editarGrupos: false, editarCabanas: false, editarAreaMedica: false, asistencia: true },
    foto: '', email: 'carlos@demo.kamplay.es',
  },
  {
    id: 'mon3', nombre: 'Ana García', especialidad: 'Manualidades y creatividad',
    grupoAsignado: 'grp3', cabanaAsignada: 'cab3', encuestas: [],
    permisos: { editarActividades: true, editarMateriales: true, editarGrupos: false, editarCabanas: false, editarAreaMedica: true, asistencia: true },
    foto: '', email: 'ana@demo.kamplay.es',
  },
  {
    id: 'mon4', nombre: 'David López', especialidad: 'Educación ambiental',
    grupoAsignado: 'grp1', cabanaAsignada: 'cab1', encuestas: [],
    permisos: { editarActividades: false, editarMateriales: false, editarGrupos: false, editarCabanas: false, editarAreaMedica: false, asistencia: true },
    foto: '', email: 'david@demo.kamplay.es',
  },
];

// ── Acampados ─────────────────────────────────────────────────────────────────
export const demoCampers: Camper[] = [
  {
    id: 'c1', nombre: 'Sofía Torres', edad: 10, grupo: 'grp1', cabana: 'cab1',
    infoMedica: { alergias: ['Polen'], medicacion: [], notas: 'Leve alergia estacional.' },
    evaluaciones: [],
  },
  {
    id: 'c2', nombre: 'Pablo Sánchez', edad: 11, grupo: 'grp1', cabana: 'cab1',
    infoMedica: { alergias: [], medicacion: [], notas: '' },
    evaluaciones: [],
  },
  {
    id: 'c3', nombre: 'Marta González', edad: 10, grupo: 'grp1', cabana: 'cab1',
    infoMedica: { alergias: ['Frutos secos'], medicacion: ['Epipen (si necesario)'], notas: 'Alergia grave a frutos secos. Lleva Epipen siempre.' },
    evaluaciones: [],
  },
  {
    id: 'c4', nombre: 'Álvaro Fernández', edad: 9, grupo: 'grp1', cabana: 'cab1',
    infoMedica: { alergias: [], medicacion: ['Ibuprofeno si fiebre'], notas: '' },
    evaluaciones: [],
  },
  {
    id: 'c5', nombre: 'Lucía Ramírez', edad: 12, grupo: 'grp2', cabana: 'cab2',
    infoMedica: { alergias: [], medicacion: [], notas: 'Lleva audífono. No sumergir.' },
    evaluaciones: [],
  },
  {
    id: 'c6', nombre: 'Diego Moreno', edad: 13, grupo: 'grp2', cabana: 'cab2',
    infoMedica: { alergias: ['Lácteos'], medicacion: [], notas: 'Intolerante a la lactosa.' },
    evaluaciones: [],
  },
  {
    id: 'c7', nombre: 'Valeria López', edad: 12, grupo: 'grp2', cabana: 'cab2',
    infoMedica: { alergias: [], medicacion: [], notas: '' },
    evaluaciones: [],
  },
  {
    id: 'c8', nombre: 'Javier Martín', edad: 13, grupo: 'grp2', cabana: 'cab2',
    infoMedica: { alergias: ['Gluten'], medicacion: [], notas: 'Celiaco. Requiere menú sin gluten.' },
    evaluaciones: [],
  },
  {
    id: 'c9', nombre: 'Carmen Díaz', edad: 15, grupo: 'grp3', cabana: 'cab3',
    infoMedica: { alergias: [], medicacion: [], notas: '' },
    evaluaciones: [],
  },
  {
    id: 'c10', nombre: 'Iván Jiménez', edad: 14, grupo: 'grp3', cabana: 'cab3',
    infoMedica: { alergias: [], medicacion: ['Ventolín'], notas: 'Asma leve. Inhalador en su mochila.' },
    evaluaciones: [],
  },
  {
    id: 'c11', nombre: 'Elena Ruiz', edad: 15, grupo: 'grp3', cabana: 'cab3',
    infoMedica: { alergias: [], medicacion: [], notas: '' },
    evaluaciones: [],
  },
  {
    id: 'c12', nombre: 'Marco Torres', edad: 14, grupo: 'grp3', cabana: 'cab3',
    infoMedica: { alergias: [], medicacion: [], notas: '' },
    evaluaciones: [],
  },
];

// ── Grupos ────────────────────────────────────────────────────────────────────
export const demoGrupos: Grupo[] = [
  { id: 'grp1', nombre: 'Lobatos', edadMinima: 8, edadMaxima: 11, monitores: ['mon1', 'mon4'], acampados: ['c1', 'c2', 'c3', 'c4'], evaluaciones: [] },
  { id: 'grp2', nombre: 'Exploradores', edadMinima: 11, edadMaxima: 13, monitores: ['mon2'], acampados: ['c5', 'c6', 'c7', 'c8'], evaluaciones: [] },
  { id: 'grp3', nombre: 'Rovers', edadMinima: 14, edadMaxima: 16, monitores: ['mon3'], acampados: ['c9', 'c10', 'c11', 'c12'], evaluaciones: [] },
];

// ── Cabañas ───────────────────────────────────────────────────────────────────
export const demoCabanas: Cabana[] = [
  { id: 'cab1', numero: 'A', capacidad: 8, ocupantes: ['c1', 'c2', 'c3', 'c4'], monitorEncargado: 'mon1', ultimaRevision: d(7, 1), estado: 'Limpia', notas: [] },
  { id: 'cab2', numero: 'B', capacidad: 8, ocupantes: ['c5', 'c6', 'c7', 'c8'], monitorEncargado: 'mon2', ultimaRevision: d(7, 2), estado: 'Limpia', notas: [] },
  { id: 'cab3', numero: 'C', capacidad: 8, ocupantes: ['c9', 'c10', 'c11', 'c12'], monitorEncargado: 'mon3', ultimaRevision: d(7, 1), estado: 'Necesita Revisión', notas: [] },
];

// ── Materiales ────────────────────────────────────────────────────────────────
export const demoMateriales: Material[] = [
  { id: 'mat1', nombre: 'Kayaks (x4)', cantidad: 4, estado: 'Disponible', categoria: 'Deportes acuáticos' },
  { id: 'mat2', nombre: 'Cascos de escalada', cantidad: 12, estado: 'Disponible', categoria: 'Aventura' },
  { id: 'mat3', nombre: 'Cuerdas de escalada (30 m)', cantidad: 3, estado: 'En Uso', categoria: 'Aventura' },
  { id: 'mat4', nombre: 'Botiquín de primeros auxilios', cantidad: 2, estado: 'Disponible', categoria: 'Sanidad' },
  { id: 'mat5', nombre: 'Pinturas y pinceles', cantidad: 30, estado: 'Disponible', categoria: 'Manualidades' },
  { id: 'mat6', nombre: 'Tiendas de campaña (6 plazas)', cantidad: 5, estado: 'Disponible', categoria: 'Equipamiento' },
  { id: 'mat7', nombre: 'Sacos de dormir', cantidad: 15, estado: 'Mantenimiento', categoria: 'Equipamiento' },
];

// ── Actividades ───────────────────────────────────────────────────────────────
export const demoActividades: Actividad[] = [
  {
    id: 'act1', titulo: 'Kayak en el río',
    inicio: d(7, 2, 10, 0), fin: d(7, 2, 12, 0),
    grupo: 'grp1', monitores: ['mon1'], materiales: ['mat1'],
    tipo: 'especial', categoria: 'Deportes acuáticos', duracion: 120,
    capacidadMaxima: 8, edadMinima: 8, edadMaxima: 11,
    descripcion: 'Iniciación al kayak en aguas tranquilas del río Tormes. Se proporcionan chalecos y remos.',
    ubicacion: 'Río Tormes',
  },
  {
    id: 'act2', titulo: 'Escalada en roca',
    inicio: d(7, 3, 9, 0), fin: d(7, 3, 13, 0),
    grupo: 'grp2', monitores: ['mon2'], materiales: ['mat2', 'mat3'],
    tipo: 'especial', categoria: 'Aventura', duracion: 240,
    capacidadMaxima: 8, edadMinima: 11, edadMaxima: 13,
    descripcion: 'Iniciación a la escalada en pared natural con arneses y cuerdas. Monitor certificado en rescate.',
    ubicacion: 'Pared sur del Circo de Gredos',
  },
  {
    id: 'act3', titulo: 'Taller de manualidades',
    inicio: d(7, 4, 16, 0), fin: d(7, 4, 18, 0),
    grupo: 'grp3', monitores: ['mon3'], materiales: ['mat5'],
    tipo: 'regular', categoria: 'Creatividad', duracion: 120,
    capacidadMaxima: 12, edadMinima: 14, edadMaxima: 16,
    descripcion: 'Creación de máscaras y decoración con materiales naturales del entorno.',
    ubicacion: 'Zona cubierta del campamento',
  },
  {
    id: 'act4', titulo: 'Senderismo — Laguna Grande',
    inicio: d(7, 5, 8, 30), fin: d(7, 5, 14, 0),
    grupo: 'grp2', monitores: ['mon2', 'mon4'], materiales: [],
    tipo: 'especial', categoria: 'Naturaleza', duracion: 330,
    capacidadMaxima: 16, edadMinima: 11, edadMaxima: 16,
    descripcion: 'Ruta de senderismo hasta la Laguna Grande de Gredos con avistamiento de fauna autóctona.',
    ubicacion: 'Laguna Grande de Gredos',
  },
  {
    id: 'act5', titulo: 'Noche de estrellas',
    inicio: d(7, 6, 22, 0), fin: d(7, 7, 0, 0),
    grupo: 'grp3', monitores: ['mon3', 'mon4'], materiales: [],
    tipo: 'especial', categoria: 'Educación ambiental', duracion: 120,
    capacidadMaxima: 12, edadMinima: 14, edadMaxima: 16,
    descripcion: 'Observación astronómica y charla sobre constelaciones. Lluvia de Perseidas desde el mirador.',
    ubicacion: 'Mirador del Risco del Prado',
  },
  {
    id: 'act6', titulo: 'Gymkana grupal',
    inicio: d(7, 7, 10, 0), fin: d(7, 7, 12, 30),
    grupo: 'grp1', monitores: ['mon1', 'mon4'], materiales: [],
    tipo: 'especial', categoria: 'Juegos', duracion: 150,
    capacidadMaxima: 40, edadMinima: 8, edadMaxima: 16,
    descripcion: 'Gymkana entre todos los grupos con pruebas de habilidad, trabajo en equipo y orientación.',
    ubicacion: 'Campo central del campamento',
  },
];

// ── Horarios diarios (mapea actividades a su día) ─────────────────────────────
export const demoHorarios: HorarioDiario[] = [
  { id: 'hor1', dia: d(7, 2), actividades: ['act1'] },
  { id: 'hor2', dia: d(7, 3), actividades: ['act2'] },
  { id: 'hor3', dia: d(7, 4), actividades: ['act3'] },
  { id: 'hor4', dia: d(7, 5), actividades: ['act4'] },
  { id: 'hor5', dia: d(7, 6), actividades: ['act5'] },
  { id: 'hor6', dia: d(7, 7), actividades: ['act6'] },
];

// ── Menú semanal ──────────────────────────────────────────────────────────────
export const demoMenus: MenuItem[] = [
  {
    id: 'menu1', fecha: d(7, 2),
    comidas: {
      desayuno: ['Tostadas con tomate y aceite', 'Fruta de temporada', 'Leche o zumo natural'],
      almuerzo: { primerPlato: 'Gazpacho andaluz', segundoPlato: 'Pollo asado con patatas', postre: 'Sandía' },
      merienda: ['Bocadillo de jamón', 'Agua'],
      cena: { primerPlato: 'Ensalada mixta', segundoPlato: 'Tortilla de patatas', postre: 'Yogur natural' },
    },
    alergenos: ['Gluten', 'Huevo', 'Lácteos'],
  },
  {
    id: 'menu2', fecha: d(7, 3),
    comidas: {
      desayuno: ['Cereales con leche', 'Plátano', 'Zumo de naranja natural'],
      almuerzo: { primerPlato: 'Lentejas estofadas', segundoPlato: 'Merluza al horno con verduras', postre: 'Melocotón' },
      merienda: ['Fruta variada', 'Galletas'],
      cena: { primerPlato: 'Crema de verduras', segundoPlato: 'Filetes de ternera a la plancha', postre: 'Helado artesano' },
    },
    alergenos: ['Gluten', 'Pescado', 'Lácteos'],
  },
  {
    id: 'menu3', fecha: d(7, 4),
    comidas: {
      desayuno: ['Pan con mantequilla y mermelada', 'Fruta', 'Leche'],
      almuerzo: { primerPlato: 'Ensalada de pasta', segundoPlato: 'Hamburguesa casera con patatas fritas', postre: 'Flan' },
      merienda: ['Frutos secos', 'Agua'],
      cena: { primerPlato: 'Sopa de fideos', segundoPlato: 'Pechuga de pavo a la plancha con arroz', postre: 'Fruta' },
    },
    alergenos: ['Gluten', 'Huevo', 'Lácteos', 'Frutos secos'],
  },
];

// ── Incidencias ───────────────────────────────────────────────────────────────
export const demoIncidencias: Incident[] = [
  {
    id: 'inc1', tipo: 'leve', categoria: 'medica',
    descripcion: 'Sofía Torres se rozó la rodilla durante la actividad de kayak. Se limpió y curó en el botiquín.',
    fecha: d(7, 2, 11, 30), ubicacion: 'Orilla del río Tormes',
    reportadoPor: 'Laura Martínez', estado: 'resuelta',
    accionesTomadas: 'Cura de herida superficial. Se notificó a la familia por teléfono.',
    acampadosAfectados: ['c1'], impacto: 'bajo', prioridad: 'baja', seguimiento: [],
  },
  {
    id: 'inc2', tipo: 'moderada', categoria: 'seguridad',
    descripcion: 'Javier Martín consumió accidentalmente producto con gluten durante la merienda. Reacción leve controlada.',
    fecha: d(7, 3, 17, 0), ubicacion: 'Comedor principal',
    reportadoPor: 'Carlos Ruiz', estado: 'en_proceso',
    accionesTomadas: 'Antihistamínico administrado. Revisión del protocolo de alergias con cocina.',
    acampadosAfectados: ['c8'], impacto: 'medio', prioridad: 'media',
    seguimiento: [
      { fecha: d(7, 3, 20, 0), comentario: 'Estado estable. Sin síntomas adicionales.', realizadoPor: 'Laura Martínez' },
    ],
  },
];

// ── Novedades ─────────────────────────────────────────────────────────────────
export const demoNovedades: Novedad[] = [
  {
    id: 'nov1', campId: DEMO_CAMP_ID,
    texto: '¡Primera jornada completada con éxito! Los Lobatos disfrutaron mucho del kayak. Los Exploradores están muy emocionados con la escalada de mañana 🎉',
    autor: 'Laura Martínez', autorId: 'mon1', rol: 'monitor',
    fecha: d(7, 2, 20, 0), emoji: '🚣', grupo: 'grp1',
  },
  {
    id: 'nov2', campId: DEMO_CAMP_ID,
    texto: 'Recordatorio: mañana salida de senderismo a las 8:30. Llevar agua, snack y protector solar. Calzado de montaña obligatorio.',
    autor: 'Demo Coordinador', autorId: '__demo_coord__', rol: 'coordinator',
    fecha: d(7, 4, 21, 0), emoji: '🥾',
  },
  {
    id: 'nov3', campId: DEMO_CAMP_ID,
    texto: 'La Cabaña C necesita revisión del grifo de la ducha. Carlos ya ha avisado al encargado de mantenimiento.',
    autor: 'Ana García', autorId: 'mon3', rol: 'monitor',
    fecha: d(7, 5, 9, 0), emoji: '🔧', grupo: 'grp3',
  },
];
