import React from 'react';
import { GameEvent } from '../types';
import { Bell, Landmark, TrendingUp, MessageSquare, Scroll } from 'lucide-react';

interface BottomTickerProps {
  events: GameEvent[];
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
  isLeftPanelOpen: boolean;
  isRightPanelOpen: boolean;
  onToggleChat: () => void;
  isChatOpen: boolean;
  unreadChatCount: number;
}

export const BottomTicker: React.FC<BottomTickerProps> = ({
  events,
  onToggleLeftPanel,
  onToggleRightPanel,
  isLeftPanelOpen,
  isRightPanelOpen,
  onToggleChat,
  isChatOpen,
  unreadChatCount
}) => {
  const latestEvent = events[0] || {
    title: 'Europäischer Frieden',
    text: 'Die Gesandten der europäischen Höfe beobachten die konfessionellen und politischen Spannungen des Jahres 1618.',
    date: { year: 1618, month: 5, day: 23 }
  };

  const dayStr = String(latestEvent.date.day).padStart(2, '0');
  const monthStr = String(latestEvent.date.month).padStart(2, '0');

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-10 z-40 imperial-header flex items-center justify-between px-2 md:px-4 shadow-2xl select-none text-xs border-t border-amber-500/40">
      {/* Left: Crown Council / Realm Panels */}
      <div className="flex items-center gap-1 md:gap-2 shrink-0">
        <button
          onClick={onToggleLeftPanel}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-royal transition shadow ${
            isLeftPanelOpen
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-amber-500/20'
              : 'imperial-btn text-amber-200 hover:text-white'
          }`}
          title="Reichsverwaltung, Hofstaat & Gesetze öffnen"
        >
          <Landmark size={13} className={isLeftPanelOpen ? 'text-slate-950' : 'text-amber-400'} />
          <span className="hidden sm:inline">Staatsrat & Hof</span>
          <span className="sm:hidden">Hof</span>
        </button>

        <button
          onClick={onToggleRightPanel}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-royal transition shadow ${
            isRightPanelOpen
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-amber-500/20'
              : 'imperial-btn text-amber-200 hover:text-white'
          }`}
          title="Finanzen, Wirtschaft & Forschung öffnen"
        >
          <TrendingUp size={13} className={isRightPanelOpen ? 'text-slate-950' : 'text-amber-400'} />
          <span className="hidden sm:inline">Handelskammer</span>
          <span className="sm:hidden">Handel</span>
        </button>
      </div>

      {/* Center: Imperial Courier Ticker (Reichsdepeschen) */}
      <div className="flex-1 max-w-xl md:max-w-2xl mx-2 md:mx-4 flex items-center gap-2 overflow-hidden bg-slate-950/80 px-2.5 py-1 rounded border border-amber-500/30 text-[11px] shadow-inner">
        <div className="flex items-center gap-1 text-amber-400 shrink-0 font-royal font-bold">
          <Scroll size={12} className="text-amber-400" />
          <span className="hidden md:inline text-[10px] uppercase tracking-wider text-amber-300">Depesche:</span>
        </div>

        <span className="font-mono text-amber-400 shrink-0 font-semibold text-[10px]">
          [{dayStr}.{monthStr}.{latestEvent.date.year}]
        </span>

        <span className="font-bold text-slate-100 font-royal shrink-0 truncate max-w-[120px] sm:max-w-none">
          {latestEvent.title}:
        </span>

        <span className="text-slate-300 font-parchment italic truncate">
          {latestEvent.text}
        </span>
      </div>

      {/* Right: Diplomatic Chat Toggle */}
      <div className="flex items-center gap-1 md:gap-2 shrink-0">
        <button
          onClick={onToggleChat}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-royal transition shadow relative ${
            isChatOpen
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold'
              : 'imperial-btn text-amber-200 hover:text-white'
          }`}
          title="Diplomatenchat öffnen / schließen"
        >
          <MessageSquare size={13} className={isChatOpen ? 'text-slate-950' : 'text-amber-400'} />
          <span className="hidden sm:inline">Diplomatenchat</span>
          <span className="sm:hidden">Chat</span>
          {unreadChatCount > 0 && !isChatOpen && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold animate-bounce">
              +{unreadChatCount}
            </span>
          )}
        </button>
      </div>
    </footer>
  );
};
