import { auth } from '../config/firebase';

export interface ChatMessage {
  id: string;
  texto: string;
  autorId: string;
  autorNombre: string;
  autorRol: 'coordinator' | 'monitor' | 'parent' | 'profesor';
  fecha: string; // ISO string
}

const pid = () => import.meta.env.VITE_FIREBASE_PROJECT_ID as string;

async function getToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

function parseField(v: unknown): unknown {
  const val = v as Record<string, unknown>;
  if ('stringValue' in val) return val.stringValue;
  if ('timestampValue' in val) return (val as { timestampValue: string }).timestampValue;
  if ('booleanValue' in val) return val.booleanValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  return null;
}

export function subscribeToChat(
  campId: string,
  canalId: string,
  callback: (messages: ChatMessage[]) => void,
  intervalMs = 3000,
): () => void {
  let active = true;

  const poll = async () => {
    if (!active) return;
    try {
      const token = await getToken();
      const path = `campamentos/${campId}/canales/${canalId}/mensajes`;
      const url = `https://firestore.googleapis.com/v1/projects/${pid()}/databases/(default)/documents/${path}?pageSize=200`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const json = await res.json() as { documents?: Array<{ name: string; fields?: Record<string, unknown> }> };
        const msgs: ChatMessage[] = (json.documents ?? []).map(d => {
          const id = d.name.split('/').pop() as string;
          const f = d.fields ?? {};
          return {
            id,
            texto:       parseField(f.texto) as string || '',
            autorId:     parseField(f.autorId) as string || '',
            autorNombre: parseField(f.autorNombre) as string || '',
            autorRol:    parseField(f.autorRol) as ChatMessage['autorRol'],
            fecha:       parseField(f.fecha) as string || new Date().toISOString(),
          };
        });
        callback(msgs.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()));
      }
    } catch { /* ignore */ }
    if (active) setTimeout(poll, intervalMs);
  };

  poll();
  return () => { active = false; };
}

export async function sendChatMessage(
  campId: string,
  canalId: string,
  msg: Omit<ChatMessage, 'id' | 'fecha'>,
): Promise<void> {
  const token = await getToken();
  const path = `campamentos/${campId}/canales/${canalId}/mensajes`;
  const body = {
    fields: {
      texto:       { stringValue: msg.texto },
      autorId:     { stringValue: msg.autorId },
      autorNombre: { stringValue: msg.autorNombre },
      autorRol:    { stringValue: msg.autorRol },
      fecha:       { timestampValue: new Date().toISOString() },
    },
  };
  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${pid()}/databases/(default)/documents/${path}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) throw new Error(`Chat send failed: ${res.status}`);
}
