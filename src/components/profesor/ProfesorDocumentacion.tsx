import React, { useState, useRef, useEffect } from 'react';
import {
  FileText, Upload, Trash2, Download, Plus, X, Loader, FileSpreadsheet,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../store/store';
import { firestoreProfesorDocs, uploadProfesorFile } from '../../services/firestore';
import type { ProfesorDoc } from '../../types';

const TIPOS = [
  { value: 'nota',          label: 'Nota informativa',    icon: FileText },
  { value: 'documento',     label: 'Documento / PDF',     icon: FileText },
  { value: 'lista_alumnos', label: 'Lista de alumnos',    icon: FileSpreadsheet },
] as const;

const ACCEPTED = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg';

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(date: Date) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'ahora';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return `hace ${Math.floor(diff / 86400)} d`;
}

export default function ProfesorDocumentacion() {
  const { user } = useAuth();
  const { currentCamp } = useStore();
  const [docs, setDocs] = useState<ProfesorDoc[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [tipo, setTipo] = useState<ProfesorDoc['tipo']>('nota');
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentCamp?.id) return;
    firestoreProfesorDocs.list(currentCamp.id)
      .then(list => setDocs(list.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())))
      .catch(console.error);
  }, [currentCamp?.id]);

  const reset = () => {
    setShowForm(false);
    setTitulo('');
    setContenido('');
    setFile(null);
    setUploadPercent(0);
    setError('');
    setTipo('nota');
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) { setError('El archivo no puede superar los 20 MB'); return; }
    setFile(f);
    if (!titulo) setTitulo(f.name.replace(/\.[^.]+$/, ''));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) { const fakeEv = { target: { files: [f] } } as any; handleFile(fakeEv); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentCamp?.id) return;
    if (!titulo.trim()) { setError('El título es obligatorio'); return; }
    if ((tipo === 'documento' || tipo === 'lista_alumnos') && !file) {
      setError('Selecciona un archivo para subir'); return;
    }
    setSaving(true);
    setError('');
    try {
      let fileUrl: string | undefined;
      let fileName: string | undefined;
      let fileSize: number | undefined;

      if (file) {
        fileUrl = await uploadProfesorFile(currentCamp.id, file, p => setUploadPercent(p.percent));
        fileName = file.name;
        fileSize = file.size;
      }

      const newDoc: ProfesorDoc = {
        id: crypto.randomUUID(),
        campId: currentCamp.id,
        tipo,
        titulo: titulo.trim(),
        contenido: tipo === 'nota' ? contenido.trim() : undefined,
        fileUrl,
        fileName,
        fileSize,
        autorId: user.uid,
        autorNombre: user.displayName || user.email?.split('@')[0] || 'Profesor',
        fecha: new Date(),
      };

      await firestoreProfesorDocs.save(currentCamp.id, newDoc);
      setDocs(prev => [newDoc, ...prev]);
      reset();
    } catch (err: any) {
      setError(err?.message || 'Error al guardar');
      setSaving(false);
    }
  };

  const handleDelete = async (doc: ProfesorDoc) => {
    if (!currentCamp?.id || doc.autorId !== user?.uid) return;
    await firestoreProfesorDocs.delete(currentCamp.id, doc.id).catch(console.error);
    setDocs(prev => prev.filter(d => d.id !== doc.id));
  };

  const needsFile = tipo === 'documento' || tipo === 'lista_alumnos';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Documentación del profesor</h3>
          <p className="text-xs text-gray-400 mt-0.5">Notas y archivos visibles para monitores y coordinador</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 text-sm bg-orange-500 text-white px-3 py-2 rounded-xl hover:bg-orange-600 font-semibold"
          >
            <Plus size={15} /> Añadir
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-orange-50 border border-orange-100 rounded-xl p-4 space-y-3">
          {/* Tipo */}
          <div className="flex gap-2 flex-wrap">
            {TIPOS.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => { setTipo(t.value); setFile(null); }}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${
                  tipo === t.value
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                }`}
              >
                <t.icon size={13} /> {t.label}
              </button>
            ))}
          </div>

          {/* Título */}
          <input
            type="text"
            placeholder="Título *"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />

          {/* Contenido para notas */}
          {tipo === 'nota' && (
            <textarea
              placeholder="Escribe aquí la información importante para el equipo del campamento..."
              value={contenido}
              onChange={e => setContenido(e.target.value)}
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          )}

          {/* File drop zone para documentos */}
          {needsFile && (
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-orange-200 rounded-xl p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors"
            >
              <input
                ref={fileRef}
                type="file"
                accept={ACCEPTED}
                onChange={handleFile}
                className="hidden"
              />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                  <FileText size={18} className="text-orange-500" />
                  <span className="font-medium">{file.name}</span>
                  <span className="text-gray-400">({formatBytes(file.size)})</span>
                  <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }} className="text-gray-400 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={24} className="text-orange-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Arrastra un archivo aquí o <span className="text-orange-500 font-medium">haz clic para seleccionar</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, CSV, imágenes · Máx. 20 MB</p>
                </>
              )}
            </div>
          )}

          {/* Upload progress */}
          {saving && uploadPercent > 0 && uploadPercent < 100 && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Subiendo archivo...</span>
                <span>{Math.round(uploadPercent)}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-orange-400 transition-all" style={{ width: `${uploadPercent}%` }} />
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={reset}
              className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <><Loader size={14} className="animate-spin" /> Guardando...</> : 'Publicar'}
            </button>
          </div>
        </form>
      )}

      {/* Document list */}
      {docs.length === 0 && !showForm ? (
        <div className="text-center py-12 text-gray-400">
          <FileText size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aún no has añadido ningún documento</p>
          <p className="text-xs mt-1">Sube listas de alumnos, PDFs o notas informativas</p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map(d => (
            <div key={d.id} className="bg-white border border-gray-100 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    d.tipo === 'lista_alumnos' ? 'bg-green-100' : d.tipo === 'documento' ? 'bg-blue-100' : 'bg-amber-100'
                  }`}>
                    {d.tipo === 'lista_alumnos'
                      ? <FileSpreadsheet size={16} className="text-green-600" />
                      : <FileText size={16} className={d.tipo === 'documento' ? 'text-blue-600' : 'text-amber-600'} />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{d.titulo}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {d.autorNombre} · {timeAgo(d.fecha)}
                      {d.fileSize ? ` · ${formatBytes(d.fileSize)}` : ''}
                    </p>
                    {d.contenido && (
                      <p className="text-xs text-gray-600 mt-1.5 whitespace-pre-wrap leading-relaxed">{d.contenido}</p>
                    )}
                    {d.fileName && (
                      <p className="text-xs text-gray-400 mt-1 truncate">{d.fileName}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {d.fileUrl && (
                    <a
                      href={d.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Descargar"
                    >
                      <Download size={15} />
                    </a>
                  )}
                  {d.autorId === user?.uid && (
                    <button
                      onClick={() => handleDelete(d)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
