import React, { useState } from 'react';
import { Nation, DateState, MapMode, User } from '../types';
import { Play, Pause, Save, Volume2, VolumeX, Shield, Landmark, Users as UsersIcon, Award, Crown, User as UserIcon } from 'lucide-react';

interface TopBarProps {
  playerNation: Nation | null;
  date: DateState;
  isPaused: boolean;
  speed: number;
  mapMode: MapMode;
  onSetMapMode: (mode: MapMode) => void;
  onTogglePause: () => void;
  onSetSpeed: (speed: number) => void;
  onOpenSaveLoad: () => void;
  onOpenNationSelect: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  playerNation,
  date,
  isPaused,
  speed,
  mapMode,
  onSetMapMode,
  onTogglePause,
  onSetSpeed,
  onOpenSaveLoad,
  onOpenNationSelect,
  currentUser,
  onOpenAuth
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const toggleAudio = () => {
    if (!audioElement) {
      const audio = new Audio('/assets/audio/High%20Elves%20Theme.ogg');
      audio.loop = true;
      audio.volume = 0.35;
      audio.play().then(() => {
        setIsMuted(false);
      }).catch(e => {
        console.warn('Audio playback prevented or missing:', e.message);
        setIsMuted(true);
      });
      setAudioElement(audio);
    } else {
      if (isMuted) {
        audioElement.play().catch(e => console.warn(e));
        setIsMuted(false);
      } else {
        audioElement.pause();
        setIsMuted(true);
      }
    }
  };

  const monthNames = [
    'JANUAR', 'FEBRUAR', 'MÄRZ', 'APRIL', 'MAI', 'JUNI',
    'JULI', 'AUGUST', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DEZEMBER'
  ];

  const MAP_MODES = [
    {
      id: 'political',
      name: 'Politisch',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    },
    {
      id: 'terrain',
      name: 'Terrain',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
        </svg>
      )
    },
    {
      id: 'economy',
      name: 'Handel',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v8M9.5 10h5a1.5 1.5 0 0 1 0 3h-5a1.5 1.5 0 0 0 0 3h5" />
        </svg>
      )
    },
    {
      id: 'military',
      name: 'Militär',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m14.5 17.5 5 5M4 4l16 16M19.5 4.5l-5 5M4 20l16-16" />
        </svg>
      )
    },
    {
      id: 'diplomacy',
      name: 'Diplomatie',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      )
    },
    {
      id: 'infrastructure',
      name: 'Infrastruktur',
      icon: (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="5" r="3" />
          <line x1="12" y1="22" x2="12" y2="8" />
          <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
        </svg>
      )
    }
  ];

  const populationFormatted = playerNation?.provincesCount
    ? (playerNation.provincesCount * 95000 >= 1000000
        ? `${((playerNation.provincesCount * 95000) / 1000000).toFixed(1)} Mio.`
        : (playerNation.provincesCount * 95000).toLocaleString('de-DE'))
    : '2,5 Mio.';

  const dayProgressPct = Math.min(100, (date.day / 30) * 100);

  return (
    <>
      {/* 1. Unified Top Imperial Command Bar (Victoria 3 Architectural Gilded Ribbon) */}
      <header className="fixed top-0 left-0 right-0 h-12 z-40 imperial-ribbon flex items-center justify-between px-3 md:px-5 select-none pointer-events-auto">
        {/* Left Anchor: Shield-Framed Coat of Arms & Ruler Plate */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              if (currentUser && currentUser.role !== 'admin') {
                alert(`Als Herrscher bist du an die Nation "${playerNation?.name}" gebunden.`);
                return;
              }
              onOpenNationSelect();
            }}
            className="relative flex items-center gap-2.5 px-3 py-1 -mb-2.5 rounded-b-md bg-gradient-to-b from-[#182338] to-[#0c1220] border-x border-b border-[#9a7b2c] shadow-2xl transition hover:brightness-110 group"
            title={currentUser && currentUser.role !== 'admin' ? `Souverän: ${playerNation?.name}` : 'Nation wechseln / Reichschronik'}
          >
            {/* Ornate Coat of Arms Shield Container */}
            <div className="relative w-8 h-8 rounded-sm overflow-hidden border border-[#d4af37] shadow-md shrink-0 bg-[#080d16]">
              {playerNation?.flag ? (
                <img
                  src={playerNation.flag}
                  alt={playerNation.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-amber-400">
                  <Crown size={16} />
                </div>
              )}
              <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-amber-400/40" />
            </div>

            <div className="flex flex-col text-left leading-tight pr-1">
              <span className="font-royal font-bold text-amber-200 text-xs md:text-sm tracking-wider flex items-center gap-1.5 group-hover:text-amber-100">
                {playerNation?.name || 'Königreich'}
                <Crown size={12} className="text-amber-400" />
              </span>
              <span className="text-[10px] text-slate-300 font-parchment italic truncate max-w-[140px] md:max-w-[180px]">
                {playerNation?.ruler.name || 'Souverän von Gottes Gnaden'}
              </span>
            </div>
          </button>

          {/* Legitimacy & Government Metallic Pills */}
          <div className="hidden lg:flex items-center gap-2 text-xs">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0a101a] border border-[#252f45] text-emerald-400 font-mono text-[11px] shadow-inner"
              title="Reichsstabilität & Innere Ordnung"
            >
              <Shield size={12} className="text-emerald-400 shrink-0" />
              <span className="tabular-nums font-semibold">{playerNation?.stability || 85}%</span>
            </div>
            <span className="px-2.5 py-1 rounded bg-[#0a101a] border border-[#252f45] text-slate-300 text-[10px] font-royal uppercase tracking-widest shadow-inner">
              {playerNation?.government || 'Absolute Monarchie'}
            </span>
          </div>
        </div>

        {/* Center Cluster: Core State Ledger (Recessed Slots with Brass Dividers) */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Treasury Slot */}
          <div
            className="imperial-recessed-slot flex items-center gap-2 px-3 py-1 rounded"
            title="Kaiserlicher Staatsschatz (Goldtaler) & Monatliche Bilanz"
          >
            <Landmark size={14} className="text-amber-400 shrink-0" />
            <div className="flex flex-col leading-none text-left">
              <span className="font-sans-ui tabular-nums font-bold text-amber-200 text-xs md:text-sm">
                {Math.round(playerNation?.treasury || 25000).toLocaleString('de-DE')} ₳
              </span>
              <span className={`text-[9px] tabular-nums font-semibold mt-0.5 ${(playerNation?.balance || 42) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {(playerNation?.balance || 42) >= 0 ? '+' : ''}{playerNation?.balance || 42}/M
              </span>
            </div>
          </div>

          <div className="brass-divider hidden sm:block" />

          {/* Population Slot */}
          <div
            className="imperial-recessed-slot hidden sm:flex items-center gap-2 px-3 py-1 rounded"
            title="Reichsbevölkerung & Provinzenanzahl"
          >
            <UsersIcon size={14} className="text-sky-400 shrink-0" />
            <div className="flex flex-col leading-none text-left">
              <span className="font-sans-ui tabular-nums font-bold text-slate-100 text-xs md:text-sm">
                {populationFormatted}
              </span>
              <span className="text-[9px] tabular-nums text-slate-400 font-sans-ui mt-0.5">
                {playerNation?.provincesCount || 180} Prov.
              </span>
            </div>
          </div>

          <div className="brass-divider hidden md:block" />

          {/* Prestige / Rank Slot */}
          <div
            className="imperial-recessed-slot hidden md:flex items-center gap-2 px-3 py-1 rounded"
            title="Europäischer Großmacht-Rang & Dynastisches Ansehen"
          >
            <Award size={14} className="text-amber-400 shrink-0" />
            <div className="flex flex-col leading-none text-left">
              <span className="font-sans-ui tabular-nums font-bold text-amber-200 text-xs md:text-sm">
                #4 • {playerNation?.prestige || 350}
              </span>
              <span className="text-[9px] text-amber-300/80 font-royal tracking-wider mt-0.5">
                Großmacht
              </span>
            </div>
          </div>
        </div>

        {/* Right Anchor: Chronometer, Speed Controls & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Chronometer Date Plate with Day Progress Bar */}
          <div className="relative overflow-hidden flex flex-col justify-center px-3 py-1 rounded bg-[#090e18] border border-[#9a7b2c]/60 shadow-inner">
            <span className="font-royal font-bold text-amber-200 text-xs tracking-wider">
              {date.day}. {monthNames[date.month - 1]} {date.year}
            </span>
            <div className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-amber-500 to-amber-300" style={{ width: `${dayProgressPct}%` }} />
          </div>

          {/* Mechanical Speed Pips */}
          <div className="flex items-center rounded bg-[#090e18] border border-[#9a7b2c]/40 overflow-hidden shadow-inner p-0.5">
            <button
              onClick={onTogglePause}
              className={`p-1.5 rounded-sm transition ${
                isPaused
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-amber-300 hover:bg-[#1a2336]'
              }`}
              title={isPaused ? 'Fortsetzen (Leertaste)' : 'Pause (Leertaste)'}
            >
              {isPaused ? <Play size={12} className="fill-current" /> : <Pause size={12} className="fill-current" />}
            </button>
            {[1, 2, 3, 4].map((s) => (
              <button
                key={s}
                onClick={() => onSetSpeed(s)}
                className={`px-2 py-1 text-[11px] font-sans-ui tabular-nums font-bold rounded-sm transition ${
                  speed === s && !isPaused
                    ? 'bg-gradient-to-b from-[#f3d576] to-[#d4af37] text-slate-950 shadow'
                    : 'text-slate-300 hover:text-amber-200 hover:bg-[#161f30]'
                }`}
                title={`Tempo ${s}x`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* User Account / Admin Badge */}
          <button
            onClick={onOpenAuth}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-royal transition border shadow ${
              currentUser?.role === 'admin'
                ? 'bg-gradient-to-r from-amber-600/30 to-amber-500/20 text-amber-300 border-amber-400/60 hover:border-amber-300'
                : currentUser
                ? 'bg-gradient-to-r from-blue-600/30 to-blue-500/20 text-blue-200 border-blue-400/60 hover:border-blue-300'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/40 hover:bg-amber-500/20 animate-pulse-gold'
            }`}
            title={currentUser ? `Angemeldet als ${currentUser.username} (${currentUser.role})` : 'Herrscher anmelden'}
          >
            {currentUser?.role === 'admin' ? (
              <>
                <Crown size={13} className="text-amber-400" />
                <span className="font-bold text-[11px]">Admin: {currentUser.username}</span>
              </>
            ) : currentUser ? (
              <>
                <UserIcon size={13} className="text-blue-400" />
                <span className="font-semibold text-[11px]">{currentUser.username}</span>
              </>
            ) : (
              <>
                <UserIcon size={13} className="text-amber-400" />
                <span className="font-bold text-[11px]">Anmelden</span>
              </>
            )}
          </button>

          {/* Save / Load Button */}
          <button
            onClick={onOpenSaveLoad}
            className="p-1.5 rounded bg-[#0a101a] hover:bg-[#162032] text-amber-300 border border-[#9a7b2c]/40 hover:border-amber-400 transition shadow"
            title="Reichschronik speichern oder laden"
          >
            <Save size={13} />
          </button>

          {/* Audio Toggle Button */}
          <button
            onClick={toggleAudio}
            className="p-1.5 rounded bg-[#0a101a] hover:bg-[#162032] text-slate-300 hover:text-amber-300 border border-[#252f45] hover:border-[#9a7b2c]/40 transition shadow"
            title={isMuted ? 'Hofmusik aktivieren' : 'Hofmusik stummschalten'}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} className="text-amber-400" />}
          </button>
        </div>
      </header>

      {/* 2. Tactical Map-Mode Dock (Brass-Trimmed Tab Strip Docked Seamlessly Beneath Top Bar) */}
      <nav
        aria-label="Kartenmodi"
        className="fixed top-13 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 px-2 py-0.5 rounded-b-lg bg-[#0e1422] border-x border-b border-[#9a7b2c]/60 shadow-xl select-none pointer-events-auto"
      >
        <div className="flex items-center gap-1 pl-1 pr-2 border-r border-[#9a7b2c]/40 text-amber-400 text-xs font-royal font-bold">
          <span className="text-[10px] uppercase tracking-wider text-amber-300">Karte</span>
        </div>

        {MAP_MODES.map((m) => {
          const isActive = mapMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSetMapMode(m.id as MapMode)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-royal transition ${
                isActive
                  ? 'bg-gradient-to-b from-[#f3d576] to-[#d4af37] text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-amber-200 hover:bg-[#1a2336]'
              }`}
              title={`Kartenmodus: ${m.name}`}
            >
              <span className={isActive ? 'text-slate-950' : 'text-amber-400/80'}>{m.icon}</span>
              <span className="text-[11px] tracking-wide">{m.name}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
