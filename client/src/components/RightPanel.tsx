import React, { useState } from 'react';
import { Nation, Strait } from '../types';
import { X, TrendingUp, Lightbulb, Anchor, Package, CheckCircle2 } from 'lucide-react';

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

  // 17th Century Historical Tech Tree
  const TECH_TREE_1618 = [
    { id: 'heliocentrism', cat: 'Wissenschaft', name: 'Sternkunde & Naturphilosophie (Kepler)', desc: '+15% Forschungstempo, +10% Staatsverwaltung', cost: 120, completed: true },
    { id: 'crop_rotation', cat: 'Landwirtschaft', name: 'Dreifelderwirtschaft & Drainage', desc: '+20% Getreideertrag in allen Provinzen', cost: 160, completed: true },
    { id: 'tercio_tactics', cat: 'Militär', name: 'Niederländische & Spanische Heeresreform', desc: 'Verfeinerte Piken- und Musketierfeuerkraft', cost: 240, completed: false, progress: 70 },
    { id: 'cartography', cat: 'Navigation', name: 'Kupferstich-Kartographie & Sextant', desc: 'Sichere Seewege und erhöhte Hafenzölle', cost: 260, completed: false, progress: 35 },
    { id: 'double_entry', cat: 'Handel', name: 'Kaufmannsbuchführung & Wechselbriefe', desc: '+25% Handelseffizienz in allen Marktzentren', cost: 300, completed: false, progress: 0 },
    { id: 'bastion_fortress', cat: 'Militär', name: 'Festungsbaukunst & Sternbastionen', desc: 'Mächtige Schanzenanlagen gegen schweres Belagerungsgeschütz', cost: 380, completed: false, progress: 0 }
  ];

  const GOODS_1618 = [
    { name: 'Getreide & Korn', basePrice: 1.2, status: 'Hoher Ertrag (+140t)', trend: 'stabil' },
    { name: 'Bauholz & Teer', basePrice: 2.1, status: 'Starke Nachfrage (-20t)', trend: 'steigend' },
    { name: 'Eisen & Waffenschmiede', basePrice: 3.6, status: 'Militärisch gedeckt', trend: 'stabil' },
    { name: 'Salpeter & Schwarzpulver', basePrice: 5.5, status: 'Kriegsnachfrage hoch', trend: 'steigend' },
    { name: 'Feintuch & Wollwaren', basePrice: 2.9, status: 'Exportware (+60t)', trend: 'stabil' }
  ];

  return (
    <aside aria-label="Wirtschaft und Handel" className="fixed top-14 right-3 bottom-12 w-88 sm:w-96 z-40 imperial-panel rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200 select-none border border-amber-500/40">
      {/* Header */}
      <div className="imperial-header p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300">
            <TrendingUp size={16} />
          </div>
          <div>
            <h2 className="font-royal font-bold text-amber-300 text-sm md:text-base leading-none">
              Handelskammer & Finanzen
            </h2>
            <span className="text-[11px] text-slate-300 font-parchment italic mt-0.5 block">
              Wirtschaftsraum & Technologien
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
          { id: 'economy', name: 'Waren & Zölle', icon: <Package size={12} /> },
          { id: 'tech', name: 'Technologie (1618)', icon: <Lightbulb size={12} /> },
          { id: 'straits', name: 'Meerengen & Flüsse', icon: <Anchor size={12} /> }
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
        {/* ECONOMY & TRADE */}
        {activeTab === 'economy' && (
          <div className="space-y-3">
            <div className="p-3 rounded imperial-card border-amber-500/30">
              <span className="text-[10px] text-amber-400 font-royal font-bold uppercase tracking-wider block mb-1">
                Kaufmannsordnung & Zölle
              </span>
              <div className="font-royal font-bold text-slate-100 text-sm">
                Wirtschafts- und Binnenmarkt von {playerNation.name}
              </div>
              <p className="text-[11px] text-slate-300 font-sans-ui mt-1 leading-relaxed">
                Der freie Warenverkehr innerhalb der Grenzen stärkt den Wohlstand der Städte. Seezölle und Grenztarife sichern den fürstlichen Staatsschatz.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-royal font-bold uppercase tracking-wider block">
                Zentrale Handelsgüter der Epoche
              </span>

              {GOODS_1618.map(g => (
                <div key={g.name} className="p-2.5 rounded imperial-card flex items-center justify-between text-xs">
                  <div>
                    <div className="font-royal font-bold text-slate-100 text-xs">{g.name}</div>
                    <div className="text-[10px] text-slate-400 font-sans-ui mt-0.5">{g.status}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-amber-300 text-xs block">{g.basePrice} ₳</span>
                    <span className="text-[9px] text-emerald-400 font-sans-ui capitalize">{g.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 1618 HISTORICAL TECH TREE */}
        {activeTab === 'tech' && (
          <div className="space-y-2.5">
            <span className="text-[10px] text-slate-400 font-royal font-bold uppercase tracking-wider block">
              Fortschritt der Wissenschaften & Künste
            </span>

            {TECH_TREE_1618.map(tech => (
              <div key={tech.id} className="p-2.5 rounded imperial-card space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-royal font-bold text-slate-100 text-xs">{tech.name}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-950 text-amber-400 text-[9px] border border-amber-500/20 font-royal">
                      {tech.cat}
                    </span>
                  </div>
                  {tech.completed ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 font-mono">
                      <CheckCircle2 size={12} /> Erforscht
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-400 font-mono">
                      {tech.progress}% ({tech.cost} ₳)
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-300 font-sans-ui">{tech.desc}</p>

                {!tech.completed && (
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-amber-500/30 mt-1">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-full" style={{ width: `${tech.progress}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* STRAITS & CHOKEPOINTS */}
        {activeTab === 'straits' && (
          <div className="space-y-2.5">
            <span className="text-[10px] text-slate-400 font-royal font-bold uppercase tracking-wider block">
              Strategische Meerengen & Passagen
            </span>

            {Object.values(straits).map(strait => {
              const controller = strait.controllingNation ? nations[strait.controllingNation] : null;

              return (
                <div
                  key={strait.id}
                  onClick={() => onSelectStrait(strait)}
                  className="p-2.5 rounded imperial-card cursor-pointer hover:border-amber-400/60 transition group space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-royal font-bold text-amber-300 group-hover:text-amber-200 text-xs">
                      {strait.name}
                    </span>
                    <span className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded border ${
                      strait.isBlockaded
                        ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                    }`}>
                      {strait.isBlockaded ? 'Blockiert' : 'Offen'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-300 font-sans-ui">
                    <span>Kontrolle: <strong className="text-slate-100">{controller ? controller.name : 'Neutral'}</strong></span>
                    <span className="font-mono text-amber-400 font-bold">{strait.tollRateGoldPerShip} ₳ / Schiff</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};
