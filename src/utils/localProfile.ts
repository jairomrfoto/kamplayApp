/**
 * localStorage helper for user profile (role + campId).
 * Keyed by uid so multiple accounts on the same device work correctly.
 */

export interface LocalProfile {
  role: 'coordinator' | 'monitor' | 'parent';
  campId: string;
}

const key = (uid: string) => `kamplay_profile_${uid}`;

export function getLocalProfile(uid: string): LocalProfile | null {
  try {
    const val = localStorage.getItem(key(uid));
    if (!val) return null;
    const parsed = JSON.parse(val);
    // Accept both new format {role,campId} and legacy format (plain role string)
    if (typeof parsed === 'string') return { role: parsed as LocalProfile['role'], campId: '' };
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
