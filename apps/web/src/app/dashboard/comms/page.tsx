"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

type Thread = {
  id: string;
  type: 'DIRECT' | 'CAMPAIGN_CHANNEL' | 'ESCALATION';
  subject: string | null;
  campaignId: string | null;
  updatedAt: string;
  messages: Array<{ body: string; createdAt: string; senderId: string }>;
  participants: Array<{ userId: string }>;
};

type Message = {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  createdAt: string;
};

async function getToken() {
  const { getAuth } = await import('firebase/auth');
  return getAuth().currentUser?.getIdToken();
}

const TYPE_LABEL: Record<string, string> = {
  DIRECT: '💬 Direct',
  CAMPAIGN_CHANNEL: '📣 Campaign',
  ESCALATION: '🚨 Escalation',
};

const TYPE_COLOR: Record<string, string> = {
  DIRECT: 'var(--accent-2)',
  CAMPAIGN_CHANNEL: 'var(--accent-3)',
  ESCALATION: '#ef4444',
};

export default function CommsPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const authHeaders = useCallback(async () => {
    const token = await getToken();
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  }, []);

  const fetchThreads = useCallback(async () => {
    const headers = await authHeaders();
    const res = await fetch(`${API}/api/v1/comms/threads`, { headers });
    if (res.ok) {
      const d = await res.json();
      setThreads(d.data ?? []);
    }
    setLoading(false);
  }, [authHeaders]);

  const fetchMessages = useCallback(async (threadId: string) => {
    const headers = await authHeaders();
    const res = await fetch(`${API}/api/v1/comms/threads/${threadId}/messages`, { headers });
    if (res.ok) {
      const d = await res.json();
      setMessages(d.data ?? []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [authHeaders]);

  useEffect(() => { fetchThreads(); }, []);

  useEffect(() => {
    if (activeThread) fetchMessages(activeThread.id);
  }, [activeThread, fetchMessages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeThread) return;
    setSending(true);
    const headers = await authHeaders();
    await fetch(`${API}/api/v1/comms/threads/${activeThread.id}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ body: newMessage.trim() }),
    });
    setNewMessage('');
    await fetchMessages(activeThread.id);
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex">
      {/* Thread List */}
      <div className={`w-full md:w-72 border-r border-white/[0.07] flex flex-col ${activeThread ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/[0.07]">
          <h1 className="text-sm font-black uppercase tracking-widest text-white">Messages</h1>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-accent-1 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : threads.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <p className="text-sm text-white/25 font-bold">No messages yet</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.05]">
            {threads.map((t) => {
              const lastMsg = t.messages[0];
              const isActive = activeThread?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveThread(t)}
                  className="w-full text-left px-4 py-3.5 transition-colors hover:bg-white/[0.04]"
                  style={{ background: isActive ? 'rgba(255,58,242,0.06)' : undefined }}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span
                      className="text-[10px] font-black uppercase tracking-widest"
                      style={{ color: TYPE_COLOR[t.type] }}
                    >
                      {TYPE_LABEL[t.type]}
                    </span>
                    <span className="text-[10px] text-white/25">
                      {lastMsg ? new Date(lastMsg.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) : ''}
                    </span>
                  </div>
                  <p className="text-xs font-black text-white truncate">
                    {t.subject || 'No subject'}
                  </p>
                  {lastMsg && (
                    <p className="text-[11px] text-white/35 font-medium truncate mt-0.5">{lastMsg.body}</p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Message Pane */}
      {activeThread ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.07]">
            <button
              onClick={() => setActiveThread(null)}
              className="md:hidden text-white/40 hover:text-white transition-colors mr-1"
            >
              ←
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: TYPE_COLOR[activeThread.type] }}
                >
                  {TYPE_LABEL[activeThread.type]}
                </span>
              </div>
              <p className="text-sm font-black text-white truncate">{activeThread.subject || 'Conversation'}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-white/25 font-bold">No messages yet — start the conversation</p>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.senderId === user?.uid;
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className="max-w-[70%] rounded-2xl px-4 py-2.5 text-sm font-medium leading-relaxed"
                      style={{
                        background: isMe ? 'var(--accent-1)' : 'rgba(255,255,255,0.07)',
                        color: isMe ? '#fff' : 'rgba(255,255,255,0.8)',
                        borderRadius: isMe ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                      }}
                    >
                      {m.body}
                      <div className="text-[10px] mt-1 opacity-50">
                        {new Date(m.createdAt).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/[0.07] flex gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send)"
              rows={1}
              className="flex-1 bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-accent-1/50 resize-none placeholder:text-white/25 transition-colors"
            />
            <button
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
              className="px-4 py-2.5 rounded-xl font-black text-white text-sm transition-all disabled:opacity-40"
              style={{ background: 'var(--accent-1)' }}
            >
              {sending ? '…' : '↑'}
            </button>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center">
          <p className="text-sm text-white/25 font-bold">Select a conversation</p>
        </div>
      )}
    </div>
  );
}
