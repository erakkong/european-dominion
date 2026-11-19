import React, { useState, useEffect } from 'react';
import { Nation, User } from '../types';
import { Crown, User as UserIcon, Lock, X, Check, ShieldAlert, Sparkles, Scroll, Search } from 'lucide-react';

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
      setError('Verbindung zum Reichsarchiv fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedNation) {
      setError('Bitte wähle eine freie Nation für dein Herrscherhaus aus.');
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
      setError('Verbindung zum Reichsarchiv fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-150 p-4 select-none">
      <div className="w-full max-w-lg max-h-[90vh] imperial-panel rounded-xl shadow-2xl border border-amber-500/50 overflow-hidden flex flex-col text-slate-100">
        {/* Heraldic Header */}
        <div className="imperial-header p-4 flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-inner">
              <Crown size={20} />
            </div>
            <div>
              <h2 className="font-royal font-bold text-base md:text-lg text-amber-300 leading-tight">
                {currentUser ? 'Herrscherurkunde & Profil' : 'Kaiserliches Reichsregister'}
              </h2>
              <span className="text-[11px] text-slate-300 font-parchment italic mt-0.5 block">
                {currentUser ? `Angemeldet als ${currentUser.username}` : 'Legitimation der europäischen Herrscher'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition"
            title="Schließen"
          >
            <X size={18} />
          </button>
        </div>

        {/* Logged in state */}
        {currentUser ? (
          <div className="p-6 space-y-4">
            <div className="p-4 rounded imperial-card border-amber-500/40 text-center space-y-2">
              <div className="text-3xl">
                {currentUser.role === 'admin' ? '👑' : '🛡️'}
              </div>
              <h3 className="font-royal font-bold text-lg text-amber-300">
                {currentUser.username}
              </h3>
              <p className="text-xs text-slate-300 font-sans-ui">
                Rolle: <strong className="text-amber-400 uppercase font-mono">{currentUser.role}</strong>
                {currentUser.nationTag && (
                  <span> · Zugewiesene Nation: <strong className="text-slate-100">{nations[currentUser.nationTag]?.name || currentUser.nationTag}</strong></span>
                )}
              </p>
              {currentUser.role === 'admin' && (
                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-parchment italic mt-2">
                  Als Administrator besitzt du volle Spielleiter-Rechte und kannst jede Nation frei wählen oder steuern.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded imperial-btn text-rose-300 border-rose-500/40 hover:text-rose-100 font-royal text-xs font-bold"
              >
                Abmelden
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded imperial-btn-gold text-slate-950 font-royal text-xs font-bold"
              >
                Zum Reich
              </button>
            </div>
          </div>
        ) : (
          /* Login / Register Tabs */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-amber-500/30 bg-slate-950 text-xs font-royal">
              <button
                onClick={() => { setTab('login'); setError(null); }}
                className={`flex-1 py-2.5 font-bold flex items-center justify-center gap-2 transition ${
                  tab === 'login'
                    ? 'text-amber-300 border-b-2 border-amber-400 bg-amber-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Lock size={13} />
                <span>Anmelden</span>
              </button>
              <button
                onClick={() => { setTab('register'); setError(null); }}
                className={`flex-1 py-2.5 font-bold flex items-center justify-center gap-2 transition ${
                  tab === 'register'
                    ? 'text-amber-300 border-b-2 border-amber-400 bg-amber-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Scroll size={13} />
                <span>Neues Herrscherhaus eintragen</span>
              </button>
            </div>

            {/* Form Area */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {error && (
                <div className="p-3 rounded bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
                  <ShieldAlert size={16} className="shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {tab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-royal font-bold text-amber-300 uppercase tracking-wider block">
                      Herrscher- / Benutzername
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="z.B. admin oder Kaiser..."
                      className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 focus:border-amber-400 outline-none text-slate-100 font-sans-ui text-sm shadow-inner transition"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-royal font-bold text-amber-300 uppercase tracking-wider block">
                      Geheimes Siegel-Passwort
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 focus:border-amber-400 outline-none text-slate-100 font-sans-ui text-sm shadow-inner transition"
                      required
                    />
                  </div>

                  {/* Admin info badge for convenience */}
                  <div className="p-2.5 rounded bg-slate-950/80 border border-amber-500/30 text-[11px] text-slate-400 font-sans-ui flex items-center justify-between">
                    <span>Admin-Zugang: <strong className="text-amber-300 font-mono">admin</strong></span>
                    <span>Passwort: <strong className="text-amber-300 font-mono">admin-123</strong></span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded imperial-btn-gold text-slate-950 font-royal font-bold text-sm shadow-lg transition active:scale-98 disabled:opacity-50"
                  >
                    {loading ? 'Siegel wird geprüft...' : 'Im Reichsregister anmelden'}
                  </button>
                </form>
              ) : (
                /* Registration with 1-Nation selection */
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-royal font-bold text-amber-300 uppercase tracking-wider block">
                      Wähle deinen Herrschernamen
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="z.B. König_Christian, Sultan, Kaiser..."
                      className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 focus:border-amber-400 outline-none text-slate-100 font-sans-ui text-sm shadow-inner transition"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-royal font-bold text-amber-300 uppercase tracking-wider block">
                      Passwort festlegen
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mindestens 4 Zeichen..."
                      className="w-full px-3 py-2 rounded bg-slate-950 border border-slate-700 focus:border-amber-400 outline-none text-slate-100 font-sans-ui text-sm shadow-inner transition"
                      required
                    />
                  </div>

                  {/* Nation selection (1 Nation per User) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-royal font-bold text-amber-300 uppercase tracking-wider">
                        Wähle deine Nation (1 Nation pro Spieler!)
                      </label>
                      <span className="text-[10px] text-slate-400 font-sans-ui">
                        {selectedNation ? `Gewählt: ${nations[selectedNation]?.name}` : 'Keine gewählt'}
                      </span>
                    </div>

                    <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Nation suchen (z.B. Preußen, Schweden, Spanien...)"
                        className="w-full pl-8 pr-3 py-1.5 rounded bg-slate-950 border border-slate-700 focus:border-amber-400 outline-none text-slate-100 font-sans-ui text-xs shadow-inner"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1 rounded bg-slate-950/80 p-1.5 border border-slate-800">
                      {filteredNations.map((nat) => {
                        const isClaimed = !!claimedNations[nat.tag];
                        const claimedBy = claimedNations[nat.tag];
                        const isSelected = selectedNation === nat.tag;

                        return (
                          <div
                            key={nat.tag}
                            onClick={() => {
                              if (!isClaimed) setSelectedNation(nat.tag);
                            }}
                            className={`p-2 rounded flex items-center justify-between text-xs transition ${
                              isClaimed
                                ? 'opacity-40 cursor-not-allowed bg-rose-950/20 border border-rose-900/30'
                                : isSelected
                                ? 'bg-amber-500/20 border border-amber-400 text-amber-200 cursor-pointer shadow-sm'
                                : 'hover:bg-slate-800/80 cursor-pointer border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {nat.flag && (
                                <img
                                  src={nat.flag}
                                  alt="flag"
                                  className="w-6 h-4 object-cover rounded shadow"
                                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                />
                              )}
                              <div>
                                <span className="font-royal font-bold text-slate-100">{nat.name}</span>
                                <span className="text-[10px] text-slate-400 font-sans-ui ml-2">{nat.provincesCount} Prov.</span>
                              </div>
                            </div>

                            {isClaimed ? (
                              <span className="text-[10px] font-mono text-rose-400 font-bold">
                                Belegt ({claimedBy})
                              </span>
                            ) : isSelected ? (
                              <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold font-royal">
                                <Check size={12} /> Gewählt
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-400 font-sans-ui">
                                Frei
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !selectedNation}
                    className="w-full py-2.5 rounded imperial-btn-gold text-slate-950 font-royal font-bold text-sm shadow-lg transition active:scale-98 disabled:opacity-50"
                  >
                    {loading ? 'Herrscherhaus wird eingetragen...' : 'Herrscherhaus gründen & Starten'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
