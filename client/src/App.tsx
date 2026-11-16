import React, { useState, useEffect, useRef } from 'react';
import { Province, Nation, Region, Strait, ConstructionItem, Army, GameEvent, DateState, MapMode, User, ChatMessage } from './types';
import { TopBar } from './components/TopBar';
import { MapCanvas } from './components/MapCanvas';
import { ProvinceDrawer } from './components/ProvinceDrawer';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { StraitModal } from './components/StraitModal';
import { NationSelectModal } from './components/NationSelectModal';
import { SaveLoadModal } from './components/SaveLoadModal';
import { BottomTicker } from './components/BottomTicker';
import { AuthModal } from './components/AuthModal';
import { ChatWidget } from './components/ChatWidget';

export default function App() {
  // Game State
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [nations, setNations] = useState<Record<string, Nation>>({});
  const [regions, setRegions] = useState<Record<string, Region>>({});
  const [straits, setStraits] = useState<Record<string, Strait>>({});
  const [armies, setArmies] = useState<Army[]>([]);
  const [constructionQueue, setConstructionQueue] = useState<ConstructionItem[]>([]);
  const [events, setEvents] = useState<GameEvent[]>([]);

  // Simulation controls
  const [date, setDate] = useState<DateState>({ year: 1618, month: 5, day: 23 });
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [playerNationTag, setPlayerNationTag] = useState<string>('swe2_m');

  // UI state
  const [mapMode, setMapMode] = useState<MapMode>('political');
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [selectedStrait, setSelectedStrait] = useState<Strait | null>(null);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState<boolean>(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(false);
  const [isNationSelectOpen, setIsNationSelectOpen] = useState<boolean>(false);
  const [isSaveLoadOpen, setIsSaveLoadOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const wsRef = useRef<WebSocket | null>(null);

  // Initial Data Fetch & Auth Restore
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        console.log('[APP] Fetching initial game datasets...');
        const [provRes, stateRes] = await Promise.all([
          fetch('/api/provinces'),
          fetch('/api/state')
        ]);

        const provData = await provRes.json();
        const stateData = await stateRes.json();

        setProvinces(provData || []);
        if (stateData) {
          setDate(stateData.date);
          setIsPaused(stateData.isPaused);
          setSpeed(stateData.speed);
          setPlayerNationTag(stateData.playerNation || 'swe2_m');
          setNations(stateData.nations || {});
          setRegions(stateData.regions || {});
          setStraits(stateData.straits || {});
          setConstructionQueue(stateData.constructionQueue || []);
          setArmies(stateData.armies || []);
          setEvents(stateData.events || []);
        }

        // Restore auth session from localStorage
        const savedToken = localStorage.getItem('pax_token');
        if (savedToken) {
          try {
            const meRes = await fetch('/api/auth/me', {
              headers: { Authorization: `Bearer ${savedToken}` }
            });
            const meData = await meRes.json();
            if (meData.user) {
              setCurrentUser(meData.user);
              if (meData.user.nationTag) {
                setPlayerNationTag(meData.user.nationTag);
              }
            } else {
              localStorage.removeItem('pax_token');
              localStorage.removeItem('pax_user');
            }
          } catch {
            // Silently ignore network error on session check
          }
        }

        // Fetch recent diplomatic chat messages
        try {
          const chatRes = await fetch('/api/chat/messages');
          const chatData = await chatRes.json();
          if (chatData?.messages) {
            setChatMessages(chatData.messages);
          }
        } catch {
          // Silently ignore chat loading error
        }
      } catch (err) {
        console.error('[APP] Data loading error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, []);

  const handleLoginSuccess = (user: User, _token: string) => {
    setCurrentUser(user);
    if (user.nationTag) {
      setPlayerNationTag(user.nationTag);
      sendAction('SELECT_NATION', { tag: user.nationTag });
    }
  };

  const handleLogout = () => {
    const token = localStorage.getItem('pax_token');
    fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    }).catch(() => {});
    localStorage.removeItem('pax_token');
    localStorage.removeItem('pax_user');
    setCurrentUser(null);
  };

  // WebSocket Setup
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log('[WS] Connected to European Dominion server.');
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case 'INIT_STATE':
            setDate(msg.state.date);
            setIsPaused(msg.state.isPaused);
            setSpeed(msg.state.speed);
            setPlayerNationTag(msg.state.playerNation);
            setNations(msg.state.nations);
            setRegions(msg.state.regions);
            setStraits(msg.state.straits);
            setConstructionQueue(msg.state.constructionQueue || []);
            setArmies(msg.state.armies || []);
            setEvents(msg.state.events || []);
            break;
          case 'TICK_UPDATE':
            setDate(msg.date);
            setNations(msg.nations);
            setRegions(msg.regions);
            setConstructionQueue(msg.constructionQueue || []);
            setArmies(msg.armies || []);
            setEvents(msg.events || []);
            break;
          case 'PAUSE_UPDATE':
            setIsPaused(msg.isPaused);
            break;
          case 'SPEED_UPDATE':
            setSpeed(msg.speed);
            break;
          case 'PLAYER_NATION_UPDATE':
            setPlayerNationTag(msg.playerNation);
            break;
          case 'CONSTRUCTION_UPDATE':
            setConstructionQueue(msg.queue);
            setNations(msg.nations);
            break;
          case 'STRAITS_UPDATE':
            setStraits(msg.straits);
            if (msg.events) setEvents(msg.events);
            break;
          case 'ARMIES_UPDATE':
            setArmies(msg.armies);
            if (msg.nations) setNations(msg.nations);
            break;
          case 'PROVINCE_UPDATE':
            setProvinces(prev => prev.map(p => p.id === msg.province.id ? msg.province : p));
            if (selectedProvince && selectedProvince.id === msg.province.id) {
              setSelectedProvince(msg.province);
            }
            break;
          case 'STATE_RESET':
            setDate(msg.state.date);
            setPlayerNationTag(msg.state.playerNation);
            setNations(msg.state.nations);
            setArmies(msg.state.armies || []);
            setConstructionQueue(msg.state.constructionQueue || []);
            break;
          case 'CHAT_HISTORY':
            if (msg.messages) {
              setChatMessages(msg.messages);
            }
            break;
          case 'CHAT_MESSAGE':
            if (msg.message) {
              setChatMessages(prev => {
                if (prev.some(m => m.id === msg.message.id)) return prev;
                return [...prev.slice(-99), msg.message];
              });
            }
            break;
          default:
            break;
        }
      } catch (e) {
        console.error('[WS] Parse error:', e);
      }
    };

    socket.onclose = () => {
      console.log('[WS] Disconnected.');
    };

    return () => {
      socket.close();
    };
  }, [selectedProvince]);

  // Dispatch Action Helper
  const sendAction = async (action: string, payload: any) => {
    try {
      const res = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload })
      });
      return await res.json();
    } catch (err) {
      console.error('[ACTION] Error:', err);
      return { success: false, error: err };
    }
  };

  // Actions
  const handleTogglePause = () => {
    sendAction('SET_PAUSE', { isPaused: !isPaused });
  };

  const handleSetSpeed = (s: number) => {
    sendAction('SET_SPEED', { speed: s });
  };

  const handleSelectNation = (tag: string) => {
    sendAction('SELECT_NATION', { tag });
  };

  const handleStartBuild = (pid: number, buildingType: string) => {
    sendAction('BUILD', { pid, buildingType });
  };

  const handleToggleSubsidy = (pid: number, subsidyType: string) => {
    sendAction('TOGGLE_SUBSIDY', { pid, subsidyType });
  };

  const handleRecruitUnit = (pid: number, unitType: string) => {
    sendAction('RECRUIT_UNIT', { pid, unitType });
  };

  const handleUpdateStrait = (straitId: string, tollRate: number, isBlockaded: boolean) => {
    sendAction('SET_STRAIT_TOLL', { straitId, tollRate, isBlockaded });
  };

  const handleIssueMoveCommand = (armyId: string, targetPid: number) => {
    sendAction('MOVE_ARMY', { armyId, targetPid });
  };

  const handleSaveGame = async (name?: string) => {
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    return await res.json();
  };

  const handleLoadGame = async (name: string) => {
    const res = await fetch('/api/load', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    return await res.json();
  };

  const handleSendChatMessage = async (text: string) => {
    const token = localStorage.getItem('pax_token');
    if (!token) {
      setIsAuthModalOpen(true);
      return { success: false, error: 'Bitte melde dich zuerst an.' };
    }

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text, token })
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { success: false, error: err.message || 'Verbindungsfehler' };
    }
  };

  const currentPlayerNation = nations[playerNationTag] || null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-amber-300">
          <div className="font-royal text-2xl font-bold tracking-widest mb-3 animate-pulse">
            EUROPEAN DOMINION
          </div>
          <div className="text-sm text-slate-400">
            Lade 3.621 historische Provinzen, Königshäuser & Kartendaten...
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <TopBar
        playerNation={currentPlayerNation}
        date={date}
        isPaused={isPaused}
        speed={speed}
        mapMode={mapMode}
        onSetMapMode={setMapMode}
        onTogglePause={handleTogglePause}
        onSetSpeed={handleSetSpeed}
        onOpenSaveLoad={() => setIsSaveLoadOpen(true)}
        onOpenNationSelect={() => setIsNationSelectOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Central Interactive Map Engine */}
      <main className="w-full h-full pt-16 pb-9">
        <MapCanvas
          provinces={provinces}
          nations={nations}
          regions={regions}
          straits={straits}
          armies={armies}
          playerNation={playerNationTag}
          mapMode={mapMode}
          selectedProvince={selectedProvince}
          onSelectProvince={setSelectedProvince}
          onSelectStrait={setSelectedStrait}
          onSelectArmy={(army) => console.log('Selected army:', army)}
          onIssueMoveCommand={handleIssueMoveCommand}
        />
      </main>

      {/* Province Drawer */}
      <ProvinceDrawer
        province={selectedProvince}
        playerNation={currentPlayerNation}
        nations={nations}
        regions={regions}
        constructionQueue={constructionQueue}
        onClose={() => setSelectedProvince(null)}
        onStartBuild={handleStartBuild}
        onToggleSubsidy={handleToggleSubsidy}
        onRecruitUnit={handleRecruitUnit}
      />

      {/* Left Panel (Politics, Dynasty, Diplomacy, Missions) */}
      <LeftPanel
        playerNation={currentPlayerNation}
        nations={nations}
        isOpen={isLeftPanelOpen}
        onClose={() => setIsLeftPanelOpen(false)}
      />

      {/* Right Panel (Economy, Markets, Tech Tree, Straits) */}
      <RightPanel
        playerNation={currentPlayerNation}
        straits={straits}
        nations={nations}
        isOpen={isRightPanelOpen}
        onClose={() => setIsRightPanelOpen(false)}
        onSelectStrait={(s) => setSelectedStrait(s)}
      />

      {/* Strategic Strait Modal */}
      <StraitModal
        strait={selectedStrait}
        playerNation={currentPlayerNation}
        nations={nations}
        onClose={() => setSelectedStrait(null)}
        onUpdateStrait={handleUpdateStrait}
      />

      {/* Nation Selection Modal */}
      <NationSelectModal
        isOpen={isNationSelectOpen}
        nations={nations}
        currentNationTag={playerNationTag}
        onClose={() => setIsNationSelectOpen(false)}
        onSelectNation={handleSelectNation}
      />

      {/* Save / Load Modal */}
      <SaveLoadModal
        isOpen={isSaveLoadOpen}
        onClose={() => setIsSaveLoadOpen(false)}
        onSave={handleSaveGame}
        onLoad={handleLoadGame}
      />

      {/* Auth Modal (Login / Register / 1-Nation Lock) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        nations={nations}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />

      {/* Real-time Diplomatic Chat */}
      <ChatWidget
        messages={chatMessages}
        currentUser={currentUser}
        nations={nations}
        onSendMessage={handleSendChatMessage}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Bottom News & Event Ticker */}
      <BottomTicker
        events={events}
        onToggleLeftPanel={() => {
          setIsLeftPanelOpen(!isLeftPanelOpen);
          setIsRightPanelOpen(false);
        }}
        onToggleRightPanel={() => {
          setIsRightPanelOpen(!isRightPanelOpen);
          setIsLeftPanelOpen(false);
        }}
        isLeftPanelOpen={isLeftPanelOpen}
        isRightPanelOpen={isRightPanelOpen}
      />
    </div>
  );
}
