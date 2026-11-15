import React from 'react';
import { GameEvent } from '../types';
import { Bell, ScrollText, Landmark, TrendingUp, ShieldAlert, Award, Compass } from 'lucide-react';

interface BottomTickerProps {
  events: GameEvent[];
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
  isLeftPanelOpen: boolean;
  isRightPanelOpen: boolean;
}

export const BottomTicker: React.FC<BottomTickerProps> = ({
  events,
  onToggleLeftPanel,
  onToggleRightPanel,
  isLeftPanelOpen,
  isRightPanelOpen
}) => {
  const latestEvent = events[0] || {
    title: 'Europa im Frieden',
    text: 'Die europäischen Höfe beobachten die politischen Entwicklungen aufmerksam.',
    date: { year: 1770, month: 1, day: 1 }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-9 z-40 pax-panel border-t border-amber-500/30 flex items-center justify-between px-3 text-xs bg-slate-950/95 shadow-2xl">
      {/* Left Quick Navigation Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onToggleLeftPanel}
          className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
            isLeftPanelOpen
              ? 'bg-amber-500 text-slate-950 shadow font-bold'
              : 'pax-btn text-amber-300 border-amber-500/40 hover:bg-slate-800'
          }`}
        >
          <Landmark size={13} />
          <span>Politik & Hof</span>
        </button>
      </div>

      {/* Center Event Ticker */}
      <div className="flex-1 max-w-2xl mx-4 flex items-center gap-2 overflow-hidden bg-slate-900/60 px-3 py-1 rounded border border-slate-800 text-[11px]">
        <Bell size={13} className="text-amber-400 shrink-0 animate-pulse" />
        <span className="font-bold text-amber-300 shrink-0">
          [{latestEvent.date.day}.{latestEvent.date.month}.{latestEvent.date.year}] {latestEvent.title}:
        </span>
        <span className="text-slate-300 truncate">{latestEvent.text}</span>
      </div>

      {/* Right Quick Navigation Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onToggleRightPanel}
          className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
            isRightPanelOpen
              ? 'bg-amber-500 text-slate-950 shadow font-bold'
              : 'pax-btn text-amber-300 border-amber-500/40 hover:bg-slate-800'
          }`}
        >
          <TrendingUp size={13} />
          <span>Wirtschaft & Tech</span>
        </button>
      </div>
    </div>
  );
};
