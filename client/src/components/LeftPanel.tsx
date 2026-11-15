import React, { useState } from 'react';
import { Nation } from '../types';
import { X, Crown, Scale, Users, HeartHandshake, ScrollText, Flag, Sparkles, AlertCircle } from 'lucide-react';

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
    <div className="fixed top-16 left-0 bottom-8 w-[420px] z-40 pax-panel shadow-2xl flex flex-col border-r border-amber-500/30 overflow-hidden animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="pax-header p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown size={18} className="text-amber-400" />
          <h2 className="font-royal font-bold text-amber-300 text-base">Reichsverwaltung & Hofstaat</h2>
        </div>
        <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition">
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950 text-xs">
        {[
          { id: 'politics', name: 'Gesetze', icon: <Scale size={13} /> },
          { id: 'dynasty', name: 'Dynastie & Hof', icon: <Crown size={13} /> },
          { id: 'diplomacy', name: 'Diplomatie', icon: <HeartHandshake size={13} /> },
          { id: 'missions', name: 'Missionen', icon: <ScrollText size={13} /> }
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
        {/* POLITICS & LAWS TAB */}
        {activeTab === 'politics' && (
          <div className="space-y-3">
            <div className="p-3 rounded bg-amber-950/30 border border-amber-500/30">
              <span className="text-[11px] text-amber-300 font-bold uppercase tracking-wider block mb-1">
                Staatsform & Verfassungsordnung
              </span>
              <div className="font-royal font-bold text-slate-100 text-sm">
                {playerNation.government}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Der Monarch besitzt uneingeschränkte Vollmachten über Krieg, Finanzen und Gesetze.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                Grundgesetze des Reiches (Victoria 3 System)
              </span>

              {[
                { title: 'Königliche Macht & Autorität', active: playerNation.laws.power, options: ['Absolutismus', 'Ständeversammlung', 'Konstitutionell'] },
                { title: 'Wirtschafts- & Handelsordnung', active: playerNation.laws.economy, options: ['Merkantilismus', 'Freihandel', 'Protektionismus'] },
                { title: 'Gesellschaftsstruktur', active: playerNation.laws.society, options: ['Adelsprivilegien', 'Bürgerliche Gleichheit', 'Bildungspflicht'] },
                { title: 'Wehrverfassung', active: playerNation.laws.military, options: ['Berufsheer', 'Kantonssystem', 'Wehrpflicht'] }
              ].map(law => (
                <div key={law.title} className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                  <div className="font-semibold text-slate-200 mb-1.5">{law.title}</div>
                  <div className="flex gap-1.5">
                    {law.options.map(opt => (
                      <span
                        key={opt}
                        className={`flex-1 py-1 px-1.5 text-center rounded text-[11px] font-medium border ${
                          opt === law.active
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 cursor-pointer'
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

        {/* DYNASTY & COURT TAB */}
        {activeTab === 'dynasty' && (
          <div className="space-y-3">
            <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-14 rounded bg-slate-800 border border-amber-500/40 flex items-center justify-center text-amber-300 font-royal font-bold text-lg shadow">
                  👑
                </div>
                <div>
                  <h3 className="font-royal font-bold text-amber-300 text-sm">{playerNation.ruler.name}</h3>
                  <div className="text-[11px] text-slate-300">Haus {playerNation.ruler.dynasty} · {playerNation.ruler.age} Jahre</div>
                  <div className="text-[11px] text-emerald-400 font-semibold">Legitimität: {playerNation.ruler.legitimacy}%</div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span className="font-semibold text-slate-200">Herrscher-Eigenschaften: </span>
                {playerNation.ruler.traits.join(', ')}
              </div>
            </div>

            <div className="p-3 rounded bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="font-semibold text-slate-200 block text-xs">Thronfolge & Dynastische Eheverbindungen:</span>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-100">Kronprinz Friedrich Wilhelm</div>
                  <div className="text-[10px] text-slate-400">Erbe des Thrones · 22 Jahre alt</div>
                </div>
                <button className="pax-btn text-[11px] py-1 px-2 text-amber-300 border-amber-500/40">
                  Heirat anbahnen
                </button>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                Dynastische Hochzeiten mit anderen europäischen Höfen (z.B. Wien, London, Petersburg) schaffen dauerhafte Bündnisse und wertvolle Erbansprüche.
              </p>
            </div>
          </div>
        )}

        {/* DIPLOMACY TAB */}
        {activeTab === 'diplomacy' && (
          <div className="space-y-2.5">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
              Europäische Mächte & Beziehungen
            </span>

            {Object.values(nations).slice(0, 8).map(n => {
              if (n.tag === playerNation.tag) return null;
              return (
                <div key={n.tag} className="p-2.5 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={n.flag} alt="flag" className="w-6 h-4 object-cover rounded shadow" />
                    <div>
                      <div className="font-semibold text-slate-100 text-xs">{n.name}</div>
                      <div className="text-[10px] text-slate-400">{n.provincesCount} Provinzen · {n.government}</div>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <button className="pax-btn text-[11px] py-1 px-2 text-amber-300">
                      Depesche
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MISSIONS TAB */}
        {activeTab === 'missions' && (
          <div className="space-y-2.5">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
              Historische Missionen & Reichsziele
            </span>

            {[
              { title: 'Brandenburg-Preußische Konsolidierung', desc: 'Sichert die Grenzen Brandenburgs und baut Berlin zu einer europäischen Kulturmetropole aus.', reward: '+50 Prestige, +15% Steuereffizienz', progress: 80 },
              { title: 'Die Festung Schlesien halten', desc: 'Verteidigt Schlesien gegen österreichische Rückeroberungsansprüche und baut die Festung Glatz aus.', reward: '+20% Infanteriekampfkraft', progress: 100 },
              { title: 'Gründung des Deutschen Bundes / Reichs', desc: 'Vereint alle norddeutschen Staaten durch Bündnisse, Märkte oder militärischen Schutz.', reward: 'Kaiserreich Ausrufung!', progress: 35 }
            ].map(m => (
              <div key={m.title} className="p-3 rounded bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-amber-300 text-xs">{m.title}</div>
                  <span className="font-mono text-xs font-bold text-emerald-400">{m.progress}%</span>
                </div>
                <p className="text-[11px] text-slate-300">{m.desc}</p>
                <div className="text-[10px] text-amber-400/90 font-semibold">Belohnung: {m.reward}</div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full" style={{ width: `${m.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
