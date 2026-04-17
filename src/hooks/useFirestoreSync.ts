/**
 * useFirestoreSync — bootstrap hook mounted once at app root.
 *
 * On auth state change it:
 *   1. Instantly restores the last camp from localStorage (no network latency).
 *   2. Fetches the latest profile from Firestore and loads the camp if it changed.
 *   3. Starts real-time onSnapshot listeners for incidencias, acampados, and monitores
 *      so every connected client reflects edits immediately.
 *
 * Connectivity strategy: getCampInfo / saveCampInfo / saveJoinCodes all use
 * sdkWithRestFallback (see firestore.ts) — if the Firestore SDK streaming
 * connection is unavailable they fall back to direct REST calls automatically.
 */
import { useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserProfile, subscribeToIncidencias, getCampInfo, saveCampInfo, saveUserProfile, saveJoinCodes, subscribeToCampers, subscribeToMonitores, getCoordinatorProfile, getDocRest } from '../services/firestore';
import { useStore } from '../store/store';
import { getLocalProfile, setLocalProfile, updateLocalCamp } from '../utils/localProfile';
import type { CampCoordinator } from '../types/camp';

export function useFirestoreSync() {
  const { loadFromFirestore, setCurrentCamp, setIncidencias, setCampers, setMonitores, setCurrentMonitor, setCurrentCoordinator } = useStore();
  const unsubscribeIncidenciasRef = useRef<(() => void) | null>(null);
  const unsubscribeCampersRef = useRef<(() => void) | null>(null);
  const unsubscribeMonitoresRef = useRef<(() => void) | null>(null);
  const loadedCampIdRef = useRef<string | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

        // If user is a coordinator for this camp, load their extended profile
        if (camp.coordinators?.includes(uid)) {
          const extra = await getCoordinatorProfile(campId, uid).catch(() => null);
          const coordinator: CampCoordinator = {
            id: uid,
            campId,
            email: auth.currentUser?.email || '',
            name: auth.currentUser?.displayName || '',
            role: 'coordinator',
            permissions: {
              manageCoordinators: camp.mainCoordinator === uid,
              manageMonitors: true,
              manageCampers: true,
              manageActivities: true,
              manageSchedule: true,
              viewReports: true,
            },
            isMainCoordinator: camp.mainCoordinator === uid,
            ...(extra || {}),
          };
          setCurrentCoordinator(coordinator);
        }

        // Ensure join codes exist in Firestore (may be missing if camp was created before this feature)
        const monCode = camp.joinCodes?.monitors;
        const famCode = camp.joinCodes?.families;
        if (monCode && famCode) {
          const codeData = await getDocRest(`codigos/${monCode}`).catch(() => null);
          if (!codeData) {
            saveJoinCodes(campId, monCode, famCode).catch(() => {});
          }
        }
      }

      await loadFromFirestore(campId);

      // Real-time listeners — any change by any user propagates immediately
      if (unsubscribeIncidenciasRef.current) unsubscribeIncidenciasRef.current();
      if (unsubscribeCampersRef.current) unsubscribeCampersRef.current();
      if (unsubscribeMonitoresRef.current) unsubscribeMonitoresRef.current();

      unsubscribeIncidenciasRef.current = subscribeToIncidencias(campId, setIncidencias);
      unsubscribeCampersRef.current = subscribeToCampers(campId, setCampers);
      unsubscribeMonitoresRef.current = subscribeToMonitores(campId, (monitores) => {
        setMonitores(monitores);
        // Keep currentMonitor in sync — picks up permission changes made by coordinator in real time
        const mine = monitores.find(m => m.id === uid);
        if (mine) setCurrentMonitor(mine);
      });

      // Poll all collections every 30s — ensures changes from other users
      // are reflected even when the SDK streaming connection is broken.
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = setInterval(() => {
        loadFromFirestore(campId);
      }, 30_000);
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
      if (unsubscribeCampersRef.current) unsubscribeCampersRef.current();
      if (unsubscribeMonitoresRef.current) unsubscribeMonitoresRef.current();
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [loadCamp, setCurrentCamp]);
}
