export interface DateState {
  year: number;
  month: number;
  day: number;
}

export interface Ruler {
  name: string;
  dynasty: string;
  age: number;
  legitimacy: number;
  traits: string[];
}

export interface Nation {
  tag: string;
  name: string;
  color: string;
  rgb: [number, number, number];
  capital: number;
  flag: string;
  provincesCount: number;
  ruler: Ruler;
  treasury: number;
  income: number;
  expenses: number;
  balance: number;
  prestige: number;
  stability: number;
  manpower: number;
  government: string;
  laws: {
    power: string;
    economy: string;
    society: string;
    military: string;
  };
  controlledRegions?: string[];
  researchPoints?: number;
  currentTech?: string;
  techProgress?: number;
  allies?: string[];
  rivals?: string[];
}

export interface Province {
  id: number;
  name: string;
  isSea: boolean;
  owner: string | null;
  controller: string | null;
  region: string | null;
  terrain: string;
  resource: string | null;
  population: number;
  satisfaction: number;
  development: number;
  defense: number;
  cx: number;
  cy: number;
  bbox: [number, number, number, number];
  points: [number, number][];
  buildings: {
    farm: number;
    market: number;
    manufactory: number;
    university: number;
    administration: number;
    barracks: number;
    fortress: number;
    port: number;
    railway: number;
    castle?: number;
  };
  subsidies: {
    agriculture: boolean;
    industry: boolean;
    university: boolean;
    infrastructure: boolean;
  };
}

export interface Region {
  id: string;
  name: string;
  color: string;
  stateRegion: string;
  provinces: number[];
  controller: string | null;
  controlBreakdown: Record<string, number>;
  bonuses: {
    taxEfficiency: number;
    productionBonus: number;
    adminCostReduction: number;
    recruitmentSpeed: number;
    supplyBonus: number;
  };
}

export interface Strait {
  id: string;
  name: string;
  type: 'strait' | 'river';
  controllingNation: string;
  provinces: number[];
  tollRateGoldPerShip: number;
  isBlockaded: boolean;
  freePassageAgreements: string[];
  description: string;
}

export interface ConstructionItem {
  id: string;
  pid: number;
  buildingType: string;
  targetLevel: number;
  progressDays: number;
  totalDays: number;
  nationTag: string;
}

export interface Army {
  id: string;
  name: string;
  nation: string;
  pid: number;
  units: {
    line_infantry?: number;
    cavalry?: number;
    artillery?: number;
  };
  morale: number;
  organization: number;
  general: string;
  isMoving: boolean;
  path?: number[];
  targetPid?: number | null;
  movementProgress?: number;
}

export interface GameEvent {
  id: string;
  title: string;
  text: string;
  date: DateState;
  type: 'diplomatic' | 'construction' | 'war' | 'historic';
}

export type MapMode = 'political' | 'terrain' | 'economy' | 'military' | 'diplomacy' | 'infrastructure';
