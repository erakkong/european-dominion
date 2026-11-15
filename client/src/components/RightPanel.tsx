import React, { useState } from 'react';
import { Nation, Strait } from '../types';
import { X, TrendingUp, Lightbulb, Anchor, DollarSign, Package, CheckCircle2, ArrowRight } from 'lucide-react';

interface RightPanelProps {
  playerNation: Nation | null;
  straits: Record<string, Strait>;
  nations: Record<string, Nation>;
  isOpen: boolean;
  onClose: () => void;
  onSelectStrait: (strait: Strait) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  playerNation,
  straits,
  nations,
  isOpen,
  onClose,
  onSelectStrait
}) => {
  const [activeTab, setActiveTab] = useState<'economy' | 'tech' | 'straits'>('economy');

  if (!isOpen || !playerNation) return null;

  const TECH_TREE = [
    { id: 'enlightenment', cat: 'Gesellschaft', name: 'Aufklärung & Naturrecht', desc: '+15% Forschung, +10% Bürgerzufriedenheit', cost: 100, completed: true },
    { id: 'agriculture', cat: 'Wirtschaft', name: 'Fruchtwechsel & Melioration', desc: '+25% Getreideernte in allen Provinzen', cost: 150, completed: true },
    { id: 'artillery_gribeauval', cat: 'Militär', name: 'Gribeauval-Artilleriesystem', desc: 'Standardisierte Geschütze, +30% Artillerie-Schaden', cost: 220, completed: false, progress: 65 },
    { id: 'steam_engine', cat: 'Wirtschaft', name: 'Frühe Dampfmaschine (Watt)', desc: 'Erlaubt Manufakturstufe 3 & tieferen Bergbau', cost: 350, completed: false, progress: 20 },
    { id: 'flintlock', cat: 'Militär', name: 'Kavallerie-Karabiner & Bajonettring', desc: '+15% Infanteriekampfkraft in Feldschlachten', cost: 280, completed: false, progress: 0 },
    { id: 'railways_pioneer', cat: 'Infrastruktur', name: 'Eisenbahnpioniere & Dampfzug', desc: 'Schaltet Eisenbahnbau von Provinz zu Provinz frei', cost: 600, completed: false, progress: 0 }
  ];

  const GOODS = [
    { name: 'Getreide & Nahrung', basePrice: 1.2, status: 'Überschuss (+140t)', trend: 'stabil' },
    { name: 'Holz & Bauholz', basePrice: 2.1, status: 'Hohe Nachfrage (-25t)', trend: 'steigend' },
    { name: 'Eisen & Metalle', basePrice: 3.5, status: 'Ausgeglichen', trend: 'stabil' },
    { name: 'Schießpulver & Waffen', basePrice: 5.8, status: 'Hohe Militärnachfrage', trend: 'steigend' },
    { name: 'Tuch & Textilien', basePrice: 2.8, status: 'Exportware (+80t)', trend: 'stabil' }
  ];

  return (
    <div className="fixed top-16 right-0 bottom-8 w-[420px] z-40 pax-panel shadow-2xl flex flex-col border-l border-amber-500/30 overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="pax-header p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-amber-400" />
          <h2 className="font-royal font-bold text-amber-300 text-base">Wirtschaft, Handel & Forschung</h2>
        </div>
        <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition">
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950 text-xs">
        {[
          { id: 'economy', name: 'Märkte & Waren', icon: <Package size={13} /> },
          { id: 'tech', name: 'Technologie', icon: <Lightbulb size={13} /> },
          { id: 'straits', name: 'Meerengen & Flüsse', icon: <Anchor size={13} /> }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex-1 py-2 font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === t.id
                ? 'text-amber-300 border-b-2 border-amber-400 bg-slate-900/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.icon}
            <span>{t.name}</span>
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* ECONOMY TAB */}
        {activeTab === 'economy' && (
          <div className="space-y-3">
            <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-amber-300 font-bold uppercase tracking-wider block mb-1">
                Gemeinsamer Europäischer Markt (Victoria 3 System)
              </span>
              <div className="font-bold text-sm text-slate-100">
                Preußischer Wirtschafts- & Zollraum
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Binnenmarktfreiheit ohne Zölle zwischen euren Provinzen. Externe Zölle auf Importe schützen heimische Manufakturen.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                Zentrale Handelsgüter & Marktpreise
              </span>

              {GOODS.map(g => (
                <div key={g.name} className="p-2.5 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-200">{g.name}</div>
                    <div className="text-[10px] text-emerald-400">{g.status}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-amber-300">{g.basePrice} ₳ / Einheit</div>
                    <div className="text-[10px] text-slate-400 capitalize">{g.trend}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TECH TREE TAB */}
        {activeTab === 'tech' && (
          <div className="space-y-3">
            <div className="p-3 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Forschungsfortschritt:</span>
                <div className="font-bold text-amber-300 text-sm">{playerNation.currentTech || 'Militärreformen'}</div>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="font-bold text-slate-100">{playerNation.techProgress || 0}%</span>
                <span className="text-[10px] text-slate-400 block">+8 Punkte/Monat</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                Epochengerechter Forschungsbaum (ab 1770)
              </span>

              {TECH_TREE.map(t => (
                <div
                  key={t.id}
                  className={`p-3 rounded border transition ${
                    t.completed
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : t.progress > 0
                      ? 'bg-amber-950/30 border-amber-500/40'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                      {t.completed && <CheckCircle2 size={13} className="text-emerald-400" />}
                      {t.name}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                      {t.cat}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 mb-2">{t.desc}</p>

                  {t.completed ? (
                    <span className="text-[10px] font-bold text-emerald-400">Erforscht & Im Reich aktiv</span>
                  ) : (
                    <div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
                        <div className="bg-amber-400 h-full" style={{ width: `${t.progress}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Fortschritt: {t.progress}%</span>
                        <span>{t.cost} Forschungspunkte</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STRAITS TAB */}
        {activeTab === 'straits' && (
          <div className="space-y-2.5">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
              Europäische Meerengen & Schifffahrtswege
            </span>

            {Object.values(straits).map(s => {
              const controller = nations[s.controllingNation];
              return (
                <div
                  key={s.id}
                  onClick={() => onSelectStrait(s)}
                  className="p-3 rounded bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition flex items-center justify-between group"
                >
                  <div>
                    <div className="font-bold text-amber-300 text-xs flex items-center gap-1.5 group-hover:text-amber-200">
                      <Anchor size={13} />
                      {s.name}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      {controller?.flag && (
                        <img src={controller.flag} alt="flag" className="w-4 h-2.5 object-cover rounded shadow" />
                      )}
                      <span>Kontrolle: {controller ? controller.name : 'Neutral'}</span>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.isBlockaded ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-amber-950/60 text-amber-300'
                    }`}>
                      {s.tollRateGoldPerShip} ₳ Zoll
                    </span>
                    <ArrowRight size={14} className="text-slate-500 group-hover:text-amber-400 transition" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
