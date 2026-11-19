import React, { useState } from 'react';
import { Nation, DateState, MapMode, User } from '../types';
import { Play, Pause, Save, Volume2, VolumeX, Shield, Landmark, Users as UsersIcon, Award, Crown, Compass, User as UserIcon } from 'lucide-react';

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
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const MAP_MODES = [
    { id: 'political', name: 'Politisch', icon: '🏛️' },
    { id: 'terrain', name: 'Terrain', icon: '🌲' },
    { id: 'economy', name: 'Handel', icon: '💰' },
    { id: 'military', name: 'Militär', icon: '⚔️' },
    { id: 'diplomacy', name: 'Diplomatie', icon: '🤝' },
    { id: 'infrastructure', name: 'Infrastruktur', icon: '⚓' }
  ];

  const populationFormatted = playerNation?.provincesCount
    ? (playerNation.provincesCount * 95000 >= 1000000
        ? `${((playerNation.provincesCount * 95000) / 1000000).toFixed(1)} Mio.`
        : (playerNation.provincesCount * 95000).toLocaleString('de-DE'))
    : '2,5 Mio.';

  return (
    <>
      {/* Primary Sovereign Top Bar (Single clean 48px tier) */}
      <header className="fixed top-0 left-0 right-0 h-12 z-40 imperial-header flex items-center justify-between px-3 md:px-4 shadow-2xl select-none">
        {/* Left: Nation, Ruler & Stability */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <button
            onClick={() => {
              if (currentUser && currentUser.role !== 'admin') {
                alert(`Als Spieler bist du an die Nation "${playerNation?.name}" gebunden. Nur Administratoren können die Nation frei wechseln.`);
                return;
              }
              onOpenNationSelect();
            }}
            className="flex items-center gap-2 px-2 py-1 rounded bg-slate-900/80 hover:bg-slate-800/90 border border-amber-500/40 hover:border-amber-400 transition group shadow-md"
            title={currentUser && currentUser.role !== 'admin' ? `Fest zugewiesen an ${currentUser.username}` : 'Nation wechseln / Herrscherübersicht'}
          >
            {playerNation?.flag && (
              <img
                src={playerNation.flag}
                alt="Flagge"
                className="w-7 h-4.5 object-cover rounded-sm shadow border border-amber-400/50 group-hover:scale-105 transition"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            )}
            <div className="flex flex-col text-left leading-tight">
              <span className="font-royal font-bold text-amber-300 text-xs md:text-sm flex items-center gap-1 group-hover:text-amber-200 transition">
                {playerNation?.name || 'Reich'}
                <Crown size={12} className="text-amber-400 opacity-80" />
              </span>
              <span className="text-[10px] text-slate-300 font-parchment italic truncate max-w-[120px] md:max-w-[160px]">
                {playerNation?.ruler.name || 'Monarch'}
              </span>
            </div>
          </button>

          {/* Stability & Government */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs">
            <div
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900/80 border border-slate-700/80 text-emerald-400 font-mono text-[11px] shadow-inner"
              title="Reichsstabilität & Innere Ordnung"
            >
              <Shield size={12} />
              <span>{playerNation?.stability || 85}%</span>
            </div>
            <span className="px-2 py-1 rounded bg-slate-900/80 border border-slate-700/80 text-slate-300 text-[10px] font-royal uppercase tracking-wider shadow-inner">
              {playerNation?.government || 'Monarchie'}
            </span>
          </div>
        </div>

        {/* Center: Realm Treasury, Population & Hegemony Medallions */}
        <div className="flex items-center gap-2 md:gap-5 text-xs shrink-0">
          {/* Treasury */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/70 border border-amber-500/30 shadow-inner"
            title="Kaiserlicher Staatsschatz (Goldtaler) & Monatliche Bilanz"
          >
            <Landmark size={14} className="text-amber-400 shrink-0" />
            <div className="flex flex-col leading-none text-left">
              <span className="font-mono font-bold text-amber-300 text-xs md:text-sm">
                {Math.round(playerNation?.treasury || 1000).toLocaleString('de-DE')} ₳
              </span>
              <span className={`text-[9px] font-mono font-semibold ${(playerNation?.balance || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {(playerNation?.balance || 0) >= 0 ? '+' : ''}{playerNation?.balance || 0} /M
              </span>
            </div>
          </div>

          {/* Population */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/70 border border-slate-700/70 shadow-inner"
            title="Reichsbevölkerung & Provinzenanzahl"
          >
            <UsersIcon size={14} className="text-sky-400 shrink-0" />
            <div className="flex flex-col leading-none text-left">
              <span className="font-mono font-bold text-slate-100 text-xs md:text-sm">
                {populationFormatted}
              </span>
              <span className="text-[9px] text-slate-400 font-sans-ui">
                {playerNation?.provincesCount || 50} Prov.
              </span>
            </div>
          </div>

          {/* Prestige / Rank */}
          <div
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/70 border border-amber-500/30 shadow-inner"
            title="Dynastisches Ansehen & Europäischer Rang"
          >
            <Award size={14} className="text-amber-400 shrink-0" />
            <div className="flex flex-col leading-none text-left">
              <span className="font-mono font-bold text-amber-200 text-xs md:text-sm">
                {playerNation?.prestige || 100}
              </span>
              <span className="text-[9px] text-amber-400/80 font-royal">
                Großmacht
              </span>
            </div>
          </div>
        </div>

        {/* Right: Date, Time Controls, Auth, Audio & Save */}
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          {/* Imperial Calendar Date */}
          <div className="flex items-center px-2.5 py-1 rounded bg-slate-950/90 border border-amber-500/40 text-amber-200 font-royal text-xs font-bold tracking-wide shadow-inner">
            <span>{date.day}. {monthNames[date.month - 1]} {date.year}</span>
          </div>

          {/* Speed Controls (Compact, Never Overflowing) */}
          <div className="flex items-center bg-slate-950/90 rounded border border-amber-500/30 overflow-hidden shadow-inner">
            <button
              onClick={onTogglePause}
              className={`p-1.5 transition ${
                isPaused
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-amber-300 hover:bg-slate-800'
              }`}
              title={isPaused ? 'Fortsetzen (Leertaste)' : 'Pause (Leertaste)'}
            >
              {isPaused ? <Play size={12} className="fill-current" /> : <Pause size={12} className="fill-current" />}
            </button>
            {[1, 2, 3, 4].map((s) => (
              <button
                key={s}
                onClick={() => onSetSpeed(s)}
                className={`px-1.5 py-1 text-[11px] font-mono font-bold transition ${
                  speed === s && !isPaused
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:text-amber-200 hover:bg-slate-800'
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
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-royal transition border shadow ${
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
            className="p-1.5 rounded bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-amber-500/30 hover:border-amber-400 transition shadow"
            title="Reichschronik speichern oder laden"
          >
            <Save size={13} />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleAudio}
            className="p-1.5 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700/80 hover:border-amber-500/40 transition shadow"
            title={isMuted ? 'Hofmusik aktivieren' : 'Hofmusik stummschalten'}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} className="text-amber-400" />}
          </button>
        </div>
      </header>

      {/* Floating Cartographic Compass & Map Modes Ribbon (Top-Center Dock) */}
      <nav aria-label="Kartenmodi" className="fixed top-14 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 px-2 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-amber-500/40 shadow-xl select-none">
        <div className="flex items-center gap-1 pl-1 pr-2 border-r border-amber-500/30 text-amber-400 text-xs font-royal font-bold">
          <Compass size={13} className="animate-spin-slow" />
          <span className="text-[10px] uppercase tracking-wider hidden sm:inline">Karte</span>
        </div>

        {MAP_MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => onSetMapMode(m.id as MapMode)}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-royal transition ${
              mapMode === m.id
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-amber-200 hover:bg-slate-800/80'
            }`}
            title={`Kartenmodus: ${m.name}`}
          >
            <span className="text-[11px]">{m.icon}</span>
            <span className="text-[11px]">{m.name}</span>
          </button>
        ))}
      </nav>
    </>
  );
};
