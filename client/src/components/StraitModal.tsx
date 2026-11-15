import React, { useState } from 'react';
import { Strait, Nation } from '../types';
import { X, Anchor, ShieldAlert, Coins, CheckCircle, AlertTriangle } from 'lucide-react';

interface StraitModalProps {
  strait: Strait | null;
  playerNation: Nation | null;
  nations: Record<string, Nation>;
  onClose: () => void;
  onUpdateStrait: (straitId: string, tollRate: number, isBlockaded: boolean) => void;
}

export const StraitModal: React.FC<StraitModalProps> = ({
  strait,
  playerNation,
  nations,
  onClose,
  onUpdateStrait
}) => {
  if (!strait) return null;

  const controller = nations[strait.controllingNation];
  const isController = playerNation && strait.controllingNation === playerNation.tag;

  const [tollRate, setTollRate] = useState(strait.tollRateGoldPerShip);
  const [isBlockaded, setIsBlockaded] = useState(strait.isBlockaded);

  const handleSave = () => {
    onUpdateStrait(strait.id, tollRate, isBlockaded);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[520px] pax-panel rounded-lg shadow-2xl border border-amber-500/40 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="pax-header p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Anchor size={20} />
            </div>
            <div>
              <h2 className="font-royal font-bold text-amber-300 text-lg leading-tight">{strait.name}</h2>
              <span className="text-xs text-slate-300">
                {strait.type === 'strait' ? 'Strategischer maritimer Engpass (Chokepoint)' : 'Bedeutende Handelswasserstraße'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Controlling Nation */}
          <div className="p-3 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400">Kontrollierender Staat:</div>
              <div className="font-bold text-sm text-slate-100 flex items-center gap-2 mt-0.5">
                {controller?.flag && (
                  <img src={controller.flag} alt="flag" className="w-5 h-3.5 object-cover rounded shadow" />
                )}
                {controller ? controller.name : 'Niemand'}
              </div>
            </div>

            <div className={`px-2.5 py-1 rounded text-xs font-semibold ${
              isBlockaded
                ? 'bg-rose-950/80 border border-rose-600 text-rose-300'
                : 'bg-emerald-950/80 border border-emerald-600 text-emerald-300'
            }`}>
              {isBlockaded ? 'BLOCKIERT' : 'OFFEN'}
            </div>
          </div>

          {/* Description */}
          <p className="text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded border border-slate-800/80">
            {strait.description}
          </p>

          {/* Toll rate settings */}
          <div className="p-3 rounded bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-100 flex items-center gap-1.5">
                <Coins size={14} className="text-amber-400" />
                Durchfahrtszoll (Sundzoll / Passagegebühr):
              </span>
              <span className="font-mono font-bold text-amber-300 text-sm">{tollRate} Taler / Schiff</span>
            </div>

            {isController ? (
              <input
                type="range"
                min="0"
                max="50"
                value={tollRate}
                onChange={e => setTollRate(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            ) : (
              <div className="text-[11px] text-slate-400 italic">
                Nur die herrschende Krone ({controller?.name}) kann die Zollsätze verändern.
              </div>
            )}
          </div>

          {/* Blockade control */}
          {isController && (
            <div className="p-3 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-rose-400" />
                  Militärische Seesperre / Blockade
                </div>
                <div className="text-[10px] text-slate-400">
                  Blockiert fremde Kriegsschiffe und stoppt feindlichen Konvoihandel.
                </div>
              </div>

              <button
                onClick={() => setIsBlockaded(!isBlockaded)}
                className={`px-3 py-1.5 rounded font-bold transition text-xs ${
                  isBlockaded
                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                    : 'pax-btn text-slate-300 hover:text-white'
                }`}
              >
                {isBlockaded ? 'Blockade beenden' : 'Blockade verhängen'}
              </button>
            </div>
          )}

          {/* Free passage agreements */}
          <div>
            <div className="font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
              <CheckCircle size={13} className="text-emerald-400" />
              Vertragliche Sonderrechte & Freie Durchfahrt:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {strait.freePassageAgreements && strait.freePassageAgreements.length > 0 ? (
                strait.freePassageAgreements.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
                    {nations[tag] ? nations[tag].name : tag}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-500 italic">Keine bilateralen Freipassverträge aktiv</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pax-header p-3 flex items-center justify-end gap-2">
          <button onClick={onClose} className="pax-btn text-xs">
            Schließen
          </button>
          {isController && (
            <button onClick={handleSave} className="pax-btn-gold text-xs">
              Erlass durchsetzen
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
