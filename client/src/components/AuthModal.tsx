import React, { useState, useEffect } from 'react';
import { Nation, User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  nations: Record<string, Nation>;
  currentUser: User | null;
  onLoginSuccess: (user: User, token: string) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  nations,
  currentUser,
  onLoginSuccess,
  onLogout
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedNation, setSelectedNation] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [claimedNations, setClaimedNations] = useState<Record<string, string>>({});

  // Fetch claimed nations whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      fetch('/api/auth/claimed-nations')
        .then(r => r.json())
        .then(data => setClaimedNations(data || {}))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const nationList = Object.values(nations).sort((a, b) => b.provincesCount - a.provincesCount);
  const filteredNations = nationList.filter(n =>
    n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Anmeldung fehlgeschlagen.');
      } else {
        localStorage.setItem('pax_token', data.token);
        localStorage.setItem('pax_user', JSON.stringify(data.user));
        onLoginSuccess(data.user, data.token);
        onClose();
      }
    } catch {
      setError('Verbindung zum Server fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedNation) {
      setError('Bitte wähle eine freie Nation für dein Konto aus.');
      return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, nationTag: selectedNation })
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Registrierung fehlgeschlagen.');
      } else {
        localStorage.setItem('pax_token', data.token);
        localStorage.setItem('pax_user', JSON.stringify(data.user));
        onLoginSuccess(data.user, data.token);
        onClose();
      }
    } catch {
      setError('Verbindung zum Server fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-[520px] max-h-[90vh] pax-panel rounded-xl shadow-2xl border border-amber-500/40 overflow-hidden flex flex-col bg-slate-900/95 text-slate-100">
        {/* Header */}
        <div className="p-4 border-b border-amber-500/30 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2">
            <span className="text-xl">👑</span>
            <h2 className="text-lg font-royal font-bold text-amber-300">
              {currentUser ? 'Spieler-Konto' : 'European Dominion Zugang'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* If already logged in */}
        {currentUser ? (
          <div className="p-6 flex flex-col gap-5">
            <div className="p-4 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-2xl">
                {currentUser.role === 'admin' ? '👑' : '👤'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-100">{currentUser.username}</span>
                  {currentUser.role === 'admin' ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500 text-slate-950">
                      ADMINISTRATOR
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-600 text-white">
                      SPIELER
                    </span>
                  )}
                </div>
                {currentUser.nationTag && nations[currentUser.nationTag] && (
                  <div className="flex items-center gap-2 mt-1 text-xs text-amber-200">
                    <img
                      src={nations[currentUser.nationTag].flag}
                      alt="flag"
                      className="w-5 h-3 object-cover rounded shadow border border-slate-700"
                    />
                    <span>{nations[currentUser.nationTag].name}</span>
                  </div>
                )}
                {currentUser.role === 'admin' && (
                  <p className="text-xs text-emerald-400 mt-1">
                    ✓ Volle Administrator-Rechte aktiv (Freie Nationenwahl & Spielsteuerung)
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-200 font-semibold text-xs border border-rose-500/30 transition shadow"
              >
                Abmelden
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition shadow"
              >
                Schließen
              </button>
            </div>
          </div>
        ) : (
          /* Login / Register tabs */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/40">
              <button
                onClick={() => { setTab('login'); setError(null); }}
                className={`flex-1 py-3 text-sm font-semibold transition border-b-2 ${
                  tab === 'login'
                    ? 'border-amber-400 text-amber-300 bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Anmelden
              </button>
              <button
                onClick={() => { setTab('register'); setError(null); }}
                className={`flex-1 py-3 text-sm font-semibold transition border-b-2 ${
                  tab === 'register'
                    ? 'border-amber-400 text-amber-300 bg-slate-800/40'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Konto erstellen
              </button>
            </div>

            {error && (
              <div className="m-4 mb-0 p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">Benutzername</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="z.B. admin oder dein Spielername"
                    className="px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm focus:border-amber-400 focus:outline-none transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">Passwort</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm focus:border-amber-400 focus:outline-none transition"
                  />
                </div>

                <div className="p-3 rounded bg-amber-950/30 border border-amber-500/20 text-[11px] text-amber-200/80">
                  <span className="font-bold text-amber-300">Admin-Zugang:</span> User: <code className="text-amber-100 font-mono bg-slate-950 px-1 py-0.5 rounded">admin</code> · Passwort: <code className="text-amber-100 font-mono bg-slate-950 px-1 py-0.5 rounded">admin-123</code>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-sm transition shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Anmelden...' : 'Anmelden'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="p-5 flex flex-col gap-3 flex-1 overflow-hidden">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-300">Benutzername</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="Dein Benutzername"
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-sm focus:border-amber-400 focus:outline-none transition"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-300">Passwort</label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Mindestens 4 Zeichen"
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-sm focus:border-amber-400 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Nation Selection - 1 NATION PER USER */}
                <div className="flex flex-col gap-1.5 flex-1 min-h-[220px] overflow-hidden">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Wähle deine Nation <span className="text-amber-400 text-[10px]">(1 Nation pro Spieler)</span>
                    </label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Suchen..."
                      className="px-2 py-0.5 text-xs rounded bg-slate-950 border border-slate-700 w-36 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto border border-slate-800 rounded-lg p-1.5 flex flex-col gap-1 bg-slate-950/60 max-h-56">
                    {filteredNations.map(n => {
                      const isTaken = !!claimedNations[n.tag];
                      const takenBy = claimedNations[n.tag];
                      const isSelected = selectedNation === n.tag;

                      return (
                        <div
                          key={n.tag}
                          onClick={() => {
                            if (!isTaken) setSelectedNation(n.tag);
                          }}
                          className={`flex items-center justify-between p-2 rounded-md transition text-xs ${
                            isTaken
                              ? 'opacity-40 bg-slate-900/40 cursor-not-allowed border border-transparent'
                              : isSelected
                              ? 'bg-amber-950/70 border border-amber-400 text-amber-200 cursor-pointer shadow'
                              : 'bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={n.flag}
                              alt="flag"
                              className="w-6 h-4 object-cover rounded shadow border border-slate-700 shrink-0"
                            />
                            <div>
                              <div className="font-semibold">{n.name}</div>
                              <div className="text-[10px] text-slate-400">
                                {n.provincesCount} Provinzen · {n.government}
                              </div>
                            </div>
                          </div>

                          <div>
                            {isTaken ? (
                              <span className="px-1.5 py-0.5 text-[9px] rounded bg-rose-950 text-rose-300 border border-rose-800/50">
                                Belegt von: {takenBy}
                              </span>
                            ) : isSelected ? (
                              <span className="text-amber-400 font-bold">✓ Ausgewählt</span>
                            ) : (
                              <span className="text-[10px] text-emerald-400 font-medium">Frei</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !selectedNation}
                  className="mt-1 w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-sm transition shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Registrieren...' : 'Konto erstellen & Nation wählen'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
