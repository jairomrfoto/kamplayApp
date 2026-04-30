import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getDocRest } from './firestore';
import type { UserProfile } from '../types';
import type { Camp } from '../types/camp';

function fromTs(v: unknown): unknown {
  if (v instanceof Timestamp) return v.toDate();
  if (Array.isArray(v)) return v.map(fromTs);
  if (v && typeof v === 'object' && !(v instanceof Date)) {
    return Object.fromEntries(
      Object.entries(v as Record<string, unknown>).map(([k, fv]) => [k, fromTs(fv)])
    );
  }
  return v;
}

export interface AdminUser extends UserProfile {
  lastSeen?: Date;
}

export interface AdminPayment {
  id: string;
  campId: string;
  parentUid: string;
  amount: number;      // cents
  status: string;
  createdAt?: Date;
  campName?: string;
}

export async function adminGetAllUsers(): Promise<AdminUser[]> {
  const snap = await getDocs(collection(db, 'usuarios'));
  // Always derive uid from the document ID — never trust data-only uid
  return snap.docs.map(d => ({ uid: d.id, ...fromTs(d.data()) } as AdminUser));
}

export async function adminGetAllCamps(): Promise<Camp[]> {
  const snap = await getDocs(collection(db, 'campamentos'));
  return snap.docs.map(d => ({ id: d.id, ...fromTs(d.data()) } as Camp));
}

export async function adminGetAllPayments(): Promise<AdminPayment[]> {
  const snap = await getDocs(collection(db, 'pagos'));
  return snap.docs.map(d => ({ id: d.id, ...fromTs(d.data()) } as AdminPayment));
}

/** Returns number of campers and monitors for a given camp (best-effort). */
export async function adminGetCampStats(campId: string): Promise<{ campers: number; monitores: number }> {
  try {
    const [cSnap, mSnap] = await Promise.all([
      getDocs(collection(db, 'campamentos', campId, 'acampados')),
      getDocs(collection(db, 'campamentos', campId, 'monitores')),
    ]);
    return { campers: cSnap.size, monitores: mSnap.size };
  } catch {
    return { campers: 0, monitores: 0 };
  }
}
