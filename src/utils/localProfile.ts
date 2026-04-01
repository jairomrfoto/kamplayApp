/**
 * localStorage helpers — stores user profile AND full camp object.
 * Keyed by uid so multiple accounts on the same device work correctly.
 * This makes the app fully resilient to Firestore being offline.
 */

import type { Camp } from '../types/camp';

export interface LocalProfile {
  role: 'coordinator' | 'monitor' | 'parent';
  campId: string;
  camp?: Camp;  // full camp object so reload works without Firestore
}

const key = (uid: string) => `kamplay_profile_${uid}`;

export function getLocalProfile(uid: string): LocalProfile | null {
  try {
    const val = localStorage.getItem(key(uid));
    if (!val) return null;
    const parsed = JSON.parse(val);
    // Accept legacy format (plain role string)
    if (typeof parsed === 'string') return { role: parsed as LocalProfile['role'], campId: '' };
    // Restore Date objects inside camp (they get serialised as strings)
    if (parsed.camp) {
      if (parsed.camp.startDate) parsed.camp.startDate = new Date(parsed.camp.startDate);
      if (parsed.camp.endDate) parsed.camp.endDate = new Date(parsed.camp.endDate);
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
  if (current) setLocalProfile(uid, { ...current, campId, camp });
}
