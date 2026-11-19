import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, User, Nation } from '../types';
import { Send, X, Crown, ChevronDown, Lock, Shield, Scroll, MessageSquare } from 'lucide-react';

interface ChatWidgetProps {
  messages: ChatMessage[];
  currentUser: User | null;
  nations: Record<string, Nation>;
  onSendMessage: (text: string) => Promise<{ success: boolean; error?: string }>;
  onOpenAuth: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  messages,
  currentUser,
  nations,
  onSendMessage,
  onOpenAuth,
  isOpen,
  onClose
}) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

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
        setErrorMsg(res.error || 'Fehler beim Übermitteln der Depesche.');
      }
    } catch {
      setErrorMsg('Verbindungsfehler beim Übermitteln.');
    } finally {
      setIsSending(false);
    }
  };

  const playerNation = currentUser?.nationTag ? nations[currentUser.nationTag] : null;

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Diplomatenkammer"
      className="fixed bottom-12 right-3 w-84 sm:w-96 h-[460px] z-40 imperial-panel rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 select-none border border-amber-500/50"
    >
      {/* Header */}
      <div className="imperial-header px-3.5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300">
            <Scroll size={15} />
          </div>
          <div>
            <h3 className="font-royal font-bold text-xs md:text-sm text-amber-300 tracking-wide leading-none">
              Diplomatenkammer & Kurier
            </h3>
            <span className="text-[10px] text-slate-300 font-parchment italic mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              Live-Depeschen der europäischen Höfe
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition"
            title="Schließen"
          >
            <ChevronDown size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
            title="Schließen"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5 text-xs font-sans-ui">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center px-4 font-parchment">
            <Scroll size={28} className="text-slate-600 mb-2" />
            <p className="text-sm text-slate-400">Das Archiv der Depeschen ist leer.</p>
            <p className="text-xs text-slate-500 mt-1">Verfasse die erste Botschaft an die Fürsten Europas!</p>
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
                {/* Header: Sender, Badge & Timestamp */}
                <div className="flex items-center gap-1.5 mb-0.5 px-1">
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-royal font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-400/50 shadow-sm">
                      <Crown size={10} className="text-amber-400" />
                      Kaiser / Admin
                    </span>
                  ) : isSystem ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-royal font-bold text-sky-300 bg-sky-500/20 px-1.5 py-0.5 rounded border border-sky-400/40">
                      <Shield size={10} className="text-sky-400" />
                      Reichskanzlei
                    </span>
                  ) : (
                    <span
                      className="text-[9px] font-royal font-bold px-1.5 py-0.5 rounded border shadow-sm"
                      style={{
                        backgroundColor: `${msg.nationColor}25`,
                        borderColor: `${msg.nationColor}60`,
                        color: '#f8fafc'
                      }}
                    >
                      {msg.nationName}
                    </span>
                  )}

                  <span className={`text-[11px] font-semibold ${isMe ? 'text-amber-300' : 'text-slate-300'} font-sans-ui`}>
                    {msg.username}
                  </span>

                  <span className="text-[9px] text-slate-500 font-mono">
                    {msg.timestamp}
                  </span>
                </div>

                {/* Message Parchment Bubble */}
                <div
                  className={`max-w-[88%] rounded-lg px-3 py-2 break-words shadow-md ${
                    isMe
                      ? 'bg-blue-950/80 text-blue-100 border border-blue-500/40 rounded-tr-none'
                      : isAdmin
                      ? 'bg-amber-950/60 text-amber-100 border border-amber-500/50 rounded-tl-none'
                      : isSystem
                      ? 'bg-slate-900/90 text-slate-300 border border-slate-700/70 font-parchment italic text-xs'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-700/60 rounded-tl-none font-sans-ui'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap text-[11px] md:text-xs">
                    {msg.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="px-3 py-1 bg-rose-950/90 border-t border-rose-500/40 text-rose-300 text-[11px] flex justify-between items-center">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-rose-200">
            <X size={12} />
          </button>
        </div>
      )}

      {/* Footer: Input Form OR Locked Banner */}
      <div className="p-2.5 bg-slate-950 border-t border-amber-500/30">
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
                    ? 'Kaiserliche Depesche verfassen...'
                    : `Depesche als ${currentUser.username} (${playerNation?.name || 'Reich'})...`
                }
                className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-400/80 rounded px-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition font-sans-ui shadow-inner"
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="px-3 py-1.5 rounded imperial-btn-gold text-slate-950 disabled:opacity-40 transition font-royal text-xs flex items-center gap-1 shadow"
                title="Depesche absenden"
              >
                <Send size={12} />
              </button>
            </div>
            <div className="flex justify-between items-center px-1 text-[10px] text-slate-500 font-sans-ui">
              <span>Als Herrscher angemeldet: <span className="text-amber-300 font-semibold">{currentUser.username}</span></span>
              <span className="font-mono">{inputText.length}/500</span>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-between p-2 rounded bg-amber-950/40 border border-amber-500/30">
            <div className="flex items-center gap-2 text-amber-200 text-xs font-parchment">
              <Lock size={14} className="text-amber-400 shrink-0" />
              <span>Nur legitimierte Herrscher können depeschieren.</span>
            </div>
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-2.5 py-1 rounded imperial-btn-gold text-[11px] font-royal shadow"
            >
              Anmelden
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
