/**
 * useFirestoreSync
 *
 * Este hook se encarga de:
 * 1. Detectar cuando el usuario inicia sesión con Google
 * 2. Buscar su perfil en Firestore para obtener el campId y rol
 * 3. Cargar todos los datos del campamento en el store (Zustand)
 * 4. Activar un listener en tiempo real para las incidencias
 *
 * Se usa una sola vez en App.tsx
 */

import { useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserProfile, subscribeToIncidencias } from '../services/firestore';
import { useStore } from '../store/store';

export function useFirestoreSync() {
  const { loadFromFirestore, setCurrentCamp, setIncidencias } = useStore();
  // Guardamos la función de "desuscripción" del listener de incidencias
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Escuchamos cambios en el estado de autenticación de Firebase
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      // Si hay un listener de incidencias activo, lo cancelamos
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }

      if (!user) return; // El usuario ha cerrado sesión, no hacemos nada más

      try {
        // Buscamos el perfil del usuario en Firestore
        const profile = await getUserProfile(user.uid);

        if (!profile?.campId) {
          // El usuario no tiene campamento asignado todavía (nuevo usuario)
          return;
        }

        // Cargamos todos los datos del campamento en el store
        await loadFromFirestore(profile.campId);

        // Activamos listener en tiempo real solo para incidencias
        // (son los datos más críticos que necesitan actualizarse al instante)
        unsubscribeRef.current = subscribeToIncidencias(
          profile.campId,
          (incidencias) => setIncidencias(incidencias)
        );

      } catch (error) {
        console.error('Error sincronizando datos con Firestore:', error);
      }
    });

    // Limpieza: cancelar suscripciones cuando el componente se desmonta
    return () => {
      unsubscribeAuth();
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [loadFromFirestore, setCurrentCamp, setIncidencias]);
}
