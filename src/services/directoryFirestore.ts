import { signInAnonymously } from 'firebase/auth';
import { auth } from '../config/firebase';
import type { Camp } from '../types/camp';

export interface CampRating {
  parentUid: string;
  estrellas: 1 | 2 | 3 | 4 | 5;
  comentario?: string;
  fecha: string;
  autorNombre: string;
}

const pid    = () => import.meta.env.VITE_FIREBASE_PROJECT_ID as string;
const apiKey = () => import.meta.env.VITE_FIREBASE_API_KEY    as string;

async function getToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

function parseValue(v: unknown): unknown {
  if (!v || typeof v !== 'object') return null;
  const val = v as Record<string, unknown>;
  if ('stringValue'    in val) return val.stringValue;
  if ('integerValue'   in val) return Number(val.integerValue);
  if ('doubleValue'    in val) return Number(val.doubleValue);
  if ('booleanValue'   in val) return val.booleanValue;
  if ('timestampValue' in val) return val.timestampValue;
  if ('nullValue'      in val) return null;
  if ('arrayValue' in val) {
    const values = ((val.arrayValue as Record<string, unknown>).values as unknown[]) ?? [];
    return (values as unknown[]).map(parseValue);
  }
  if ('mapValue' in val) {
    const fields = ((val.mapValue as Record<string, unknown>).fields as Record<string, unknown>) ?? {};
    return Object.fromEntries(Object.entries(fields).map(([k, fv]) => [k, parseValue(fv)]));
  }
  return null;
}

function fieldsToObj(fields: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, parseValue(v)]));
}

// ─── Public: fetch all listed camps ──────────────────────────────────────────
// Uses anonymous auth so isAuth() is always satisfied in security rules.
// Firestore collection queries require auth even when the rule allows public reads.

export async function getListedCamps(): Promise<Partial<Camp>[]> {
  // Get or create an auth token (anonymous if the visitor isn't logged in)
  let token: string | null = null;
  try {
    let user = auth.currentUser;
    if (!user) {
      const cred = await signInAnonymously(auth);
      user = cred.user;
    }
    token = await user.getIdToken();
  } catch {
    // Proceed without token as last resort
  }

  const url = `https://firestore.googleapis.com/v1/projects/${pid()}/databases/(default)/documents:runQuery`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const body = {
    structuredQuery: {
      from: [{ collectionId: 'campamentos' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'listed' },
          op: 'EQUAL',
          value: { booleanValue: true },
        },
      },
      limit: 200,
    },
  };
  try {
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    if (!res.ok) {
      console.error('[getListedCamps] Firestore error', res.status, await res.text());
      return [];
    }
    const json = await res.json() as Array<{ document?: { name: string; fields?: Record<string, unknown> } }>;
    return json
      .filter(r => r.document?.fields)
      .map(r => {
        const id  = r.document!.name.split('/').pop() as string;
        const obj = fieldsToObj(r.document!.fields!);
        return {
          ...obj,
          id,
          startDate: obj.startDate ? new Date(obj.startDate as string) : new Date(),
          endDate:   obj.endDate   ? new Date(obj.endDate   as string) : new Date(),
        } as unknown as Partial<Camp>;
      });
  } catch (err) {
    console.error('[getListedCamps] fetch error', err);
    return [];
  }
}

// ─── Auth: fetch ratings for a camp ──────────────────────────────────────────

export async function getCampRatings(campId: string): Promise<CampRating[]> {
  try {
    const token = await getToken();
    const url = `https://firestore.googleapis.com/v1/projects/${pid()}/databases/(default)/documents/campamentos/${campId}/valoraciones`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return [];
    const json = await res.json() as { documents?: Array<{ name: string; fields?: Record<string, unknown> }> };
    return (json.documents ?? []).map(d => {
      const parentUid = d.name.split('/').pop() as string;
      const f = fieldsToObj(d.fields ?? {});
      return {
        parentUid,
        estrellas:   (f.estrellas   as number) || 5,
        comentario:  (f.comentario  as string) || undefined,
        fecha:       (f.fecha       as string) || '',
        autorNombre: (f.autorNombre as string) || '',
      } as CampRating;
    });
  } catch {
    return [];
  }
}

// ─── Auth: parent submits a rating ───────────────────────────────────────────

export async function submitRating(
  campId: string,
  rating: Omit<CampRating, 'parentUid' | 'fecha'>,
): Promise<void> {
  const token = await getToken();
  const user = auth.currentUser!;

  // Write rating doc (parentUid as document ID → one rating per parent)
  await fetch(
    `https://firestore.googleapis.com/v1/projects/${pid()}/databases/(default)/documents/campamentos/${campId}/valoraciones/${user.uid}`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          estrellas:   { integerValue: String(rating.estrellas) },
          comentario:  { stringValue: rating.comentario || '' },
          fecha:       { timestampValue: new Date().toISOString() },
          autorNombre: { stringValue: rating.autorNombre },
        },
      }),
    },
  );

  // Recompute aggregate on the camp doc (field-masked PATCH)
  const ratings = await getCampRatings(campId);
  const all = [...ratings.filter(r => r.parentUid !== user.uid), { ...rating, parentUid: user.uid, fecha: '' }];
  const avg = all.reduce((s, r) => s + r.estrellas, 0) / all.length;

  await fetch(
    `https://firestore.googleapis.com/v1/projects/${pid()}/databases/(default)/documents/campamentos/${campId}` +
    `?updateMask.fieldPaths=avgRating&updateMask.fieldPaths=ratingCount`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          avgRating:   { doubleValue: avg },
          ratingCount: { integerValue: String(all.length) },
        },
      }),
    },
  );
}

// ─── Auth: coordinator updates their listing settings ────────────────────────

export async function updateCampListing(
  campId: string,
  data: {
    listed: boolean;
    description?: string;
    zona?: string;
    photos?: string[];
    ageMin?: number | null;
    ageMax?: number | null;
  },
): Promise<void> {
  const token = await getToken();
  const mask = [
    'listed', 'description', 'zona', 'photos', 'ageMin', 'ageMax',
  ].map(f => `updateMask.fieldPaths=${f}`).join('&');

  const photos = data.photos ?? [];

  await fetch(
    `https://firestore.googleapis.com/v1/projects/${pid()}/databases/(default)/documents/campamentos/${campId}?${mask}`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          listed:      { booleanValue: data.listed },
          description: { stringValue: data.description || '' },
          zona:        { stringValue: data.zona || '' },
          photos:      { arrayValue: { values: photos.map(u => ({ stringValue: u })) } },
          ageMin:      data.ageMin != null ? { integerValue: String(data.ageMin) } : { nullValue: null },
          ageMax:      data.ageMax != null ? { integerValue: String(data.ageMax) } : { nullValue: null },
        },
      }),
    },
  );
}

// ─── Check if current user already rated a camp ──────────────────────────────

export async function getMyRating(campId: string): Promise<CampRating | null> {
  try {
    const token = await getToken();
    const user = auth.currentUser!;
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${pid()}/databases/(default)/documents/campamentos/${campId}/valoraciones/${user.uid}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (res.status === 404 || !res.ok) return null;
    const json = await res.json() as { fields?: Record<string, unknown> };
    if (!json.fields) return null;
    const f = fieldsToObj(json.fields);
    return {
      parentUid:   user.uid,
      estrellas:   (f.estrellas as number) as CampRating['estrellas'],
      comentario:  (f.comentario as string) || undefined,
      fecha:       (f.fecha      as string) || '',
      autorNombre: (f.autorNombre as string) || '',
    };
  } catch {
    return null;
  }
}
