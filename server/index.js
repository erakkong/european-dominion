const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');
const { simulation, BUILDING_TYPES } = require('./simulation');
const { saveGameState, loadGameState, listSaves } = require('./saveManager');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

app.use(cors());
app.use(express.json());

// Serve static assets from client/public/assets and client/dist
app.use('/assets', express.static(path.join(__dirname, '../client/public/assets')));
app.use('/data', express.static(path.join(__dirname, '../client/public/data')));
app.use(express.static(path.join(__dirname, '../client/dist')));

// Initialize simulation
simulation.init();

// Broadcast helper for WebSockets
function broadcast(data) {
  const payload = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

// Attach broadcast to simulation ticks
const originalProcessTick = simulation.processTick.bind(simulation);
simulation.processTick = function() {
  originalProcessTick();
  broadcast({
    type: 'TICK_UPDATE',
    date: simulation.date,
    tickCount: simulation.tickCount,
    nations: Object.fromEntries(simulation.nations),
    regions: Object.fromEntries(simulation.regions),
    constructionQueue: simulation.constructionQueue,
    armies: simulation.armies,
    events: simulation.events
  });
};

// REST API Endpoints
app.get('/api/state', (req, res) => {
  res.json(simulation.getStateSnapshot());
});

app.get('/api/provinces', (req, res) => {
  res.json(simulation.getProvincesData());
});

app.get('/api/building-types', (req, res) => {
  res.json(BUILDING_TYPES);
});

app.get('/api/saves', (req, res) => {
  res.json(listSaves());
});

app.post('/api/save', (req, res) => {
  const { name } = req.body || {};
  const result = saveGameState(simulation.getStateSnapshot(), name);
  res.json(result);
});

app.post('/api/load', (req, res) => {
  const { name } = req.body || {};
  const result = loadGameState(name);
  if (result.success) {
    // Restore state
    const s = result.data;
    simulation.date = s.date;
    simulation.tickCount = s.tickCount;
    simulation.playerNation = s.playerNation;
    simulation.constructionQueue = s.constructionQueue || [];
    simulation.armies = s.armies || [];
    simulation.events = s.events || [];
    
    // Restore provinces & nations
    if (s.nations) {
      for (const [tag, nData] of Object.entries(s.nations)) {
        if (simulation.nations.has(tag)) {
          Object.assign(simulation.nations.get(tag), nData);
        }
      }
    }
    
    broadcast({ type: 'STATE_RESET', state: simulation.getStateSnapshot() });
    res.json({ success: true });
  } else {
    res.status(400).json(result);
  }
});

app.post('/api/action', (req, res) => {
  const { action, payload } = req.body || {};
  console.log(`[ACTION] Received ${action}:`, payload);

  switch (action) {
    case 'SET_PAUSE': {
      if (payload.isPaused) simulation.pause();
      else simulation.start();
      broadcast({ type: 'PAUSE_UPDATE', isPaused: simulation.isPaused });
      return res.json({ success: true, isPaused: simulation.isPaused });
    }
    case 'SET_SPEED': {
      simulation.setSpeed(payload.speed);
      broadcast({ type: 'SPEED_UPDATE', speed: simulation.speed });
      return res.json({ success: true, speed: simulation.speed });
    }
    case 'SELECT_NATION': {
      simulation.playerNation = payload.tag;
      broadcast({ type: 'PLAYER_NATION_UPDATE', playerNation: simulation.playerNation });
      return res.json({ success: true, playerNation: simulation.playerNation });
    }
    case 'BUILD': {
      const result = simulation.startConstruction(payload.pid, payload.buildingType, simulation.playerNation);
      if (result.success) {
        broadcast({
          type: 'CONSTRUCTION_UPDATE',
          queue: simulation.constructionQueue,
          nations: Object.fromEntries(simulation.nations)
        });
      }
      return res.json(result);
    }
    case 'TOGGLE_SUBSIDY': {
      const result = simulation.toggleSubsidy(payload.pid, payload.subsidyType, simulation.playerNation);
      if (result.success) {
        const prov = simulation.provinces.get(payload.pid);
        broadcast({
          type: 'PROVINCE_UPDATE',
          province: prov
        });
      }
      return res.json(result);
    }
    case 'SET_STRAIT_TOLL': {
      const result = simulation.setStraitToll(payload.straitId, payload.tollRate, payload.isBlockaded, simulation.playerNation);
      if (result.success) {
        broadcast({
          type: 'STRAITS_UPDATE',
          straits: Object.fromEntries(simulation.straits),
          events: simulation.events
        });
      }
      return res.json(result);
    }
    case 'RECRUIT_UNIT': {
      // Create new regiment
      const prov = simulation.provinces.get(payload.pid);
      const nation = simulation.nations.get(simulation.playerNation);
      if (!prov || prov.owner !== simulation.playerNation) return res.status(400).json({ error: 'Nicht eure Provinz' });

      const cost = payload.unitType === 'cavalry' ? 200 : (payload.unitType === 'artillery' ? 300 : 120);
      if (nation.treasury < cost) return res.status(400).json({ error: 'Zu wenig Gold' });

      nation.treasury -= cost;
      
      // Find or create army at province
      let army = simulation.armies.find(a => a.pid === payload.pid && a.nation === simulation.playerNation);
      if (!army) {
        army = {
          id: `army_${Date.now()}`,
          name: `Garnison von ${prov.name}`,
          nation: simulation.playerNation,
          pid: payload.pid,
          units: { line_infantry: 0, cavalry: 0, artillery: 0 },
          morale: 90,
          organization: 80,
          general: 'Regimentskommandeur',
          isMoving: false,
          path: [],
          targetPid: null,
          movementProgress: 0
        };
        simulation.armies.push(army);
      }

      if (payload.unitType === 'cavalry') army.units.cavalry = (army.units.cavalry || 0) + 500;
      else if (payload.unitType === 'artillery') army.units.artillery = (army.units.artillery || 0) + 12;
      else army.units.line_infantry = (army.units.line_infantry || 0) + 1000;

      broadcast({
        type: 'ARMIES_UPDATE',
        armies: simulation.armies,
        nations: Object.fromEntries(simulation.nations)
      });
      return res.json({ success: true, army });
    }
    case 'MOVE_ARMY': {
      const army = simulation.armies.find(a => a.id === payload.armyId);
      if (army && army.nation === simulation.playerNation) {
        army.isMoving = true;
        army.targetPid = payload.targetPid;
        army.movementProgress = 0;
        broadcast({ type: 'ARMIES_UPDATE', armies: simulation.armies });
        return res.json({ success: true, army });
      }
      return res.status(400).json({ error: 'Armee ungültig' });
    }
    default:
      return res.status(400).json({ error: `Unbekannte Aktion: ${action}` });
  }
});

// WebSocket Connection handling
wss.on('connection', (ws) => {
  console.log('[WS] Client connected.');
  // Send initial full snapshot
  ws.send(JSON.stringify({
    type: 'INIT_STATE',
    state: simulation.getStateSnapshot()
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      // Handle client websocket requests if any
    } catch (err) {
      console.error('[WS] Message parse error:', err);
    }
  });

  ws.on('close', () => {
    console.log('[WS] Client disconnected.');
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`=== [EUROPEAN DOMINION SERVER] RUNNING ON HTTP & WS PORT ${PORT} ===`);
});
