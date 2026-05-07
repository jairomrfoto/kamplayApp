import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../store/store';
import { subscribeToChat, sendChatMessage } from '../../services/chatFirestore';
import DemoSectionBanner from '../DemoSectionBanner';
import type { ChatMessage } from '../../services/chatFirestore';

type Role = 'coordinator' | 'monitor' | 'parent' | 'profesor';

interface Props {
  userRole: Role;
  userName: string;
}

const ROLE_LABELS: Record<Role, string> = {
  coordinator: 'Coordinador',
  monitor: 'Monitor',
  parent: 'Familia',
  profesor: 'Profesor',
};

const ROLE_COLORS: Record<Role, string> = {
  coordinator: 'bg-orange-100 text-orange-700',
  monitor: 'bg-green-100 text-green-700',
  parent: 'bg-amber-100 text-amber-700',
  profesor: 'bg-blue-100 text-blue-700',
};

const isStaff = (role: Role) => role === 'coordinator' || role === 'monitor';

export default function ChatPanel({ userRole, userName }: Props) {
  const { user } = useAuth();
  const { currentCamp } = useStore();
  const [canal, setCanal] = useState<'general' | 'equipo'>('general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [texto, setTexto] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const campId = currentCamp?.id;

  useEffect(() => {
    if (!campId) return;
    setMessages([]);
    return subscribeToChat(campId, canal, setMessages);
  }, [campId, canal]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = texto.trim();
    if (!trimmed || !campId || !user) return;
    setSending(true);
    try {
      await sendChatMessage(campId, canal, {
        texto: trimmed,
        autorId: user.uid,
        autorNombre: userName,
        autorRol: userRole,
      });
      setTexto('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as React.FormEvent);
    }
  };

  const formatTime = (fecha: string) =>
    new Date(fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const formatDate = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

  if (!campId) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <MessageCircle size={36} className="mb-3" />
        <p className="text-sm">Únete a un programa para acceder al chat</p>
      </div>
    );
  }

  let lastDate = '';

  return (
    <div className="flex flex-col" style={{ minHeight: '520px' }}>
      <DemoSectionBanner description="Mensajería instantánea del equipo. Coordina con monitores y el resto de coordinadores en tiempo real sin salir de la aplicación." />
      {/* Canal switcher */}
      <div className="flex gap-2 mb-4 pb-3 border-b border-gray-100">
        <button
          onClick={() => setCanal('general')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            canal === 'general'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          # general
        </button>
        {isStaff(userRole) && (
          <button
            onClick={() => setCanal('equipo')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              canal === 'equipo'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            # equipo
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400 self-center">Actualiza cada 3s</span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1" style={{ maxHeight: '380px', minHeight: '280px' }}>
        {messages.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            <MessageCircle size={28} className="mx-auto mb-3 opacity-40" />
            Sin mensajes aún. ¡Sé el primero en escribir!
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.autorId === user?.uid;
          const msgDate = formatDate(msg.fecha);
          const showDate = msgDate !== lastDate;
          lastDate = msgDate;

          return (
            <React.Fragment key={msg.id}>
              {showDate && (
                <div className="flex items-center gap-2 py-1">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400 px-2">{msgDate}</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>
              )}
              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-semibold text-gray-700">{msg.autorNombre}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${ROLE_COLORS[msg.autorRol]}`}>
                      {ROLE_LABELS[msg.autorRol]}
                    </span>
                  </div>
                )}
                <div
                  className={`max-w-xs lg:max-w-sm px-3.5 py-2 rounded-2xl text-sm break-words ${
                    isMe
                      ? 'bg-orange-500 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}
                >
                  {msg.texto}
                </div>
                <span className="text-xs text-gray-400 mt-0.5">{formatTime(msg.fecha)}</span>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={texto}
          onChange={e => setTexto(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Escribe en #${canal}...`}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          disabled={sending}
          maxLength={500}
        />
        <button
          type="submit"
          disabled={!texto.trim() || sending}
          className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
