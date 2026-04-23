/**
 * localStorage helpers — stores user profile AND full camp objects.
 * Keyed by uid so multiple accounts on the same device work correctly.
 * Supports multiple camps per user (campIds + camps cache).
 */

import type { Camp } from '../types/camp';

export interface LocalProfile {
  role: 'coordinator' | 'monitor' | 'parent';
  campId: string;                     // active camp ID
  campIds?: string[];                  // all camp IDs user belongs to
  camp?: Camp;                         // active camp object (offline cache)
  camps?: Record<string, Camp>;        // all camps keyed by ID
}

const key = (uid: string) => `kamplay_profile_${uid}`;

function restoreDates(camp: Camp): Camp {
  if (camp.startDate) camp.startDate = new Date(camp.startDate);
  if (camp.endDate) camp.endDate = new Date(camp.endDate);
  return camp;
}

export function getLocalProfile(uid: string): LocalProfile | null {
  try {
    const val = localStorage.getItem(key(uid));
    if (!val) return null;
    const parsed = JSON.parse(val);
    if (typeof parsed === 'string') return { role: parsed as LocalProfile['role'], campId: '' };
    if (parsed.camp) parsed.camp = restoreDates(parsed.camp);
    if (parsed.camps) {
      for (const id of Object.keys(parsed.camps)) {
        parsed.camps[id] = restoreDates(parsed.camps[id]);
      }
    }
    return parsed as LocalProfile;
  } catch { return null; }
}

export function setLocalProfile(uid: string, profile: LocalProfile) {
  try { localStorage.setItem(key(uid), JSON.stringify(profile)); } catch { /* ignore */ }
}

export function updateLocalCampId(uid: string, campId: string) {
  const current = getLocalProfile(uid);
  if (current) setLocalProfile(uid, { ...current, campId });
}

export function updateLocalCamp(uid: string, campId: string, camp: Camp) {
  const current = getLocalProfile(uid);
  if (current) setLocalProfile(uid, { ...current, campId, camp, camps: { ...(current.camps || {}), [campId]: camp } });
}

/** Add (or update) a camp to the user's local profile without replacing the others. */
export function addLocalCamp(uid: string, campId: string, camp: Camp, role?: LocalProfile['role']) {
  const current = getLocalProfile(uid);
  const base: LocalProfile = current || { role: role || 'monitor', campId };
  const existingIds = current?.campIds || (current?.campId ? [current.campId] : []);
  const campIds = Array.from(new Set([...existingIds, campId]));
  const camps = { ...(current?.camps || {}), [campId]: camp };
  setLocalProfile(uid, { ...base, role: role || base.role, campId, campIds, camp, camps });
}
