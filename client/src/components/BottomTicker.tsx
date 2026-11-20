import React from 'react';
import { GameEvent } from '../types';
import { Landmark, TrendingUp, MessageSquare } from 'lucide-react';

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
    title: 'Der Prager Fenstersturz',
    text: '23.05.1618: Die Gesandten der Stände werfen die kaiserlichen Statthalter aus den Fenstern der Prager Burg. Der Dreißigjährige Krieg bricht aus.',
    date: { year: 1618, month: 5, day: 23 }
  };

  const dayStr = String(latestEvent.date.day).padStart(2, '0');
  const monthStr = String(latestEvent.date.month).padStart(2, '0');

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-11 z-40 imperial-ribbon flex items-center justify-between px-3 md:px-5 select-none text-xs border-t-2 border-[#9a7b2c] pointer-events-auto">
      {/* Left: Grand Strategy Ledger Medallions (Tactile Hover Lift) */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleLeftPanel}
          className={`relative group flex items-center gap-2 px-3 py-1.5 rounded text-xs font-royal transition duration-150 transform hover:-translate-y-0.5 shadow-md ${
            isLeftPanelOpen
              ? 'bg-gradient-to-b from-[#f3d576] to-[#d4af37] text-slate-950 font-bold border border-[#fef08a]'
              : 'bg-gradient-to-b from-[#1c263c] to-[#0f1524] text-amber-200 border border-[#9a7b2c]/60 hover:border-[#d4af37]'
          }`}
          title="Reichsverwaltung, Hofstaat & Gesetze öffnen"
        >
          {/* Ornate corner bracket accents */}
          <div className="absolute top-0.5 left-0.5 w-1 h-1 border-t border-l border-amber-300/40 pointer-events-none" />
          <div className="absolute bottom-0.5 right-0.5 w-1 h-1 border-b border-r border-amber-300/40 pointer-events-none" />

          <Landmark size={14} className={isLeftPanelOpen ? 'text-slate-950' : 'text-amber-400'} />
          <span className="hidden sm:inline font-semibold tracking-wide">Staatsrat & Hof</span>
          <span className="sm:hidden font-semibold">Hof</span>
        </button>

        <button
          onClick={onToggleRightPanel}
          className={`relative group flex items-center gap-2 px-3 py-1.5 rounded text-xs font-royal transition duration-150 transform hover:-translate-y-0.5 shadow-md ${
            isRightPanelOpen
              ? 'bg-gradient-to-b from-[#f3d576] to-[#d4af37] text-slate-950 font-bold border border-[#fef08a]'
              : 'bg-gradient-to-b from-[#1c263c] to-[#0f1524] text-amber-200 border border-[#9a7b2c]/60 hover:border-[#d4af37]'
          }`}
          title="Handelskammer, Finanzen & Forschung öffnen"
        >
          <div className="absolute top-0.5 left-0.5 w-1 h-1 border-t border-l border-amber-300/40 pointer-events-none" />
          <div className="absolute bottom-0.5 right-0.5 w-1 h-1 border-b border-r border-amber-300/40 pointer-events-none" />

          <TrendingUp size={14} className={isRightPanelOpen ? 'text-slate-950' : 'text-amber-400'} />
          <span className="hidden sm:inline font-semibold tracking-wide">Handelskammer</span>
          <span className="sm:hidden font-semibold">Handel</span>
        </button>
      </div>

      {/* Center: "Depesche" News Ticker (Parchment / Crimson Wax-Seal Dispatch Strip) */}
      <div className="flex-1 max-w-xl md:max-w-2xl mx-2 md:mx-4 flex items-center gap-2.5 overflow-hidden dispatch-strip px-3 py-1 rounded text-[11px]">
        {/* Crimson Wax Seal Medallion */}
        <div
          className="w-5 h-5 rounded-full bg-gradient-to-br from-[#a8252d] to-[#631217] border border-[#d4af37] shadow flex items-center justify-center shrink-0"
          title="Kaiserliches Lacksiegel"
        >
          <span className="text-[9px] font-royal font-bold text-amber-200">☩</span>
        </div>

        <span className="hidden md:inline font-royal font-bold text-amber-300 uppercase tracking-widest text-[10px] shrink-0">
          Depesche:
        </span>

        <span className="font-sans-ui tabular-nums text-amber-200 font-semibold text-[10px] shrink-0">
          [{dayStr}.{monthStr}.{latestEvent.date.year}]
        </span>

        <span className="font-bold text-amber-100 font-royal shrink-0 truncate max-w-[130px] sm:max-w-none">
          {latestEvent.title} —
        </span>

        <span className="text-[#e2dac3] font-parchment italic truncate">
          {latestEvent.text}
        </span>
      </div>

      {/* Right: Diplomatenchat & Unread Indicator */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleChat}
          className={`relative flex items-center gap-2 px-3 py-1.5 rounded text-xs font-royal transition duration-150 transform hover:-translate-y-0.5 shadow-md ${
            isChatOpen
              ? 'bg-gradient-to-b from-[#f3d576] to-[#d4af37] text-slate-950 font-bold border border-[#fef08a]'
              : 'bg-gradient-to-b from-[#1c263c] to-[#0f1524] text-amber-200 border border-[#9a7b2c]/60 hover:border-[#d4af37]'
          }`}
          title="Diplomatenchat öffnen / schließen"
        >
          <div className="relative">
            <MessageSquare size={14} className={isChatOpen ? 'text-slate-950' : 'text-amber-400'} />
            {unreadChatCount > 0 && !isChatOpen && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-slate-950 animate-ping" />
            )}
          </div>
          <span className="hidden sm:inline font-semibold tracking-wide">Diplomatenchat</span>
          {unreadChatCount > 0 && !isChatOpen && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-mono font-bold text-[10px]">
              {unreadChatCount}
            </span>
          )}
        </button>
      </div>
    </footer>
  );
};
