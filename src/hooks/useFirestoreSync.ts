/**
 * useFirestoreSync — bootstrap hook mounted once at app root.
 *
 * On auth state change it:
 *   1. Instantly restores the last camp from localStorage (no network latency).
 *   2. Fetches the latest profile from Firestore and loads the camp if it changed.
 *   3. Loads ALL camps the user belongs to (campIds[]) and stores them in userCamps.
 *   4. Starts REST-polling subscriptions for monitores (5s), incidencias (8s),
 *      acampados (10s) for the ACTIVE camp.
 *   5. Polls all collections every 15s as a full-refresh safety net.
 *   6. Re-fetches immediately on visibilitychange (tab focus).
 *   7. Registers switchCampFn in the store so any component can switch camps.
 */
import { useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import {
  getUserProfile, subscribeToIncidencias, getCampInfo, saveCampInfo,
  saveUserProfile, saveJoinCodes, subscribeToCampers, subscribeToMonitores,
  getCoordinatorProfile, getDocRest, getUserCamps, loadCampData, getUserActividades,
  subscribeToNovedades,
} from '../services/firestore';
import { useStore } from '../store/store';
import { getLocalProfile, setLocalProfile, updateLocalCamp, addLocalCamp } from '../utils/localProfile';
import type { CampCoordinator } from '../types/camp';

export function useFirestoreSync() {
  const {
    loadFromFirestore, setCurrentCamp, setIncidencias, setCampers,
    setMonitores, setCurrentMonitor, setCurrentCoordinator,
    setUserCamps, addCampToUser, setSwitchCampFn,
    setCampCache, applyCampCache, setMisActividades, setNovedades,
  } = useStore();
  const unsubscribeIncidenciasRef = useRef<(() => void) | null>(null);
  const unsubscribeCampersRef = useRef<(() => void) | null>(null);
  const unsubscribeMonitoresRef = useRef<(() => void) | null>(null);
  const unsubscribeNovedadesRef = useRef<(() => void) | null>(null);
  const loadedCampIdRef = useRef<string | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentUidRef = useRef<string | null>(null);

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
        addCampToUser(camp);
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
          if (!codeData) saveJoinCodes(campId, monCode, famCode).catch(() => {});
        }
      }

      // If we have cached data, apply instantly so the switch feels immediate
      const hadCache = applyCampCache(campId);
      await loadFromFirestore(campId, hadCache);

      // REST-polling subscriptions for the active camp
      if (unsubscribeIncidenciasRef.current) unsubscribeIncidenciasRef.current();
      if (unsubscribeCampersRef.current) unsubscribeCampersRef.current();
      if (unsubscribeMonitoresRef.current) unsubscribeMonitoresRef.current();
      if (unsubscribeNovedadesRef.current) unsubscribeNovedadesRef.current();

      unsubscribeIncidenciasRef.current = subscribeToIncidencias(campId, setIncidencias);
      unsubscribeCampersRef.current = subscribeToCampers(campId, setCampers);
      unsubscribeMonitoresRef.current = subscribeToMonitores(campId, (monitores) => {
        setMonitores(monitores);
        const mine = monitores.find(m => m.id === uid);
        if (mine) setCurrentMonitor(mine);
      });
      unsubscribeNovedadesRef.current = subscribeToNovedades(campId, setNovedades);

      // Full silent refresh every 15s
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = setInterval(() => {
        loadFromFirestore(campId, true);
      }, 15_000);
    } catch (err) {
      console.error('Error loading camp from Firestore:', err);
    }
  }, [loadFromFirestore, setCurrentCamp, setIncidencias, addCampToUser, applyCampCache]);

  // Register switchCamp so any component can call it via useStore().switchCampFn
  useEffect(() => {
    setSwitchCampFn((campId: string) => {
      loadedCampIdRef.current = null;
      const uid = currentUidRef.current;
      if (uid) loadCamp(campId, uid);
    });
  }, [loadCamp, setSwitchCampFn]);

  // Immediate silent refresh when user returns to the tab
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
        currentUidRef.current = null;
        return;
      }

      currentUidRef.current = user.uid;

      // Load personal activity library (non-blocking)
      getUserActividades(user.uid).then(setMisActividades).catch(() => {});

      // Step 1: Restore from localStorage immediately (instant, no network)
      const local = getLocalProfile(user.uid);
      if (local?.camp) setCurrentCamp(local.camp);
      // Restore cached camps into userCamps
      if (local?.camps) {
        setUserCamps(Object.values(local.camps));
      } else if (local?.camp) {
        setUserCamps([local.camp]);
      }
      if (local?.campId) loadCamp(local.campId, user.uid, local.camp);

      // Step 2: Verify/refresh profile from Firestore
      try {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          const campId = profile.campId || '';
          const campIds = profile.campIds || (campId ? [campId] : []);

          // Merge campIds from Firestore with local ones; keep local.campId as
          // primary since it may have been updated more recently (new camp created).
          const mergedCampIds = Array.from(new Set([
            ...(local?.campIds || (local?.campId ? [local.campId] : [])),
            ...campIds,
          ]));
          const activeCampId = local?.campId || campId;
          setLocalProfile(user.uid, {
            role: profile.role as 'coordinator' | 'monitor' | 'parent',
            campId: activeCampId,
            campIds: mergedCampIds,
            camp: local?.camp,
            camps: local?.camps,
          });

          // Load active camp from Firestore only if it's a camp localStorage
          // doesn't already know about. If localStorage has campId X and Firestore
          // still has an older campId Y (race after camp creation), we must NOT
          // override local — local is always more recent for newly created camps.
          const profileCampKnownLocally = local?.campIds?.includes(campId) || local?.campId === campId;
          if (campId && campId !== local?.campId && !profileCampKnownLocally) {
            loadedCampIdRef.current = null;
            loadCamp(campId, user.uid, local?.camp);
          }

          // Load ALL user camps in background (for camp switcher + preload cache)
          if (campIds.length > 0) {
            getUserCamps(campIds).then(async camps => {
              setUserCamps(camps);
              camps.forEach(c => addLocalCamp(user.uid, c.id, c));

              // Preload data for every camp except the active one so switching is instant
              const activeCampId = campId || local?.campId;
              const otherCamps = camps.filter(c => c.id !== activeCampId);
              for (const camp of otherCamps) {
                loadCampData(camp.id)
                  .then(data => setCampCache(camp.id, data))
                  .catch(() => {});
              }
            }).catch(() => {});
          }
        } else if (local?.campId) {
          const localRole = local.role || 'coordinator';
          await saveUserProfile({
            uid: user.uid,
            campId: local.campId,
            campIds: local.campIds || [local.campId],
            role: localRole,
            email: user.email || '',
            nombre: user.displayName || '',
          });
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
      if (unsubscribeNovedadesRef.current) unsubscribeNovedadesRef.current();
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [loadCamp, setCurrentCamp, setUserCamps]);
}
