import { useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserProfile, subscribeToIncidencias, getCampInfo } from '../services/firestore';
import { useStore } from '../store/store';
import { getLocalProfile, setLocalProfile } from '../utils/localProfile';

export function useFirestoreSync() {
  const { loadFromFirestore, setCurrentCamp, setIncidencias } = useStore();
  const unsubscribeIncidenciasRef = useRef<(() => void) | null>(null);
  const loadedCampIdRef = useRef<string | null>(null);

  const loadCamp = useCallback(async (campId: string) => {
    if (!campId || loadedCampIdRef.current === campId) return;
    loadedCampIdRef.current = campId;

    try {
      const camp = await getCampInfo(campId);
      if (camp) setCurrentCamp(camp);

      await loadFromFirestore(campId);

      if (unsubscribeIncidenciasRef.current) unsubscribeIncidenciasRef.current();
      unsubscribeIncidenciasRef.current = subscribeToIncidencias(
        campId,
        (incidencias) => setIncidencias(incidencias)
      );
    } catch (err) {
      console.error('Error loading camp data:', err);
    }
  }, [loadFromFirestore, setCurrentCamp, setIncidencias]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (unsubscribeIncidenciasRef.current) unsubscribeIncidenciasRef.current();
        loadedCampIdRef.current = null;
        return;
      }

      // Step 1: Load from localStorage immediately — instant, no network needed
      const local = getLocalProfile(user.uid);
      if (local?.campId) {
        loadCamp(local.campId);
      }

      // Step 2: Verify with Firestore in background, update if campId changed
      try {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setLocalProfile(user.uid, {
            role: profile.role as 'coordinator' | 'monitor' | 'parent',
            campId: profile.campId || '',
          });
          // If Firestore has a different/newer campId, reload
          if (profile.campId && profile.campId !== local?.campId) {
            loadedCampIdRef.current = null; // reset so loadCamp runs again
            loadCamp(profile.campId);
          }
        }
      } catch {
        // Firestore offline — localStorage already handled this
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeIncidenciasRef.current) unsubscribeIncidenciasRef.current();
    };
  }, [loadCamp]);
}
