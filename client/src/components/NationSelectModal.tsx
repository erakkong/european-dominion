import React, { useState } from 'react';
import { Nation } from '../types';
import { X, Search, Crown, Shield } from 'lucide-react';

interface NationSelectModalProps {
  isOpen: boolean;
  nations: Record<string, Nation>;
  currentNationTag: string;
  onClose: () => void;
  onSelectNation: (tag: string) => void;
}

export const NationSelectModal: React.FC<NationSelectModalProps> = ({
  isOpen,
  nations,
  currentNationTag,
  onClose,
  onSelectNation
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const nationList = Object.values(nations).sort((a, b) => b.provincesCount - a.provincesCount);
  const filtered = nationList.filter(n =>
    n.name.toLowerCase().includes(search.toLowerCase()) ||
    n.tag.toLowerCase().includes(search.toLowerCase()) ||
    n.ruler.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[620px] max-h-[85vh] pax-panel rounded-lg shadow-2xl border border-amber-500/40 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="pax-header p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Crown size={20} className="text-amber-400" />
            <div>
              <h2 className="font-royal font-bold text-amber-300 text-base">Wähle dein Europäisches Herrscherhaus</h2>
              <span className="text-[11px] text-slate-400">189 historische Staaten & Dynastien im Europa von 1618</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/60">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Land oder Dynastie suchen (z.B. Preußen, Frankreich, Habsburg, Romanow...)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-2 text-xs">
          {filtered.map(n => {
            const isSelected = (n.tag === currentNationTag);
            return (
              <div
                key={n.tag}
                onClick={() => {
                  onSelectNation(n.tag);
                  onClose();
                }}
                className={`p-2.5 rounded border cursor-pointer transition flex items-center gap-3 ${
                  isSelected
                    ? 'bg-amber-950/50 border-amber-400 shadow-md ring-1 ring-amber-400'
                    : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/50 hover:bg-slate-850'
                }`}
              >
                <img
                  src={n.flag}
                  alt="flag"
                  className="w-8 h-5 object-cover rounded shadow border border-slate-700 shrink-0"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
                <div className="overflow-hidden flex-1">
                  <div className="font-royal font-bold text-slate-100 text-xs truncate">
                    {n.name}
                  </div>
                  <div className="text-[10px] text-amber-300/90 truncate">
                    {n.ruler.name} ({n.ruler.dynasty})
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{n.provincesCount} Provinzen</span>
                    <span>·</span>
                    <span className="truncate">{n.government}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pax-header p-3 flex justify-end">
          <button onClick={onClose} className="pax-btn text-xs">
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
