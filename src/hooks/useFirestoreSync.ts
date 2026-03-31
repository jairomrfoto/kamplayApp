import { useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserProfile, subscribeToIncidencias, getCampInfo } from '../services/firestore';
import { useStore } from '../store/store';
import { getLocalProfile, setLocalProfile } from '../utils/localProfile';

export function useFirestoreSync() {
  const { loadFromFirestore, setCurrentCamp, setIncidencias } = useStore();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      if (!user) return;

      let campId = '';

      try {
        const profile = await getUserProfile(user.uid);
        if (profile?.campId) {
          campId = profile.campId;
          // Keep localStorage in sync with Firestore
          setLocalProfile(user.uid, {
            role: profile.role as 'coordinator' | 'monitor' | 'parent',
            campId: profile.campId,
          });
        }
      } catch {
        // Firestore offline — fall back to localStorage
        const local = getLocalProfile(user.uid);
        if (local?.campId) campId = local.campId;
      }

      if (!campId) return;

      try {
        const camp = await getCampInfo(campId);
        if (camp) setCurrentCamp(camp);

        await loadFromFirestore(campId);

        unsubscribeRef.current = subscribeToIncidencias(
          campId,
          (incidencias) => setIncidencias(incidencias)
        );
      } catch (error) {
        console.error('Error sincronizando datos con Firestore:', error);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, [loadFromFirestore, setCurrentCamp, setIncidencias]);
}
