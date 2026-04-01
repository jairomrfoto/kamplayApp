import { useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserProfile, subscribeToIncidencias, getCampInfo } from '../services/firestore';
import { useStore } from '../store/store';
import { getLocalProfile, setLocalProfile, updateLocalCamp } from '../utils/localProfile';

export function useFirestoreSync() {
  const { loadFromFirestore, setCurrentCamp, setIncidencias } = useStore();
  const unsubscribeIncidenciasRef = useRef<(() => void) | null>(null);
  const loadedCampIdRef = useRef<string | null>(null);

  const loadCamp = useCallback(async (campId: string, uid: string) => {
    if (!campId || loadedCampIdRef.current === campId) return;
    loadedCampIdRef.current = campId;

    try {
      const camp = await getCampInfo(campId);
      if (camp) {
        setCurrentCamp(camp);
        // Save full camp object to localStorage for offline reload
        updateLocalCamp(uid, campId, camp);
      }

      await loadFromFirestore(campId);

      if (unsubscribeIncidenciasRef.current) unsubscribeIncidenciasRef.current();
      unsubscribeIncidenciasRef.current = subscribeToIncidencias(
        campId,
        (incidencias) => setIncidencias(incidencias)
      );
    } catch (err) {
      console.error('Error loading camp from Firestore:', err);
      // Firestore failed — camp object is already restored from localStorage below
    }
  }, [loadFromFirestore, setCurrentCamp, setIncidencias]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (unsubscribeIncidenciasRef.current) unsubscribeIncidenciasRef.current();
        loadedCampIdRef.current = null;
        return;
      }

      // Step 1: Restore from localStorage immediately (instant, no network)
      const local = getLocalProfile(user.uid);
      if (local?.camp) {
        // Full camp object cached — set it right away
        setCurrentCamp(local.camp);
      }
      if (local?.campId) {
        loadCamp(local.campId, user.uid);
      }

      // Step 2: Verify/refresh from Firestore in background
      try {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          const campId = profile.campId || '';
          setLocalProfile(user.uid, {
            role: profile.role as 'coordinator' | 'monitor' | 'parent',
            campId,
            camp: local?.camp, // keep cached camp until Firestore refreshes it
          });
          // Reload if campId changed (e.g. after joining a new camp)
          if (campId && campId !== local?.campId) {
            loadedCampIdRef.current = null;
            loadCamp(campId, user.uid);
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
  }, [loadCamp, setCurrentCamp]);
}
