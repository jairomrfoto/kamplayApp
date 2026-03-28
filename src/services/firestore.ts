/**
 * Servicio de Firestore para KamplayApp
 *
 * Estructura de datos en Firestore:
 *
 * campamentos/{campId}             <- documento con info del campamento
 *   acampados/{id}
 *   monitores/{id}
 *   grupos/{id}
 *   cabanas/{id}
 *   materiales/{id}
 *   actividades/{id}
 *   horarios/{id}
 *   menus/{id}
 *   incidencias/{id}
 *
 * usuarios/{userId}                <- perfil del usuario (rol + campId)
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
  query,
  where,
  getDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  Camper, Monitor, Grupo, Cabana, Material,
  Actividad, HorarioDiario, MenuItem, Incident, UserProfile,
} from '../types';
import type { Camp, CampCoordinator } from '../types/camp';

// ─── Convertidores de fecha ─────────────────────────────────────────────────

function fromFirestore(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      result[key] = value.toDate();
    } else if (Array.isArray(value)) {
      result[key] = value.map(item =>
        item && typeof item === 'object' && !Array.isArray(item)
          ? fromFirestore(item as Record<string, unknown>)
          : item
      );
    } else if (value && typeof value === 'object' && !(value instanceof Date)) {
      result[key] = fromFirestore(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function toFirestore(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Date) {
      result[key] = Timestamp.fromDate(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map(item =>
        item && typeof item === 'object' && !Array.isArray(item)
          ? toFirestore(item as Record<string, unknown>)
          : item
      );
    } else if (value && typeof value === 'object' && !(value instanceof Timestamp)) {
      result[key] = toFirestore(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// ─── Helpers de rutas ────────────────────────────────────────────────────────

const campCol = (campId: string, col: string) =>
  collection(db, 'campamentos', campId, col);

const campDocRef = (campId: string, col: string, id: string) =>
  doc(db, 'campamentos', campId, col, id);

// ─── Carga de colecciones ────────────────────────────────────────────────────

async function loadCollection<T>(campId: string, col: string): Promise<T[]> {
  const snapshot = await getDocs(campCol(campId, col));
  return snapshot.docs.map(
    d => ({ id: d.id, ...fromFirestore(d.data() as Record<string, unknown>) } as T)
  );
}

// ─── Carga de todos los datos de un campamento ───────────────────────────────

export interface CampData {
  campers: Camper[];
  monitores: Monitor[];
  grupos: Grupo[];
  cabanas: Cabana[];
  materiales: Material[];
  actividades: Actividad[];
  horariosDiarios: HorarioDiario[];
  menus: MenuItem[];
  incidencias: Incident[];
}

export async function loadCampData(campId: string): Promise<CampData> {
  const [
    campers, monitores, grupos, cabanas, materiales,
    actividades, horariosDiarios, menus, incidencias,
  ] = await Promise.all([
    loadCollection<Camper>(campId, 'acampados'),
    loadCollection<Monitor>(campId, 'monitores'),
    loadCollection<Grupo>(campId, 'grupos'),
    loadCollection<Cabana>(campId, 'cabanas'),
    loadCollection<Material>(campId, 'materiales'),
    loadCollection<Actividad>(campId, 'actividades'),
    loadCollection<HorarioDiario>(campId, 'horarios'),
    loadCollection<MenuItem>(campId, 'menus'),
    loadCollection<Incident>(campId, 'incidencias'),
  ]);

  return { campers, monitores, grupos, cabanas, materiales, actividades, horariosDiarios, menus, incidencias };
}

// ─── Listener en tiempo real para incidencias ────────────────────────────────

export function subscribeToIncidencias(
  campId: string,
  callback: (incidencias: Incident[]) => void
): () => void {
  return onSnapshot(campCol(campId, 'incidencias'), snapshot => {
    const incidencias = snapshot.docs.map(
      d => ({ id: d.id, ...fromFirestore(d.data() as Record<string, unknown>) } as Incident)
    );
    callback(incidencias);
  });
}

// ─── Campamento (documento raíz) ─────────────────────────────────────────────

export async function saveCampInfo(camp: Camp): Promise<void> {
  await setDoc(
    doc(db, 'campamentos', camp.id),
    toFirestore(camp as unknown as Record<string, unknown>)
  );
}

export async function getCampByCode(
  code: string,
  type: 'monitor' | 'family'
): Promise<Camp | null> {
  const field = type === 'monitor' ? 'joinCodes.monitors' : 'joinCodes.families';
  const q = query(collection(db, 'campamentos'), where(field, '==', code));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...fromFirestore(d.data() as Record<string, unknown>) } as Camp;
}

// ─── Perfil de usuario ───────────────────────────────────────────────────────

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await setDoc(doc(db, 'usuarios', profile.uid), profile);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'usuarios', uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

// ─── CRUD genérico por colección ─────────────────────────────────────────────

function makeCrud<T extends { id: string }>(colName: string) {
  return {
    save: (campId: string, item: T) =>
      setDoc(
        campDocRef(campId, colName, item.id),
        toFirestore(item as unknown as Record<string, unknown>)
      ),
    update: (campId: string, item: T) =>
      updateDoc(
        campDocRef(campId, colName, item.id),
        toFirestore(item as unknown as Record<string, unknown>)
      ),
    delete: (campId: string, id: string) =>
      deleteDoc(campDocRef(campId, colName, id)),
  };
}

export const firestoreCampers    = makeCrud<Camper>('acampados');
export const firestoreMonitores  = makeCrud<Monitor>('monitores');
export const firestoreGrupos     = makeCrud<Grupo>('grupos');
export const firestoreCabanas    = makeCrud<Cabana>('cabanas');
export const firestoreMateriales = makeCrud<Material>('materiales');
export const firestoreActividades = makeCrud<Actividad>('actividades');
export const firestoreHorarios   = makeCrud<HorarioDiario>('horarios');
export const firestoreMenus      = makeCrud<MenuItem>('menus');
export const firestoreIncidencias = makeCrud<Incident>('incidencias');

// ─── Coordinador ─────────────────────────────────────────────────────────────

export async function saveCoordinator(coordinator: CampCoordinator): Promise<void> {
  await setDoc(
    doc(db, 'coordinadores', coordinator.id),
    coordinator as unknown as Record<string, unknown>
  );
}
