import React, { useState } from 'react';
import { Nation, DateState, MapMode } from '../types';
import { Play, Pause, FastForward, Save, Volume2, VolumeX, Shield, Landmark, Users, Award, Crown, Compass } from 'lucide-react';

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
  onOpenNationSelect
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const toggleAudio = () => {
    if (!audioElement) {
      const audio = new Audio('/assets/audio/High Elves Theme.ogg');
      audio.loop = true;
      audio.volume = 0.35;
      audio.play().catch(e => console.log('Audio autoplay blocked:', e));
      setAudioElement(audio);
      setIsMuted(false);
    } else {
      if (isMuted) {
        audioElement.play().catch(e => console.log(e));
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

  return (
    <div className="fixed top-0 left-0 right-0 z-40 pax-panel shadow-2xl border-b border-amber-500/30 flex flex-col">
      {/* Primary Top Bar (Victoria 3 Style) */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/60 bg-slate-950/80">
        {/* Left: Nation & Ruler */}
        <div className="flex items-center gap-3">
          <div
            onClick={onOpenNationSelect}
            className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-amber-500/10 border border-amber-500/30 transition group"
            title="Land wechseln"
          >
            {playerNation?.flag && (
              <img
                src={playerNation.flag}
                alt="flag"
                className="w-8 h-5 object-cover rounded shadow border border-amber-400/40 group-hover:scale-105 transition"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            )}
            <div className="flex flex-col">
              <span className="font-royal font-bold text-amber-300 text-sm leading-tight flex items-center gap-1.5">
                {playerNation?.name || 'Preußen'}
                <Crown size={13} className="text-amber-400 inline" />
              </span>
              <span className="text-[11px] text-slate-300 leading-tight">
                {playerNation?.ruler.name} ({playerNation?.ruler.dynasty})
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-700 mx-1" />

          {/* Government & Stability */}
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
              {playerNation?.government || 'Monarchie'}
            </span>
            <div className="flex items-center gap-1 text-emerald-400" title="Stabilität">
              <Shield size={13} />
              <span>{playerNation?.stability || 85}%</span>
            </div>
          </div>
        </div>

        {/* Center: Budget, Population, Prestige */}
        <div className="flex items-center gap-6 text-sm">
          {/* Treasury */}
          <div className="flex items-center gap-2" title="Staatsschatz (Goldtaler)">
            <Landmark size={16} className="text-amber-400" />
            <div className="flex flex-col items-start leading-none">
              <span className="font-bold text-amber-300 text-sm">
                {Math.round(playerNation?.treasury || 1000).toLocaleString('de-DE')} ₳
              </span>
              <span className={`text-[10px] font-semibold ${(playerNation?.balance || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {(playerNation?.balance || 0) >= 0 ? '+' : ''}{playerNation?.balance || 0}/Monat
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-800" />

          {/* Population */}
          <div className="flex items-center gap-2" title="Reichsbevölkerung">
            <Users size={16} className="text-sky-400" />
            <div className="flex flex-col items-start leading-none">
              <span className="font-bold text-slate-100 text-sm">
                {(playerNation?.provincesCount ? playerNation.provincesCount * 95000 : 2500000).toLocaleString('de-DE')}
              </span>
              <span className="text-[10px] text-slate-400">{playerNation?.provincesCount || 50} Provinzen</span>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-800" />

          {/* Prestige */}
          <div className="flex items-center gap-2" title="Dynastisches Prestige & Europäischer Rang">
            <Award size={16} className="text-amber-400" />
            <div className="flex flex-col items-start leading-none">
              <span className="font-bold text-amber-200 text-sm">{playerNation?.prestige || 100}</span>
              <span className="text-[10px] text-amber-500/80">Großmacht Rang</span>
            </div>
          </div>
        </div>

        {/* Right: Date, Time Controls, Save, Audio */}
        <div className="flex items-center gap-4">
          {/* Audio */}
          <button
            onClick={toggleAudio}
            className="pax-btn p-1.5 text-slate-300 hover:text-amber-300"
            title={isMuted ? 'Hintergrundmusik an' : 'Hintergrundmusik aus'}
          >
            {isMuted || !audioElement ? <VolumeX size={15} /> : <Volume2 size={15} className="text-amber-400" />}
          </button>

          {/* Save/Load */}
          <button
            onClick={onOpenSaveLoad}
            className="pax-btn flex items-center gap-1.5 py-1 px-2.5 text-xs text-amber-300 border-amber-500/40"
            title="Spielstand speichern / laden"
          >
            <Save size={13} />
            <span>Speichern</span>
          </button>

          {/* Date */}
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-900 border border-slate-700/80 font-mono text-xs text-amber-200">
            <span className="font-bold">{date.day}. {monthNames[date.month - 1]} {date.year}</span>
          </div>

          {/* Speed Controls */}
          <div className="flex items-center bg-slate-900 rounded border border-slate-700 overflow-hidden">
            <button
              onClick={onTogglePause}
              className={`p-1.5 transition ${isPaused ? 'bg-amber-500/30 text-amber-300' : 'hover:bg-slate-800 text-slate-300'}`}
              title={isPaused ? 'Fortsetzen' : 'Pause'}
            >
              {isPaused ? <Play size={14} /> : <Pause size={14} />}
            </button>
            {[1, 2, 3, 4].map((s) => (
              <button
                key={s}
                onClick={() => onSetSpeed(s)}
                className={`px-2 py-1 text-xs font-bold transition ${speed === s && !isPaused ? 'bg-amber-500 text-slate-950' : 'hover:bg-slate-800 text-slate-300'}`}
                title={`Geschwindigkeit ${s}x`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Modes Ribbon */}
      <div className="flex items-center justify-center gap-1.5 py-1 px-4 bg-slate-900/90 text-xs">
        <span className="text-[11px] text-amber-400/80 font-bold uppercase tracking-wider mr-2 flex items-center gap-1">
          <Compass size={12} /> Kartenmodi:
        </span>
        {[
          { id: 'political', name: 'Politisch' },
          { id: 'terrain', name: 'Terrain' },
          { id: 'economy', name: 'Wirtschaft' },
          { id: 'military', name: 'Militär & Fronten' },
          { id: 'diplomacy', name: 'Diplomatie' },
          { id: 'infrastructure', name: 'Infrastruktur' }
        ].map(m => (
          <button
            key={m.id}
            onClick={() => onSetMapMode(m.id as MapMode)}
            className={`px-3 py-0.5 rounded text-xs font-medium transition ${
              mapMode === m.id
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>
    </div>
  );
};
