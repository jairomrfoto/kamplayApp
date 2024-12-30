import type { Camper } from '../types';

interface ParentProfile {
  childInfo: {
    nombre: string;
    edad: number;
    // Datos adicionales que los padres proporcionan
    fechaNacimiento?: string;
    dni?: string;
  };
}

export function findMatchingCamper(parentProfile: ParentProfile, campers: Camper[]): Camper | null {
  // Normalizar el nombre para la comparación (eliminar espacios extra, convertir a minúsculas)
  const normalizedChildName = parentProfile.childInfo.nombre.toLowerCase().trim();
  
  return campers.find(camper => {
    // Criterios de coincidencia
    const nameMatch = camper.nombre.toLowerCase().trim() === normalizedChildName;
    const ageMatch = camper.edad === parentProfile.childInfo.edad;
    
    // Podemos agregar más criterios de coincidencia si están disponibles
    // como DNI, fecha de nacimiento, etc.
    
    // Por ahora, consideramos una coincidencia si nombre y edad son iguales
    return nameMatch && ageMatch;
  }) || null;
}