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
  writeBatch,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

// ─── Firestore REST fallback (bypasses SDK connection state) ─────────────────
// Used when the SDK reports "client is offline" — works as a plain HTTPS request.

function parseRestValue(v: unknown): unknown {
  const val = v as Record<string, unknown>;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('booleanValue' in val) return val.booleanValue;
  if ('timestampValue' in val) return new Date(val.timestampValue as string);
  if ('nullValue' in val) return null;
  if ('arrayValue' in val) {
    const values = ((val.arrayValue as Record<string, unknown>).values as unknown[]) ?? [];
    return values.map(parseRestValue);
  }
  if ('mapValue' in val) {
    const fields = ((val.mapValue as Record<string, unknown>).fields as Record<string, unknown>) ?? {};
    return Object.fromEntries(Object.entries(fields).map(([k, fv]) => [k, parseRestValue(fv)]));
  }
  return null;
}

export async function getDocRest(path: string): Promise<Record<string, unknown> | null> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const token = await user.getIdToken();
  const pid = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents/${path}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`REST ${res.status}`);
  const json = await res.json() as { fields?: Record<string, unknown> };
  if (!json.fields) return null;
  return Object.fromEntries(Object.entries(json.fields).map(([k, fv]) => [k, parseRestValue(fv)]));
}

function toRestValue(v: unknown): unknown {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (v instanceof Timestamp) return { timestampValue: v.toDate().toISOString() };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toRestValue) } };
  if (typeof v === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, fv]) => [k, toRestValue(fv)])) } };
  return { nullValue: null };
}

async function setDocRest(path: string, data: Record<string, unknown>): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const token = await user.getIdToken();
  const pid = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const fields = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, toRestValue(v)]));
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents/${path}`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    }
  );
  if (!res.ok) throw new Error(`REST write ${res.status}`);
}

async function deleteDocRest(path: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const token = await user.getIdToken();
  const pid = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents/${path}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok && res.status !== 404) throw new Error(`REST delete ${res.status}`);
}

// Lists all documents in a Firestore subcollection via REST (no SDK connection needed)
async function listCollectionRest<T>(path: string): Promise<T[]> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const token = await user.getIdToken();
  const pid = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents/${path}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`REST list ${res.status}`);
  const json = await res.json() as { documents?: Array<{ name: string; fields?: Record<string, unknown> }> };
  if (!json.documents) return [];
  return json.documents.map(d => {
    const id = d.name.split('/').pop() as string;
    const fields = Object.fromEntries(
      Object.entries(d.fields ?? {}).map(([k, fv]) => [k, parseRestValue(fv)])
    );
    return { id, ...fields } as T;
  });
}

// ── Read helper: races SDK and REST simultaneously, resolves with first winner ─
// No timeout needed — whichever path responds first wins.
// If SDK is offline it rejects immediately → REST result is used.
// If both fail, the error from the last one propagates.
function raceBothReads<T>(sdkFn: () => Promise<T>, restFn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let failures = 0;
    const onFail = (err: unknown) => { if (++failures === 2) reject(err); };
    sdkFn().then(resolve).catch(onFail);
    restFn().then(resolve).catch(onFail);
  });
}

// Keep the old name as an alias so callers don't need updating yet
const sdkWithRestFallback = raceBothReads;

// ── Write helper: REST is authoritative (guaranteed to reach Firestore) ───────
// SDK write fires in background for local cache but is not awaited.
// Rationale: the SDK can resolve setDoc() from its in-memory buffer even when
// the server hasn't received the data, causing sdkWithRestFallback to skip REST.
function restFirstWrite(
  restFn: () => Promise<void>,
  sdkFn: () => Promise<void>
): Promise<void> {
  sdkFn().catch(() => {}); // background — for local SDK cache only
  return restFn();         // this is what we await
}
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
  return sdkWithRestFallback(
    async () => {
      const snapshot = await getDocs(campCol(campId, col));
      return snapshot.docs.map(
        d => ({ id: d.id, ...fromFirestore(d.data() as Record<string, unknown>) } as T)
      );
    },
    () => listCollectionRest<T>(`campamentos/${campId}/${col}`)
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

export function subscribeToCampers(
  campId: string,
  callback: (campers: Camper[]) => void
): () => void {
  return onSnapshot(campCol(campId, 'acampados'), snapshot => {
    callback(snapshot.docs.map(
      d => ({ id: d.id, ...fromFirestore(d.data() as Record<string, unknown>) } as Camper)
    ));
  });
}

export function subscribeToMonitores(
  campId: string,
  callback: (monitores: Monitor[]) => void
): () => void {
  return onSnapshot(campCol(campId, 'monitores'), snapshot => {
    callback(snapshot.docs.map(
      d => ({ id: d.id, ...fromFirestore(d.data() as Record<string, unknown>) } as Monitor)
    ));
  });
}

// ─── Campamento (documento raíz) ─────────────────────────────────────────────

export async function getCampInfo(campId: string): Promise<Camp | null> {
  return raceBothReads(
    async () => {
      const snap = await getDoc(doc(db, 'campamentos', campId));
      if (!snap.exists()) return null;
      return { id: snap.id, ...fromFirestore(snap.data() as Record<string, unknown>) } as Camp;
    },
    async () => {
      const data = await getDocRest(`campamentos/${campId}`);
      if (!data) return null;
      return { id: campId, ...data } as unknown as Camp;
    }
  );
}

export async function saveCampInfo(camp: Camp): Promise<void> {
  const data = toFirestore(camp as unknown as Record<string, unknown>);
  await restFirstWrite(
    () => setDocRest(`campamentos/${camp.id}`, data),
    () => setDoc(doc(db, 'campamentos', camp.id), data)
  );
}

export async function saveJoinCodes(campId: string, monitorCode: string, familyCode: string): Promise<void> {
  const b = writeBatch(db);
  b.set(doc(db, 'codigos', monitorCode), { campId, type: 'monitor' });
  b.set(doc(db, 'codigos', familyCode), { campId, type: 'family' });
  b.commit().catch(() => {});
  await Promise.all([
    setDocRest(`codigos/${monitorCode}`, { campId, type: 'monitor' }),
    setDocRest(`codigos/${familyCode}`, { campId, type: 'family' }),
  ]);
}

export async function getCampByCode(code: string, _type?: string): Promise<Camp | null> {
  const trimmed = code.trim().toUpperCase();
  const codeData = await raceBothReads(
    async () => {
      const snap = await getDoc(doc(db, 'codigos', trimmed));
      return snap.exists() ? (snap.data() as { campId: string }) : null;
    },
    async () => {
      const data = await getDocRest(`codigos/${trimmed}`);
      return data ? { campId: data.campId as string } : null;
    }
  );
  if (!codeData) return null;
  return getCampInfo(codeData.campId);
}

// ─── Perfil de usuario ───────────────────────────────────────────────────────

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await restFirstWrite(
    () => setDocRest(`usuarios/${profile.uid}`, profile as unknown as Record<string, unknown>),
    () => setDoc(doc(db, 'usuarios', profile.uid), profile as unknown as Record<string, unknown>)
  );
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  return raceBothReads(
    async () => {
      const snap = await getDoc(doc(db, 'usuarios', uid));
      return snap.exists() ? (snap.data() as UserProfile) : null;
    },
    async () => {
      const data = await getDocRest(`usuarios/${uid}`);
      return data ? (data as unknown as UserProfile) : null;
    }
  );
}

// ─── CRUD genérico por colección ─────────────────────────────────────────────

function makeCrud<T extends { id: string }>(colName: string) {
  return {
    save: (campId: string, item: T) => {
      const data = toFirestore(item as unknown as Record<string, unknown>);
      const restPath = `campamentos/${campId}/${colName}/${item.id}`;
      return restFirstWrite(
        () => setDocRest(restPath, data),
        () => setDoc(campDocRef(campId, colName, item.id), data)
      );
    },
    update: (campId: string, item: T) =>
      updateDoc(
        campDocRef(campId, colName, item.id),
        toFirestore(item as unknown as Record<string, unknown>)
      ),
    delete: (campId: string, id: string) =>
      restFirstWrite(
        () => deleteDocRest(`campamentos/${campId}/${colName}/${id}`),
        () => deleteDoc(campDocRef(campId, colName, id))
      ),
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
// Saved as a camp subcollection so Firestore rules allow access.

export async function saveCoordinator(campId: string, coordinator: CampCoordinator): Promise<void> {
  const data = coordinator as unknown as Record<string, unknown>;
  await restFirstWrite(
    () => setDocRest(`campamentos/${campId}/coordinadores/${coordinator.id}`, data),
    () => setDoc(doc(db, 'campamentos', campId, 'coordinadores', coordinator.id), data)
  );
}

export async function getCoordinatorProfile(campId: string, uid: string): Promise<Partial<CampCoordinator> | null> {
  return raceBothReads(
    async () => {
      const snap = await getDoc(doc(db, 'campamentos', campId, 'coordinadores', uid));
      return snap.exists() ? (snap.data() as Partial<CampCoordinator>) : null;
    },
    async () => getDocRest(`campamentos/${campId}/coordinadores/${uid}`) as Promise<Partial<CampCoordinator> | null>
  );
}
