import React, { useState } from 'react';
import { Nation } from '../types';
import { X, Crown, Scale, HeartHandshake, ScrollText, Shield, Award, Users } from 'lucide-react';

interface LeftPanelProps {
  playerNation: Nation | null;
  nations: Record<string, Nation>;
  isOpen: boolean;
  onClose: () => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  playerNation,
  nations,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'politics' | 'dynasty' | 'diplomacy' | 'missions'>('politics');

  if (!isOpen || !playerNation) return null;

  return (
    <aside aria-label="Staatsrat und Hofstaat" className="fixed top-14 left-3 bottom-12 w-88 sm:w-96 z-40 imperial-panel rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-200 select-none border border-amber-500/40">
      {/* Header */}
      <div className="imperial-header p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300">
            <Crown size={16} />
          </div>
          <div>
            <h2 className="font-royal font-bold text-amber-300 text-sm md:text-base leading-none">
              Staatsrat & Hofstaat
            </h2>
            <span className="text-[11px] text-slate-300 font-parchment italic mt-0.5 block">
              Regentschaft von {playerNation.name}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition"
          title="Schließen"
        >
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-amber-500/30 bg-slate-950 text-xs font-royal">
        {[
          { id: 'politics', name: 'Gesetze', icon: <Scale size={12} /> },
          { id: 'dynasty', name: 'Dynastie', icon: <Crown size={12} /> },
          { id: 'diplomacy', name: 'Diplomatie', icon: <HeartHandshake size={12} /> },
          { id: 'missions', name: 'Ziele', icon: <ScrollText size={12} /> }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex-1 py-2 font-bold flex items-center justify-center gap-1.5 transition text-[11px] ${
              activeTab === t.id
                ? 'text-amber-300 border-b-2 border-amber-400 bg-amber-500/10'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            {t.icon}
            <span>{t.name}</span>
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs">
        {/* POLITICS & LAWS */}
        {activeTab === 'politics' && (
          <div className="space-y-3">
            <div className="p-3 rounded imperial-card border-amber-500/30">
              <span className="text-[10px] text-amber-400 font-royal font-bold uppercase tracking-wider block mb-1">
                Staatsordnung des Jahres 1618
              </span>
              <div className="font-royal font-bold text-slate-100 text-sm">
                {playerNation.government}
              </div>
              <p className="text-[11px] text-slate-300 font-sans-ui mt-1 leading-relaxed">
                Der Monarch regiert mit fürstlicher Autorität über Lehnswesen, Finanzen, Bündnisse und Kriegszüge.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-royal font-bold uppercase tracking-wider block">
                Grundgesetze & Verordnungen
              </span>

              {[
                { title: 'Fürstliche Macht & Regentschaft', active: playerNation.laws.power, options: ['Absolutismus', 'Ständeversammlung', 'Konstitutionell'] },
                { title: 'Wirtschafts- & Handelsordnung', active: playerNation.laws.economy, options: ['Merkantilismus', 'Freihandel', 'Protektionismus'] },
                { title: 'Ständische Gesellschaft', active: playerNation.laws.society, options: ['Adelsprivilegien', 'Bürgerrechte', 'Zunftordnung'] },
                { title: 'Militär- & Wehrverfassung', active: playerNation.laws.military, options: ['Berufsheer', 'Söldnerregimenter', 'Landeswehr'] }
              ].map(law => (
                <div key={law.title} className="p-2.5 rounded imperial-card">
                  <div className="font-royal font-semibold text-slate-200 mb-1.5 text-xs">{law.title}</div>
                  <div className="flex gap-1.5 font-sans-ui">
                    {law.options.map(opt => (
                      <span
                        key={opt}
                        className={`flex-1 py-1 px-1 text-center rounded text-[10px] font-medium border transition ${
                          opt === law.active
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-sm'
                            : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-slate-200 cursor-pointer'
                        }`}
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DYNASTY & COURT */}
        {activeTab === 'dynasty' && (
          <div className="space-y-3">
            <div className="p-3 rounded imperial-card border-amber-500/40">
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-12 h-14 rounded bg-slate-950 border border-amber-400/50 flex items-center justify-center text-amber-300 font-royal font-bold text-2xl shadow-inner">
                  👑
                </div>
                <div>
                  <h3 className="font-royal font-bold text-amber-300 text-sm md:text-base leading-tight">
                    {playerNation.ruler.name}
                  </h3>
                  <div className="text-[11px] text-slate-300 font-parchment italic mt-0.5">
                    Haus {playerNation.ruler.dynasty} · {playerNation.ruler.age} Jahre
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono font-bold mt-1">
                    Dynastische Legitimität: {playerNation.ruler.legitimacy}%
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-300 pt-2 border-t border-amber-500/20 font-sans-ui">
                <span className="font-bold text-amber-200 font-royal text-[10px] uppercase block mb-1">Eigenschaften:</span>
                <div className="flex flex-wrap gap-1">
                  {playerNation.ruler.traits.map(t => (
                    <span key={t} className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 rounded imperial-card space-y-2">
              <span className="font-royal font-bold text-slate-200 block text-xs">
                Thronfolge & Dynastische Verbindungen:
              </span>
              <div className="p-2.5 rounded bg-slate-950/70 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <div className="font-royal font-bold text-slate-100 text-xs">Kronprinz Friedrich Wilhelm</div>
                  <div className="text-[10px] text-slate-400 font-parchment italic">Reichserbe · 22 Jahre alt</div>
                </div>
                <button className="px-2.5 py-1 rounded imperial-btn text-[10px] font-bold">
                  Heirat anbahnen
                </button>
              </div>

              <p className="text-[11px] text-slate-400 font-parchment italic leading-relaxed">
                Dynastische Hochzeiten mit befreundeten Fürstenhäusern sichern dauerhafte Schutzbündnisse und diplomatischen Rückhalt in Reichstagen.
              </p>
            </div>
          </div>
        )}

        {/* DIPLOMACY */}
        {activeTab === 'diplomacy' && (
          <div className="space-y-2.5">
            <span className="text-[10px] text-slate-400 font-royal font-bold uppercase tracking-wider block">
              Europäische Fürstenhöfe
            </span>

            {Object.values(nations).slice(0, 10).map(n => {
              if (n.tag === playerNation.tag) return null;
              return (
                <div key={n.tag} className="p-2.5 rounded imperial-card flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={n.flag} alt="Flagge" className="w-6 h-4 object-cover rounded shadow border border-amber-500/30" />
                    <div>
                      <div className="font-royal font-bold text-slate-100 text-xs">{n.name}</div>
                      <div className="text-[10px] text-slate-400 font-sans-ui">{n.provincesCount} Provinzen · {n.government}</div>
                    </div>
                  </div>

                  <button className="px-2 py-1 rounded imperial-btn text-[10px] font-bold">
                    Gesandtschaft
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* MISSIONS */}
        {activeTab === 'missions' && (
          <div className="space-y-2.5">
            <span className="text-[10px] text-slate-400 font-royal font-bold uppercase tracking-wider block">
              Historische Reichsmissionen
            </span>

            {[
              { title: 'Konsolidierung des Kernreiches', desc: 'Sichert die Grenzen gegen Übergriffe und baut die Residenzstadt zur Prachtmetropole aus.', reward: '+50 Prestige, +15% Steuern', progress: 80 },
              { title: 'Herrschaft über die Fluss- & Seezölle', desc: 'Kontrolliert die strategischen Wasserwege und baut Seehäfen an den Küsten aus.', reward: '+25% Handelsvolumen', progress: 50 },
              { title: 'Die Kaiserkrone Europas', desc: 'Erlangt den obersten Großmachtstatus durch Bündnisse und militärische Vorherrschaft.', reward: 'Kaiserliche Hegemonie!', progress: 30 }
            ].map(m => (
              <div key={m.title} className="p-3 rounded imperial-card space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="font-royal font-bold text-amber-300 text-xs">{m.title}</div>
                  <span className="font-mono text-xs font-bold text-emerald-400">{m.progress}%</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans-ui leading-relaxed">{m.desc}</p>
                <div className="text-[10px] text-amber-400 font-semibold font-royal">Belohnung: {m.reward}</div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-amber-500/30">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-full" style={{ width: `${m.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
