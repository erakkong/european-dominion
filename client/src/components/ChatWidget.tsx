import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, User, Nation } from '../types';
import { MessageSquare, Send, X, Crown, ChevronDown, Lock, Shield } from 'lucide-react';

interface ChatWidgetProps {
  messages: ChatMessage[];
  currentUser: User | null;
  nations: Record<string, Nation>;
  onSendMessage: (text: string) => Promise<{ success: boolean; error?: string }>;
  onOpenAuth: () => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  messages,
  currentUser,
  nations,
  onSendMessage,
  onOpenAuth
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const lastSeenCountRef = useRef(messages.length);

  // Auto scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnreadCount(0);
      lastSeenCountRef.current = messages.length;
    } else {
      if (messages.length > lastSeenCountRef.current) {
        setUnreadCount(prev => prev + (messages.length - lastSeenCountRef.current));
        lastSeenCountRef.current = messages.length;
      }
    }
  }, [messages, isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
      lastSeenCountRef.current = messages.length;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (!clean || isSending) return;

    if (!currentUser) {
      onOpenAuth();
      return;
    }

    try {
      setIsSending(true);
      setErrorMsg(null);
      const res = await onSendMessage(clean);
      if (res.success) {
        setInputText('');
      } else {
        setErrorMsg(res.error || 'Fehler beim Senden der Depesche.');
      }
    } catch {
      setErrorMsg('Verbindungsfehler beim Chatten.');
    } finally {
      setIsSending(false);
    }
  };

  const playerNation = currentUser?.nationTag ? nations[currentUser.nationTag] : null;

  return (
    <div className="fixed bottom-10 right-3 z-40 select-none">
      {/* Collapsed Pill Button */}
      {!isOpen && (
        <button
          onClick={handleToggle}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-amber-500/50 shadow-xl backdrop-blur-md text-slate-100 transition-all hover:scale-105 active:scale-95 group"
          title="Diplomatenchat öffnen"
        >
          <div className="relative">
            <MessageSquare size={16} className="text-amber-400 group-hover:text-amber-300" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <span className="font-serif font-bold text-xs tracking-wide text-amber-200">
            Diplomatenchat
          </span>
          {unreadCount > 0 && (
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold animate-bounce">
              +{unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[440px] flex flex-col bg-slate-950/95 backdrop-blur-lg border border-amber-500/40 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border-b border-amber-500/30">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-amber-400" />
              <div>
                <h3 className="font-serif font-bold text-xs text-amber-200 tracking-wide leading-none">
                  Diplomatenkammer
                </h3>
                <span className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  Live-Depeschen
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleToggle}
                className="p-1 text-slate-400 hover:text-amber-300 rounded hover:bg-slate-800 transition"
                title="Minimieren"
              >
                <ChevronDown size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition"
                title="Schließen"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center px-4">
                <MessageSquare size={28} className="text-slate-600 mb-2" />
                <p>Noch keine Depeschen vorhanden.</p>
                <p className="text-[11px] text-slate-600 mt-1">Sende die erste Botschaft an die Höfe Europas!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = currentUser && (msg.userId === currentUser.id || msg.username === currentUser.username);
                const isAdmin = msg.role === 'admin';
                const isSystem = msg.role === 'system';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    {/* Header: Name, Nation & Time */}
                    <div className="flex items-center gap-1.5 mb-0.5 px-1">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                          <Crown size={10} />
                          Admin
                        </span>
                      ) : isSystem ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/30">
                          <Shield size={10} />
                          System
                        </span>
                      ) : (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded border"
                          style={{
                            backgroundColor: `${msg.nationColor}20`,
                            borderColor: `${msg.nationColor}50`,
                            color: '#f1f5f9'
                          }}
                        >
                          {msg.nationName}
                        </span>
                      )}

                      <span className={`text-[11px] font-semibold ${isMe ? 'text-amber-300' : 'text-slate-300'}`}>
                        {msg.username}
                      </span>

                      <span className="text-[9px] text-slate-500 font-mono">
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[85%] rounded-lg px-2.5 py-1.5 break-words ${
                        isMe
                          ? 'bg-blue-950/70 text-blue-100 border border-blue-500/30 rounded-tr-none'
                          : isAdmin
                          ? 'bg-amber-950/40 text-amber-100 border border-amber-500/40 rounded-tl-none'
                          : isSystem
                          ? 'bg-slate-900/90 text-slate-300 border border-slate-700/60'
                          : 'bg-slate-900/90 text-slate-200 border border-slate-700/50 rounded-tl-none'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="px-3 py-1 bg-rose-950/80 border-t border-rose-500/40 text-rose-300 text-[11px] flex justify-between items-center">
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-rose-200">
                <X size={12} />
              </button>
            </div>
          )}

          {/* Footer: Input Form OR Login prompt */}
          <div className="p-2.5 bg-slate-900 border-t border-amber-500/20">
            {currentUser ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    maxLength={500}
                    placeholder={
                      currentUser.role === 'admin'
                        ? 'Depesche als Admin verfassen...'
                        : `Depesche als ${currentUser.username} (${playerNation?.name || 'Reich'})...`
                    }
                    className="flex-1 bg-slate-950 border border-slate-700 focus:border-amber-500/70 rounded px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition"
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isSending}
                    className="p-2 rounded bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 transition font-bold"
                    title="Depesche absenden"
                  >
                    <Send size={13} />
                  </button>
                </div>
                <div className="flex justify-between items-center px-0.5 text-[10px] text-slate-500">
                  <span>Angemeldet als <span className="text-slate-300 font-semibold">{currentUser.username}</span></span>
                  <span>{inputText.length}/500</span>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between p-2 rounded bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center gap-2 text-amber-200 text-xs">
                  <Lock size={14} className="text-amber-400 flex-shrink-0" />
                  <span>Nur angemeldete Herrscher können chatten.</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow"
                >
                  Anmelden
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
