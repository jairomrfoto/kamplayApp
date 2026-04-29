import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../config/firebase';

const fns = getFunctions(app, 'europe-west1');
const parseDocumentFn = httpsCallable<ParseDocumentInput, ParseDocumentResult>(fns, 'parseDocument');

interface ParseDocumentInput {
  fileBase64: string;
  fileName: string;
  mimeType: string;
}

export interface ParsedAcampado {
  nombre: string;
  edad: number | null;
  grupo: string | null;
  cabana: string | null;
  alergias: string[];
  medicacion: string[];
  notasMedicas: string | null;
  contacto: string | null;
}

export interface ParsedGrupo {
  nombre: string;
  edadMinima: number | null;
  edadMaxima: number | null;
  monitores: string[];
  acampadosNombres: string[];
}

export interface ParsedActividad {
  titulo: string;
  fechaStr: string | null;
  horaInicio: string | null;
  horaFin: string | null;
  grupo: string | null;
  categoria: string;
  descripcion: string | null;
  ubicacion: string | null;
  duracionMinutos: number;
}

export interface ParsedInfoGeneral {
  nombre: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  ubicacion: string | null;
  descripcion: string | null;
}

export interface ParseDocumentResult {
  acampados: ParsedAcampado[];
  grupos: ParsedGrupo[];
  actividades: ParsedActividad[];
  infoGeneral: ParsedInfoGeneral;
  fileName: string;
  charCount: number;
}

const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4 MB

const ACCEPTED_TYPES: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'text/csv': 'CSV',
  'text/plain': 'TXT',
};

export function getAcceptedExtensions() {
  return '.pdf,.docx,.csv,.txt';
}

export function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_BYTES) {
    return `El archivo es demasiado grande. Máximo 4 MB (tiene ${(file.size / 1024 / 1024).toFixed(1)} MB).`;
  }
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const validExts = ['pdf', 'docx', 'csv', 'txt'];
  if (!ACCEPTED_TYPES[file.type] && !validExts.includes(ext)) {
    return `Formato no soportado. Usa PDF, DOCX, CSV o TXT.`;
  }
  return null;
}

export async function parseDocument(file: File): Promise<ParseDocumentResult> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  // Convert to base64
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  const fileBase64 = btoa(binary);

  // Infer mimeType from extension if browser reports generic type
  let mimeType = file.type;
  if (!mimeType || mimeType === 'application/octet-stream') {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const fallback: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      csv: 'text/csv',
      txt: 'text/plain',
    };
    mimeType = fallback[ext ?? ''] || mimeType;
  }

  const result = await parseDocumentFn({ fileBase64, fileName: file.name, mimeType });
  return result.data;
}
