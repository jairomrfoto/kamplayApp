import { useState, useEffect } from 'react';
import { useStore } from '../store/store';
import { findMatchingCamper } from '../utils/profileMatcher';
import type { Camper } from '../types';

export function useProfileLinking(parentProfile: any) {
  const { campers, updateCamper } = useStore();
  const [linkedCamper, setLinkedCamper] = useState<Camper | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (parentProfile?.childInfo) {
      const match = findMatchingCamper(parentProfile, campers);
      if (match) {
        // Actualizar el camper con la información del perfil del padre
        const updatedCamper = {
          ...match,
          parentProfileId: parentProfile.id,
          // Aquí podemos agregar más campos que queramos sincronizar
          infoMedica: {
            ...match.infoMedica,
            ...parentProfile.childInfo.infoMedica
          }
        };
        updateCamper(updatedCamper);
        setLinkedCamper(updatedCamper);
      }
      setIsLoading(false);
    }
  }, [parentProfile, campers]);

  return { linkedCamper, isLoading };
}