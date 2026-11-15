const fs = require('fs');
const path = require('path');

const hoiPath = 'C:/Program Files (x86)/Steam/steamapps/common/Hearts of Iron IV';

function getMilitarySystemData() {
  // HOI4 inspired unit system adapted to 18th/early 19th century
  const units = {
    // Land Forces
    line_infantry: {
      id: 'line_infantry',
      name: 'Linieninfanterie',
      category: 'infantry',
      manpower: 1000,
      costGold: 120,
      costWeapons: 100,
      costCloth: 40,
      trainingDays: 45,
      combat: {
        softAttack: 18,
        hardAttack: 4,
        defense: 24,
        breakthrough: 12,
        morale: 80,
        speed: 4.0, // km/h base
        organization: 60,
        supplyConsumption: 1.0
      },
      description: 'Das Rückgrat jeder europäischen Armee. Zuverlässig in Linienformation und Salvenfeuer.'
    },
    light_infantry: {
      id: 'light_infantry',
      name: 'Leichte Infanterie (Jäger/Plänkler)',
      category: 'infantry',
      manpower: 600,
      costGold: 140,
      costWeapons: 90,
      costCloth: 30,
      trainingDays: 50,
      combat: {
        softAttack: 16,
        hardAttack: 3,
        defense: 20,
        breakthrough: 15,
        morale: 85,
        speed: 5.2,
        organization: 55,
        supplyConsumption: 0.8
      },
      terrainBonuses: {
        forest: 0.25,
        hills: 0.20,
        mountains: 0.30
      },
      description: 'Hochbewegliche Schützen, die in unwegsamem Gelände glänzen und feindliche Formationen zermürben.'
    },
    grenadiers: {
      id: 'grenadiers',
      name: 'Grenadiere (Elite-Infanterie)',
      category: 'infantry',
      manpower: 800,
      costGold: 220,
      costWeapons: 150,
      costCloth: 60,
      trainingDays: 70,
      combat: {
        softAttack: 28,
        hardAttack: 8,
        defense: 32,
        breakthrough: 25,
        morale: 100,
        speed: 4.0,
        organization: 75,
        supplyConsumption: 1.3
      },
      description: 'Furchtlose Elitetruppen für Frontalangriffe und das Halten kritischer Linien unter schwerstem Feuer.'
    },
    hussars: {
      id: 'hussars',
      name: 'Husaren (Leichte Kavallerie)',
      category: 'cavalry',
      manpower: 500,
      costGold: 180,
      costHorses: 50,
      costWeapons: 60,
      trainingDays: 40,
      combat: {
        softAttack: 20,
        hardAttack: 5,
        defense: 14,
        breakthrough: 22,
        morale: 85,
        speed: 8.5,
        organization: 50,
        supplyConsumption: 1.2
      },
      reconnaissance: 3.0,
      description: 'Schnelle Aufklärer und Plünderer. Verfolgen fliehende Feinde und schneiden Versorgungswege ab.'
    },
    dragoons: {
      id: 'dragoons',
      name: 'Dragoner (Mittlere Kavallerie)',
      category: 'cavalry',
      manpower: 600,
      costGold: 200,
      costHorses: 60,
      costWeapons: 80,
      trainingDays: 50,
      combat: {
        softAttack: 22,
        hardAttack: 6,
        defense: 20,
        breakthrough: 20,
        morale: 85,
        speed: 7.0,
        organization: 55,
        supplyConsumption: 1.4
      },
      description: 'Berittene Infanterie, die sowohl vom Pferd als auch zu Fuß kämpfen kann.'
    },
    cuirassiers: {
      id: 'cuirassiers',
      name: 'Kürassiere (Schwere Kavallerie)',
      category: 'cavalry',
      manpower: 600,
      costGold: 280,
      costHorses: 70,
      costIron: 50,
      costWeapons: 80,
      trainingDays: 65,
      combat: {
        softAttack: 32,
        hardAttack: 12,
        defense: 26,
        breakthrough: 35,
        morale: 95,
        speed: 6.5,
        organization: 65,
        supplyConsumption: 1.6
      },
      description: 'Gepanzerte Stoßtruppen zu Pferde, die durch ihre Wucht feindliche Infanterielinien zerschlagen.'
    },
    field_artillery: {
      id: 'field_artillery',
      name: 'Feldartillerie (6- und 12-Pfünder)',
      category: 'artillery',
      manpower: 300,
      costGold: 260,
      costIron: 80,
      costWeapons: 60,
      trainingDays: 60,
      combat: {
        softAttack: 40,
        hardAttack: 15,
        defense: 15,
        breakthrough: 18,
        morale: 70,
        speed: 3.2,
        organization: 40,
        supplyConsumption: 2.0
      },
      bombardment: 25,
      description: 'Mächtige Geschütze, die feindliche Reihen vor dem Infanterieangriff schwächen.'
    },
    siege_artillery: {
      id: 'siege_artillery',
      name: 'Belagerungsartillerie (Mörser & Haubitzen)',
      category: 'artillery',
      manpower: 400,
      costGold: 380,
      costIron: 140,
      costWeapons: 90,
      trainingDays: 80,
      combat: {
        softAttack: 35,
        hardAttack: 30,
        defense: 10,
        breakthrough: 12,
        morale: 65,
        speed: 2.5,
        organization: 35,
        supplyConsumption: 2.8
      },
      fortressBreaker: 0.60,
      description: 'Schwere Belagerungsgeschütze zum Knacken starker Festungswerke.'
    },
    // Naval Forces
    corvette: {
      id: 'corvette',
      name: 'Korvette / Schaluppe',
      category: 'navy',
      manpower: 120,
      costGold: 160,
      costWood: 80,
      costCloth: 40,
      trainingDays: 45,
      combat: {
        navalAttack: 12,
        navalDefense: 10,
        speed: 9.0,
        range: 600,
        organization: 50,
        supplyConsumption: 0.5
      },
      description: 'Schnelles Patrouillenschiff für Küstenschutz, Handelsaufklärung und Kurierdienste.'
    },
    frigate: {
      id: 'frigate',
      name: 'Fregatte (32 bis 44 Kanonen)',
      category: 'navy',
      manpower: 280,
      costGold: 320,
      costWood: 160,
      costCloth: 80,
      costIron: 40,
      trainingDays: 75,
      combat: {
        navalAttack: 28,
        navalDefense: 22,
        speed: 7.5,
        range: 1200,
        organization: 65,
        supplyConsumption: 1.0
      },
      description: 'Vielseitige Kriegsschiffe für Handelsstörung, Meerengen-Kontrolle und Flottenaufklärung.'
    },
    ship_of_the_line: {
      id: 'ship_of_the_line',
      name: 'Linienschiff (74 bis 100+ Kanonen)',
      category: 'navy',
      manpower: 750,
      costGold: 750,
      costWood: 380,
      costCloth: 180,
      costIron: 120,
      trainingDays: 140,
      combat: {
        navalAttack: 75,
        navalDefense: 65,
        speed: 5.0,
        range: 1000,
        organization: 80,
        supplyConsumption: 2.2
      },
      description: 'Schwimmende Festungen und Flaggschiffe, die Seeschlachten entscheiden und Häfen abriegeln.'
    },
    transport_ship: {
      id: 'transport_ship',
      name: 'Transportschiff',
      category: 'navy',
      manpower: 80,
      costGold: 120,
      costWood: 90,
      costCloth: 40,
      trainingDays: 35,
      combat: {
        navalAttack: 2,
        navalDefense: 6,
        speed: 5.5,
        range: 800,
        organization: 30,
        supplyConsumption: 0.4
      },
      transportCapacity: 1000, // Men
      description: 'Dient der seegestützten Verlegung von Landheeren über das Meer.'
    }
  };

  // HOI4 Inspired Military Doctrines
  const doctrines = [
    {
      id: 'doctrine_defensive',
      name: 'Defensive Strategie & Festungsdoktrin',
      description: 'Gekonnte Ausnutzung von Terrain, Schanzen und Befestigungen.',
      bonuses: { defense: 0.25, entrenchment: 0.35, fortDefense: 0.30, moraleLossReduction: 0.15 }
    },
    {
      id: 'doctrine_offensive',
      name: 'Offensive Stoßkraft & Bajonettangriff',
      description: 'Fokussierung auf Durchbruch, Feuerüberlegenheit und entschlossenen Angriff.',
      bonuses: { softAttack: 0.20, breakthrough: 0.30, armyMovementSpeed: 0.15 }
    },
    {
      id: 'doctrine_cavalry',
      name: 'Kavallerieüberlegenheit & Beweglicher Krieg',
      description: 'Flankenmanöver, Husarenaufklärung und vernichtende Reiterattacken.',
      bonuses: { cavalryAttack: 0.30, cavalrySpeed: 0.20, pursuitBonus: 0.40 }
    },
    {
      id: 'doctrine_artillery',
      name: 'Artilleriedoktrin & Großes Batteriefeuer',
      description: 'Konzentrierter Geschützeinsatz zur Vorbereitung von Infanterievorstößen.',
      bonuses: { artilleryAttack: 0.35, bombardmentDamage: 0.40, fortressBreachBonus: 0.25 }
    },
    {
      id: 'doctrine_logistics',
      name: 'Logistik & Magazinsystem',
      description: 'Perfektionierte Nachschubdepots, Proviantkolonnen und weniger Verschleiß.',
      bonuses: { supplyConsumption: -0.25, attritionReduction: 0.30, reinforementRate: 0.25 }
    },
    {
      id: 'doctrine_naval_supremacy',
      name: 'Maritime Vorherrschaft & Blockadedoktrin',
      description: 'Beherrschung der Hochsee, Seeblockaden und Schutz von Handelskonvois.',
      bonuses: { navalAttack: 0.25, blockadeEfficiency: 0.35, straitControlBonus: 0.30 }
    }
  ];

  // General Traits (HOI4 Style)
  const generalTraits = [
    { id: 'tactician', name: 'Brillanter Taktiker', description: '+15% Kampfkraft in allen Schlachten', bonus: { combatPower: 0.15 } },
    { id: 'defensive_expert', name: 'Verteidigungsexperte', description: '+25% Verteidigung und +30% Schanzenbau', bonus: { defense: 0.25, entrenchment: 0.30 } },
    { id: 'offensive_expert', name: 'Angriffsstratege', description: '+25% Durchbruch und Angriffskraft', bonus: { breakthrough: 0.25, softAttack: 0.15 } },
    { id: 'logistics_expert', name: 'Logistikgenie', description: '-30% Nachschubverbrauch und weniger Verschleiß', bonus: { supplyConsumption: -0.30, attrition: -0.25 } },
    { id: 'cavalry_master', name: 'Kavalleriemeister', description: '+25% Kampfkraft für Kavallerieeinheiten', bonus: { cavalryCombat: 0.25 } },
    { id: 'artillery_expert', name: 'Meister der Artillerie', description: '+30% Schaden durch Kanonen und Belagerungen', bonus: { artilleryCombat: 0.30 } },
    { id: 'siege_master', name: 'Festungsbrecher', description: '+50% schnellere Einnahme feindlicher Festungen', bonus: { siegeSpeed: 0.50 } }
  ];

  return { units, doctrines, generalTraits };
}

module.exports = { getMilitarySystemData };
