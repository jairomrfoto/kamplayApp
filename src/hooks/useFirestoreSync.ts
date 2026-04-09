import { useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserProfile, subscribeToIncidencias, getCampInfo, saveCampInfo, saveUserProfile, saveJoinCodes } from '../services/firestore';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useStore } from '../store/store';
import { getLocalProfile, setLocalProfile, updateLocalCamp } from '../utils/localProfile';

export function useFirestoreSync() {
  const { loadFromFirestore, setCurrentCamp, setIncidencias } = useStore();
  const unsubscribeIncidenciasRef = useRef<(() => void) | null>(null);
  const loadedCampIdRef = useRef<string | null>(null);

  const loadCamp = useCallback(async (campId: string, uid: string, localCamp?: any) => {
    if (!campId || loadedCampIdRef.current === campId) return;
    loadedCampIdRef.current = campId;

    try {
      let camp = await getCampInfo(campId);

      if (!camp && localCamp) {
        // Camp exists in localStorage but not in Firestore (was created while offline)
        // Re-upload it now that we have connectivity
        console.log('Re-syncing camp to Firestore:', campId);
        await saveCampInfo(localCamp);
        camp = localCamp;
      }

      if (camp) {
        setCurrentCamp(camp);
        updateLocalCamp(uid, campId, camp);

        // Ensure join codes exist in Firestore (may be missing if camp was created before this feature)
        const monCode = camp.joinCodes?.monitors;
        const famCode = camp.joinCodes?.families;
        if (monCode && famCode) {
          const codeSnap = await getDoc(doc(db, 'codigos', monCode)).catch(() => null);
          if (!codeSnap?.exists()) {
            saveJoinCodes(campId, monCode, famCode).catch(() => {});
          }
        }
      }

      await loadFromFirestore(campId);

      if (unsubscribeIncidenciasRef.current) unsubscribeIncidenciasRef.current();
      unsubscribeIncidenciasRef.current = subscribeToIncidencias(
        campId,
        (incidencias) => setIncidencias(incidencias)
      );
    } catch (err) {
      console.error('Error loading camp from Firestore:', err);
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
      if (local?.camp) setCurrentCamp(local.camp);
      if (local?.campId) loadCamp(local.campId, user.uid, local.camp);

      // Step 2: Verify/refresh profile from Firestore
      try {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          const campId = profile.campId || '';
          setLocalProfile(user.uid, {
            role: profile.role as 'coordinator' | 'monitor' | 'parent',
            campId,
            camp: local?.camp,
          });
          if (campId && campId !== local?.campId) {
            loadedCampIdRef.current = null;
            loadCamp(campId, user.uid, local?.camp);
          }
        } else if (local?.campId) {
          // Profile not in Firestore either — re-upload it
          const localRole = local.role || 'coordinator';
          await saveUserProfile({ uid: user.uid, campId: local.campId, role: localRole, email: user.email || '', nombre: user.displayName || '' });
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
