/**
 * useFirestoreSync — bootstrap hook mounted once at app root.
 *
 * On auth state change it:
 *   1. Instantly restores the last camp from localStorage (no network latency).
 *   2. Fetches the latest profile from Firestore and loads the camp if it changed.
 *   3. Starts REST-polling subscriptions for monitores (5s), incidencias (8s),
 *      acampados (10s) — SDK onSnapshot streaming is unavailable in this env.
 *   4. Polls all collections every 15s as a full-refresh safety net.
 *   5. Re-fetches immediately on visibilitychange (tab focus).
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
        console.log('Re-syncing camp to Firestore:', campId);
        await saveCampInfo(localCamp);
        camp = localCamp;
      }

      if (camp) {
        setCurrentCamp(camp);
        updateLocalCamp(uid, campId, camp);

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

      // REST-polling subscriptions (replace broken SDK onSnapshot)
      if (unsubscribeIncidenciasRef.current) unsubscribeIncidenciasRef.current();
      if (unsubscribeCampersRef.current) unsubscribeCampersRef.current();
      if (unsubscribeMonitoresRef.current) unsubscribeMonitoresRef.current();

      unsubscribeIncidenciasRef.current = subscribeToIncidencias(campId, setIncidencias);
      unsubscribeCampersRef.current = subscribeToCampers(campId, setCampers);
      unsubscribeMonitoresRef.current = subscribeToMonitores(campId, (monitores) => {
        setMonitores(monitores);
        const mine = monitores.find(m => m.id === uid);
        if (mine) setCurrentMonitor(mine);
      });

      // Full refresh every 15s (silent — no loading spinner)
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = setInterval(() => {
        loadFromFirestore(campId, true);
      }, 15_000);
    } catch (err) {
      console.error('Error loading camp from Firestore:', err);
    }
  }, [loadFromFirestore, setCurrentCamp, setIncidencias]);

  // Immediate refresh when user returns to the tab
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && loadedCampIdRef.current) {
        loadFromFirestore(loadedCampIdRef.current, true);
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [loadFromFirestore]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (unsubscribeIncidenciasRef.current) unsubscribeIncidenciasRef.current();
        loadedCampIdRef.current = null;
        return;
      }

      const local = getLocalProfile(user.uid);
      if (local?.camp) setCurrentCamp(local.camp);
      if (local?.campId) loadCamp(local.campId, user.uid, local.camp);

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
