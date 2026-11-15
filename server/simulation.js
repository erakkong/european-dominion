const fs = require('fs');
const path = require('path');
const { saveGameState, loadGameState } = require('./saveManager');

const dataDir = path.join(__dirname, '../data');

// Building definitions & costs per level (1 -> 4)
const BUILDING_TYPES = {
  farm: {
    id: 'farm',
    name: 'Bauernhof',
    category: 'civilian',
    maxLevel: 4,
    costs: [100, 220, 480, 950],
    buildDays: [60, 90, 140, 200],
    description: 'Erhöht die Nahrungsmittelproduktion und das Bevölkerungswachstum.',
    effects: (lvl) => ({ food: lvl * 25, popGrowth: lvl * 0.4 })
  },
  market: {
    id: 'market',
    name: 'Marktplatz',
    category: 'civilian',
    maxLevel: 4,
    costs: [150, 320, 650, 1300],
    buildDays: [75, 110, 160, 240],
    description: 'Verbessert den lokalen Handel und erhöht direkte Steuereinnahmen.',
    effects: (lvl) => ({ taxBonus: lvl * 0.12, tradeValue: lvl * 15 })
  },
  manufactory: {
    id: 'manufactory',
    name: 'Manufaktur',
    category: 'civilian',
    maxLevel: 4,
    costs: [250, 550, 1100, 2200],
    buildDays: [90, 140, 200, 300],
    description: 'Produziert gewerbliche Fertigwaren und steigert den Wohlstand.',
    effects: (lvl) => ({ goodsProduction: lvl * 20, revenue: lvl * 18 })
  },
  university: {
    id: 'university',
    name: 'Universität',
    category: 'civilian',
    maxLevel: 4,
    costs: [350, 750, 1500, 3000],
    buildDays: [120, 180, 260, 365],
    description: 'Zentrum für Wissenschaft und Aufklärung. Generiert Forschungspunkte.',
    effects: (lvl) => ({ researchPoints: lvl * 8, enlightenmentBonus: lvl * 0.05 })
  },
  administration: {
    id: 'administration',
    name: 'Verwaltungsgebäude',
    category: 'civilian',
    maxLevel: 4,
    costs: [180, 380, 800, 1600],
    buildDays: [80, 120, 180, 250],
    description: 'Verbessert Steuereffizienz und senkt regionale Korruption.',
    effects: (lvl) => ({ adminEfficiency: lvl * 0.15, unrestReduction: lvl * 0.5 })
  },
  barracks: {
    id: 'barracks',
    name: 'Kaserne',
    category: 'military',
    maxLevel: 4,
    costs: [200, 420, 900, 1800],
    buildDays: [70, 100, 150, 220],
    description: 'Erhöht Rekrutierungskapazität und Truppenausbildungsgeschwindigkeit.',
    effects: (lvl) => ({ manpowerReserve: lvl * 1500, recruitSpeed: lvl * 0.20 })
  },
  fortress: {
    id: 'fortress',
    name: 'Festung',
    category: 'military',
    maxLevel: 4,
    costs: [300, 700, 1600, 3500],
    buildDays: [100, 160, 240, 360],
    description: 'Verstärkt die Provinzverteidigung und zwingt Angreifer zu langen Belagerungen.',
    effects: (lvl) => ({ defenseBonus: lvl * 25, siegeResistance: lvl * 30 })
  },
  port: {
    id: 'port',
    name: 'Seehafen',
    category: 'civilian',
    maxLevel: 4,
    costs: [250, 520, 1100, 2200],
    buildDays: [90, 130, 190, 280],
    description: 'Ermöglicht überseeischen Handel, Konvoi-Versorgung und Flottenstationierung.',
    effects: (lvl) => ({ seaTrade: lvl * 20, navalCapacity: lvl * 5 })
  },
  railway: {
    id: 'railway',
    name: 'Eisenbahnstation & Gleisnetz',
    category: 'infrastructure',
    maxLevel: 4,
    costs: [400, 900, 1900, 3800],
    buildDays: [120, 180, 260, 380],
    description: 'Erfordert Technologie. Beschleunigt Truppenverlegung und Gütertransport massiv.',
    effects: (lvl) => ({ movementSpeedBonus: lvl * 0.50, supplyThroughput: lvl * 0.40, tradeBonus: lvl * 0.25 })
  },
  castle: {
    id: 'castle',
    name: 'Schloss & Königliche Residenz',
    category: 'noble',
    maxLevel: 4,
    costs: [500, 1200, 2500, 5000],
    buildDays: [150, 220, 320, 450],
    description: 'Steigert dynastisches Prestige, Hofeinfluss und monarchische Legitimität.',
    effects: (lvl) => ({ monthlyPrestige: lvl * 2, legitimacyBonus: lvl * 3 })
  }
};

class SimulationEngine {
  constructor() {
    this.isInitialized = false;
    this.isPaused = true;
    this.speed = 1; // 1: normal, 2: fast, 3: very fast, 4: ultra
    this.tickInterval = null;
    
    // Calendar: starts in 1618 (Thirty Years' War)
    this.date = { year: 1618, month: 5, day: 23 };
    this.tickCount = 0;

    // Simulation Data Collections
    this.provinces = new Map();
    this.nations = new Map();
    this.regions = new Map();
    this.straits = new Map();
    this.military = null;

    // State Queues
    this.constructionQueue = [];
    this.armies = [];
    this.events = [];
    this.playerNation = 'swe2_m'; // Default: Swedish Empire (Gustav II. Adolf)
  }

  init() {
    console.log('[SIM] Initializing European Dominion Simulation...');
    
    // Load JSON files
    const provsRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'provinces.json'), 'utf8'));
    const nationsRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'nations.json'), 'utf8'));
    const regionsRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'regions.json'), 'utf8'));
    const straitsRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'straits.json'), 'utf8'));
    const militaryRaw = JSON.parse(fs.readFileSync(path.join(dataDir, 'military.json'), 'utf8'));

    // Populate Provinces
    for (const p of provsRaw) {
      this.provinces.set(p.id, {
        ...p,
        // Active building levels
        buildings: { ...p.buildings },
        subsidies: { ...p.subsidies }
      });
    }

    // Populate Nations
    for (const n of nationsRaw) {
      this.nations.set(n.tag, {
        ...n,
        controlledRegions: [], // regions with 100% control
        researchPoints: 50,
        currentTech: 'Aufklärung & Kameralismus',
        techProgress: 25
      });
    }

    // Populate Regions
    for (const [rId, rData] of Object.entries(regionsRaw)) {
      this.regions.set(rId, {
        ...rData,
        controller: null, // nation with 100% control
        controlBreakdown: {} // tag -> percentage
      });
    }

    // Populate Straits
    for (const s of straitsRaw) {
      this.straits.set(s.id, { ...s });
    }

    this.military = militaryRaw;

    // Initial region control calculation
    this.recalculateRegionalControl();

    // Initial armies for major nations
    this.spawnInitialArmies();

    // Add starting welcome event (1618)
    this.addEvent({
      id: `evt_prague_${Date.now()}`,
      title: 'Der Prager Fenstersturz (23. Mai 1618)',
      text: 'Die protestantischen Stände Böhmens werfen die kaiserlichen Statthalter aus den Fenstern der Prager Burg! Der Dreißigjährige Krieg bricht über Europa herein. Das Schicksal der Christenheit liegt in euren Händen!',
      date: { ...this.date },
      type: 'historic'
    });

    this.isInitialized = true;
    console.log(`[SIM] Initialized with ${this.provinces.size} provinces, ${this.nations.size} nations, ${this.regions.size} regions, ${this.straits.size} chokepoints.`);
  }

  spawnInitialArmies() {
    // Spawns historical armies in 1618 (Thirty Years' War Era)
    const majors = [
      { tag: 'swe2_m', pid: 1049, name: 'Königlich Schwedische Feldarmee', inf: 28000, cav: 9000, art: 60, general: 'König Gustav II. Adolf' },
      { tag: 'atr_m2', pid: 688, name: 'Kaiserliche Armee (Habsburg)', inf: 35000, cav: 10000, art: 80, general: 'Feldmarschall Graf von Bucquoy' },
      { tag: 'atr_m2', pid: 656, name: 'Böhmisches Korps der Kaiserlichen', inf: 22000, cav: 6000, art: 45, general: 'Graf Heinrich Matthias von Thurn' },
      { tag: 'bava_m', pid: 716, name: 'Armee der Katholischen Liga', inf: 25000, cav: 8000, art: 50, general: 'Feldherr Johann T’Serclaes von Tilly' },
      { tag: 'fra_m', pid: 260, name: 'Armée Royale de France', inf: 32000, cav: 8000, art: 70, general: 'Marschall François de Bassompierre' },
      { tag: 'spa3_m', pid: 6561, name: 'Spanische Tercios von Flandern & Kastilien', inf: 40000, cav: 12000, art: 85, general: 'Ambrosio Spinola' },
      { tag: 'pol2_m', pid: 1276, name: 'Kroneheer der Flügelhusaren', inf: 30000, cav: 15000, art: 60, general: 'Großhetman Jan Karol Chodkiewicz' },
      { tag: 'prus_m', pid: 592, name: 'Brandenburg-Preußische Leibgarde', inf: 16000, cav: 4500, art: 30, general: 'Kurfürst Johann Sigismund' },
      { tag: 'net_m2', pid: 6502, name: 'Staatische Armee der Niederlande', inf: 26000, cav: 7000, art: 55, general: 'Moritz von Oranien' },
      { tag: 'tur_m', pid: 1116, name: 'Osmanische Hocharmee (Janitscharen)', inf: 50000, cav: 18000, art: 90, general: 'Sultan Osman II.' }
    ];

    let armyId = 1;
    for (const m of majors) {
      if (this.provinces.has(m.pid)) {
        this.armies.push({
          id: `army_${armyId++}`,
          name: m.name,
          nation: m.tag,
          pid: m.pid,
          units: {
            line_infantry: m.inf,
            cavalry: m.cav,
            artillery: m.art
          },
          morale: 100,
          organization: 90,
          general: m.general,
          isMoving: false,
          path: [],
          targetPid: null,
          movementProgress: 0
        });
      }
    }
  }

  recalculateRegionalControl() {
    for (const [rId, reg] of this.regions.entries()) {
      const provList = reg.provinces || [];
      if (provList.length === 0) continue;

      const counts = {};
      for (const pid of provList) {
        const p = this.provinces.get(pid);
        if (p && p.owner && p.owner !== 'neutral') {
          counts[p.owner] = (counts[p.owner] || 0) + 1;
        }
      }

      const total = provList.length;
      let fullController = null;
      const breakdown = {};

      for (const [tag, count] of Object.entries(counts)) {
        const pct = Math.round((count / total) * 100);
        breakdown[tag] = pct;
        if (pct === 100) {
          fullController = tag;
        }
      }

      reg.controlBreakdown = breakdown;
      reg.controller = fullController;
    }

    // Update nations controlled regions
    for (const [tag, nation] of this.nations.entries()) {
      const controlled = [];
      for (const [rId, reg] of this.regions.entries()) {
        if (reg.controller === tag) {
          controlled.push(rId);
        }
      }
      nation.controlledRegions = controlled;
    }
  }

  start() {
    this.isPaused = false;
    this.scheduleNextTick();
    console.log('[SIM] Simulation unpaused.');
  }

  pause() {
    this.isPaused = true;
    if (this.tickInterval) {
      clearTimeout(this.tickInterval);
      this.tickInterval = null;
    }
    console.log('[SIM] Simulation paused.');
  }

  setSpeed(newSpeed) {
    this.speed = Math.max(1, Math.min(4, newSpeed));
    console.log(`[SIM] Speed set to ${this.speed}`);
    if (!this.isPaused) {
      if (this.tickInterval) clearTimeout(this.tickInterval);
      this.scheduleNextTick();
    }
  }

  getTickDelay() {
    switch (this.speed) {
      case 1: return 2000; // 2.0s per day
      case 2: return 1000; // 1.0s per day
      case 3: return 500;  // 0.5s per day
      case 4: return 200;  // 0.2s per day
      default: return 1000;
    }
  }

  scheduleNextTick() {
    if (this.isPaused) return;
    this.tickInterval = setTimeout(() => {
      this.processTick();
      this.scheduleNextTick();
    }, this.getTickDelay());
  }

  processTick() {
    this.tickCount++;

    // Advance calendar by 1 day
    this.advanceDate();

    // 1. Process Construction Queue
    this.processConstruction();

    // 2. Process Army Movement & Battles
    this.processArmies();

    // 3. Process Economy (Daily and Monthly)
    const isNewMonth = (this.date.day === 1);
    this.processEconomy(isNewMonth);

    // 4. Strait Tolls Collection
    this.processStraitTolls();

    // 5. AI Decisions (every 7 ticks / once a week)
    if (this.tickCount % 7 === 0) {
      this.processAIDecisions();
    }
  }

  advanceDate() {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let d = this.date.day + 1;
    let m = this.date.month;
    let y = this.date.year;

    if (d > daysInMonth[m - 1]) {
      d = 1;
      m++;
      if (m > 12) {
        m = 1;
        y++;
      }
    }

    this.date = { year: y, month: m, day: d };
  }

  processConstruction() {
    const remainingQueue = [];
    for (const item of this.constructionQueue) {
      item.progressDays++;
      if (item.progressDays >= item.totalDays) {
        // Complete building
        const prov = this.provinces.get(item.pid);
        if (prov) {
          prov.buildings[item.buildingType] = (prov.buildings[item.buildingType] || 0) + 1;
          
          // Notify
          if (item.nationTag === this.playerNation) {
            const bldDef = BUILDING_TYPES[item.buildingType];
            this.addEvent({
              id: `bld_done_${Date.now()}_${Math.random()}`,
              title: `Bau vollendet: ${bldDef.name}`,
              text: `In ${prov.name} wurde ${bldDef.name} (Stufe ${prov.buildings[item.buildingType]}) erfolgreich fertiggestellt!`,
              date: { ...this.date },
              type: 'construction'
            });
          }
        }
      } else {
        remainingQueue.push(item);
      }
    }
    this.constructionQueue = remainingQueue;
  }

  processArmies() {
    for (const army of this.armies) {
      if (army.isMoving && army.targetPid !== null) {
        army.movementProgress += 0.25; // 4 days per province movement
        if (army.movementProgress >= 1.0) {
          army.pid = army.targetPid;
          army.movementProgress = 0;
          if (army.path && army.path.length > 0) {
            army.targetPid = army.path.shift();
          } else {
            army.isMoving = false;
            army.targetPid = null;
          }
        }
      }
    }
  }

  processEconomy(isNewMonth) {
    // Calculate per-nation daily / monthly balance
    for (const [tag, nation] of this.nations.entries()) {
      let dailyTax = 0;
      let dailyProduction = 0;
      let dailyExpenses = 0;

      // Regional bonuses multiplier
      const regCount = nation.controlledRegions ? nation.controlledRegions.length : 0;
      const regTaxBonus = regCount * 0.20; // +20% per fully controlled region
      const regProdBonus = regCount * 0.15; // +15% per fully controlled region

      for (const [pid, prov] of this.provinces.entries()) {
        if (prov.owner === tag && !prov.isSea) {
          // Base tax from pop & development
          let provTax = (prov.population / 25000) * (prov.development / 5) * 0.2;
          
          // Market bonus
          const mktLvl = prov.buildings.market || 0;
          if (mktLvl > 0) provTax *= (1 + mktLvl * 0.12);

          // Admin building bonus
          const admLvl = prov.buildings.administration || 0;
          if (admLvl > 0) provTax *= (1 + admLvl * 0.15);

          // Subsidies cost & benefits
          if (prov.subsidies.agriculture) dailyExpenses += 1.5;
          if (prov.subsidies.industry) dailyExpenses += 2.5;
          if (prov.subsidies.university) dailyExpenses += 3.0;
          if (prov.subsidies.infrastructure) dailyExpenses += 2.0;

          // Manufactory production
          const mfgLvl = prov.buildings.manufactory || 0;
          if (mfgLvl > 0) dailyProduction += mfgLvl * 2.2;

          dailyTax += provTax;
        }
      }

      // Apply regional control bonuses
      dailyTax *= (1 + regTaxBonus);
      dailyProduction *= (1 + regProdBonus);

      // Army upkeep
      const nationArmies = this.armies.filter(a => a.nation === tag);
      for (const a of nationArmies) {
        const count = (a.units.line_infantry || 0) + (a.units.cavalry || 0) * 1.5 + (a.units.artillery || 0) * 10;
        dailyExpenses += (count / 2000) * 0.8;
      }

      // Court expenses based on government & prestige
      dailyExpenses += 5.0 + (nation.prestige / 50) * 1.5;

      const dailyNet = (dailyTax + dailyProduction) - dailyExpenses;
      nation.treasury += dailyNet;
      nation.income = Math.round((dailyTax + dailyProduction) * 30);
      nation.expenses = Math.round(dailyExpenses * 30);
      nation.balance = Math.round(dailyNet * 30);

      // Monthly research progression
      if (isNewMonth) {
        nation.researchPoints += 5 + Math.round(nation.provincesCount * 0.3);
        nation.techProgress += Math.min(10, Math.round(nation.researchPoints / 25));
        if (nation.techProgress >= 100) {
          nation.techProgress = 0;
          nation.researchPoints = 0;
        }
      }
    }
  }

  processStraitTolls() {
    for (const [sId, strait] of this.straits.entries()) {
      if (strait.controllingNation && !strait.isBlockaded) {
        const nation = this.nations.get(strait.controllingNation);
        if (nation) {
          // Collect toll revenue from international shipping
          const dailyToll = strait.tollRateGoldPerShip * 0.8;
          nation.treasury += dailyToll;
        }
      }
    }
  }

  processAIDecisions() {
    for (const [tag, nation] of this.nations.entries()) {
      if (tag === this.playerNation) continue; // Skip player

      // AI spends surplus treasury on building infrastructure, farms and barracks
      if (nation.treasury > 800) {
        // Find an owned province with lowest building level
        const ownedProvs = [];
        for (const [pid, p] of this.provinces.entries()) {
          if (p.owner === tag && !p.isSea) ownedProvs.push(p);
        }

        if (ownedProvs.length > 0) {
          const randProv = ownedProvs[Math.floor(Math.random() * ownedProvs.length)];
          const bldChoices = ['farm', 'market', 'manufactory', 'barracks'];
          const chosenBld = bldChoices[Math.floor(Math.random() * bldChoices.length)];
          const currentLvl = randProv.buildings[chosenBld] || 0;

          if (currentLvl < 4) {
            const cost = BUILDING_TYPES[chosenBld].costs[currentLvl];
            if (nation.treasury >= cost) {
              this.startConstruction(randProv.id, chosenBld, tag);
            }
          }
        }
      }
    }
  }

  startConstruction(pid, buildingType, nationTag) {
    const prov = this.provinces.get(pid);
    if (!prov) return { success: false, error: 'Provinz existiert nicht' };
    if (prov.owner !== nationTag) return { success: false, error: 'Nicht im Besitz dieser Provinz' };

    const bldDef = BUILDING_TYPES[buildingType];
    if (!bldDef) return { success: false, error: 'Ungültiger Gebäudetyp' };

    const currentLvl = prov.buildings[buildingType] || 0;
    if (currentLvl >= bldDef.maxLevel) return { success: false, error: 'Maximale Ausbaustufe bereits erreicht' };

    const cost = bldDef.costs[currentLvl];
    const nation = this.nations.get(nationTag);
    if (!nation || nation.treasury < cost) return { success: false, error: 'Unzureichende finanzielle Mittel im Staatsschatz' };

    // Deduct cost
    nation.treasury -= cost;

    // Calculate build days (reduced by regional control infrastructure bonus)
    let totalDays = bldDef.buildDays[currentLvl];
    if (nation.controlledRegions && nation.controlledRegions.includes(prov.region)) {
      totalDays = Math.round(totalDays * 0.8); // 20% faster
    }

    const item = {
      id: `queue_${Date.now()}_${Math.random()}`,
      pid,
      buildingType,
      targetLevel: currentLvl + 1,
      progressDays: 0,
      totalDays,
      nationTag
    };

    this.constructionQueue.push(item);
    return { success: true, item };
  }

  toggleSubsidy(pid, subsidyType, nationTag) {
    const prov = this.provinces.get(pid);
    if (!prov || prov.owner !== nationTag) return { success: false, error: 'Keine Berechtigung' };

    if (prov.subsidies[subsidyType] !== undefined) {
      prov.subsidies[subsidyType] = !prov.subsidies[subsidyType];
      return { success: true, active: prov.subsidies[subsidyType] };
    }
    return { success: false, error: 'Ungültige Subvention' };
  }

  setStraitToll(straitId, tollRate, isBlockaded, nationTag) {
    const strait = this.straits.get(straitId);
    if (!strait) return { success: false, error: 'Meerenge nicht gefunden' };
    if (strait.controllingNation !== nationTag) return { success: false, error: 'Ihr kontrolliert diese Meerenge nicht' };

    strait.tollRateGoldPerShip = Math.max(0, Math.min(100, tollRate));
    strait.isBlockaded = !!isBlockaded;

    this.addEvent({
      id: `strait_${Date.now()}`,
      title: `Zolländerung: ${strait.name}`,
      text: `${this.nations.get(nationTag).name} hat den Durchfahrtszoll für ${strait.name} auf ${strait.tollRateGoldPerShip} Taler festgesetzt ${strait.isBlockaded ? '(BLOCKADE VERHÄNGT!)' : ''}.`,
      date: { ...this.date },
      type: 'diplomatic'
    });

    return { success: true, strait };
  }

  addEvent(event) {
    this.events.unshift(event);
    if (this.events.length > 50) this.events.pop();
  }

  getStateSnapshot() {
    return {
      date: this.date,
      tickCount: this.tickCount,
      isPaused: this.isPaused,
      speed: this.speed,
      playerNation: this.playerNation,
      nations: Object.fromEntries(this.nations),
      regions: Object.fromEntries(this.regions),
      straits: Object.fromEntries(this.straits),
      constructionQueue: this.constructionQueue,
      armies: this.armies,
      events: this.events
    };
  }

  getProvincesData() {
    return Array.from(this.provinces.values());
  }
}

const simulation = new SimulationEngine();

module.exports = {
  simulation,
  BUILDING_TYPES
};
