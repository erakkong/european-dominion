import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Trash2, CheckCircle } from 'lucide-react';

interface SaveLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name?: string) => Promise<any>;
  onLoad: (name: string) => Promise<any>;
}

export const SaveLoadModal: React.FC<SaveLoadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onLoad
}) => {
  const [saveName, setSaveName] = useState('');
  const [saves, setSaves] = useState<any[]>([]);
  const [statusMsg, setStatusMsg] = useState('');

  const fetchSaves = async () => {
    try {
      const res = await fetch('/api/saves');
      const data = await res.json();
      setSaves(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSaves();
      setStatusMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    const res = await onSave(saveName.trim() || undefined);
    if (res.success) {
      setStatusMsg(`Spielstand '${res.saveName}' erfolgreich gespeichert!`);
      setSaveName('');
      fetchSaves();
    }
  };

  const handleLoad = async (name: string) => {
    const res = await onLoad(name);
    if (res.success) {
      setStatusMsg(`Spielstand '${name}' erfolgreich geladen!`);
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[500px] pax-panel rounded-lg shadow-2xl border border-amber-500/40 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="pax-header p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Save size={18} className="text-amber-400" />
            <h2 className="font-royal font-bold text-amber-300 text-base">Spielstand Speichern & Laden</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* New Save Input */}
          <div className="p-3 rounded bg-slate-900/80 border border-slate-800 space-y-2">
            <label className="font-semibold text-slate-200 block">Neuen Spielstand anlegen:</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Name des Spielstands (z.B. Preussen_1770_Blüte)"
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
              />
              <button onClick={handleSave} className="pax-btn-gold text-xs px-3">
                Speichern
              </button>
            </div>
          </div>

          {statusMsg && (
            <div className="p-2.5 rounded bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 flex items-center gap-2">
              <CheckCircle size={14} />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Saves List */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] block">
              Vorhandene Spielstände ({saves.length}):
            </span>

            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {saves.length === 0 ? (
                <div className="text-slate-500 italic p-3 text-center bg-slate-950/40 rounded border border-slate-800">
                  Noch keine gespeicherten Spielstände vorhanden.
                </div>
              ) : (
                saves.map(s => (
                  <div key={s.name} className="p-2.5 rounded bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-100 text-xs">{s.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(s.modified).toLocaleString('de-DE')} · {Math.round(s.size / 1024)} KB
                      </div>
                    </div>

                    <button
                      onClick={() => handleLoad(s.name)}
                      className="pax-btn flex items-center gap-1.5 text-xs py-1 px-2.5 text-amber-300 border-amber-500/40 hover:bg-amber-500/20"
                    >
                      <Upload size={12} />
                      <span>Laden</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
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
