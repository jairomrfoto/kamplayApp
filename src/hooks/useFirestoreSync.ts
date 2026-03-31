import { useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserProfile, subscribeToIncidencias, getCampInfo } from '../services/firestore';
import { useStore } from '../store/store';

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

      try {
        const profile = await getUserProfile(user.uid);
        if (!profile?.campId) return;

        // Load camp document (name, joinCodes, dates…)
        const camp = await getCampInfo(profile.campId);
        if (camp) setCurrentCamp(camp);

        // Load all subcollections
        await loadFromFirestore(profile.campId);

        // Real-time listener for incidents
        unsubscribeRef.current = subscribeToIncidencias(
          profile.campId,
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
