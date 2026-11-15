const fs = require('fs');
const path = require('path');

const provsPath = path.join(__dirname, '../data/provinces.json');
const nationsPath = path.join(__dirname, '../data/nations.json');
const regionsPath = path.join(__dirname, '../data/regions.json');

const provs = JSON.parse(fs.readFileSync(provsPath, 'utf8'));
const nations = JSON.parse(fs.readFileSync(nationsPath, 'utf8'));
const regions = JSON.parse(fs.readFileSync(regionsPath, 'utf8'));

// 1. Ensure Switzerland (swi_m) exists
let swiNation = nations.find(n => n.tag === 'swi_m');
if (!swiNation) {
  swiNation = {
    tag: 'swi_m',
    name: 'Schweizer Eidgenossenschaft',
    color: 'rgb(220, 38, 38)',
    rgb: [220, 38, 38],
    capital: 310,
    flag: '/assets/flags/swi_m.png',
    provincesCount: 0,
    ruler: {
      name: 'Tagsatzung der Eidgenossenschaft',
      dynasty: 'Alte Eidgenossenschaft',
      age: 45,
      legitimacy: 90,
      traits: ['Wehrhaft', 'Neutralität', 'Ständebund']
    },
    treasury: 5500,
    income: 0,
    expenses: 0,
    balance: 0,
    prestige: 75,
    stability: 88,
    manpower: 36000,
    government: 'Republik',
    laws: {
      power: 'Ständeversammlung',
      economy: 'Freier Handel',
      society: 'Bürgerrechte',
      military: 'Wehrpflicht'
    }
  };
  nations.push(swiNation);
}

// 2. Ensure Savoy (savo_m) exists with historical accuracy
let savoNation = nations.find(n => n.tag === 'savo_m');
if (!savoNation) {
  savoNation = {
    tag: 'savo_m',
    name: 'Herzogtum Savoyen',
    color: 'rgb(37, 99, 235)',
    rgb: [37, 99, 235],
    capital: 148, // Turin
    flag: '/assets/flags/savo_m.png',
    provincesCount: 0,
    ruler: {
      name: 'Karl Emanuel I. (Haus Savoyen)',
      dynasty: 'Haus Savoyen',
      age: 56,
      legitimacy: 85,
      traits: ['Der Große Herzog von Savoyen', 'Dynastische Politik', 'Militärreformer']
    },
    treasury: 4800,
    income: 0,
    expenses: 0,
    balance: 0,
    prestige: 86,
    stability: 82,
    manpower: 29000,
    government: 'Absolute Monarchie',
    laws: {
      power: 'Absolutismus',
      economy: 'Merkantilismus',
      society: 'Adelsprivilegien',
      military: 'Berufsheer'
    }
  };
  nations.push(savoNation);
} else {
  savoNation.name = 'Herzogtum Savoyen';
  savoNation.capital = 148;
  savoNation.flag = '/assets/flags/savo_m.png';
  savoNation.ruler = {
    name: 'Karl Emanuel I. (Haus Savoyen)',
    dynasty: 'Haus Savoyen',
    age: 56,
    legitimacy: 85,
    traits: ['Der Große Herzog von Savoyen', 'Dynastische Politik', 'Militärreformer']
  };
}

// 3. Name adjustments
// Lüneburg: bennene lüneburg wieder zu lüneburg
const lun = nations.find(n => n.tag === 'lun_m');
if (lun) {
  lun.name = 'Fürstentum Lüneburg';
}

// Wolfenbüttel name
const wlf = nations.find(n => n.tag === 'buff3_m');
if (wlf) {
  wlf.name = 'Fürstentum Braunschweig-Wolfenbüttel';
}

// Prussia
const prus = nations.find(n => n.tag === 'prus_m');
if (prus) {
  prus.capital = 592; // Berlin
  prus.name = 'Brandenburg-Preußen';
  prus.ruler = {
    name: 'Johann Sigismund (Hohenzollern)',
    dynasty: 'Hohenzollern',
    age: 46,
    legitimacy: 85,
    traits: ['Kurfürst von Brandenburg', 'Herzog von Preußen']
  };
}

// 4. Define province transfers
const transferMap = {
  // Preußen bekommt Brandenburg & ganz Stettin
  'baa_m': 'prus_m',
  'stet3_m': 'prus_m',
  'camm3_m': 'prus_m',

  // Österreich bekommt Böhmen, Ungarn, Tirol & Trent
  'bohe_m': 'atr_m2',
  'hun_m': 'atr_m2',
  'tyro_m': 'atr_m2',
  'tre_m': 'atr_m2',

  // Vereinige die Schweiz (inkl. Winterthur)
  'bern_m': 'swi_m',
  'zuri3_m': 'swi_m',
  'base3_m': 'swi_m',
  'uri3_m': 'swi_m',
  'luze_m': 'swi_m',
  'frib3_m': 'swi_m',
  'gris3_m': 'swi_m',
  'gall3_m': 'swi_m',
  'zug3_m': 'swi_m',
  'sff3_m': 'swi_m',
  'vala3_m': 'swi_m',
  'chur3_m': 'swi_m',
  'neuh3_m': 'swi_m',
  'schw_m': 'swi_m',
  'thar3_m': 'swi_m', // Winterthur

  // Savoyen bekommt ganz Sardinien, Montferrat und Nizza
  'sard_m': 'savo_m',
  'mof_m': 'savo_m',
  'nice_m': 'savo_m',

  // Spanien bekommt Burgundy und Neapel
  'burg_m2': 'spa3_m',
  'besa3_m': 'spa3_m',
  'nap_m': 'spa3_m',

  // Bayern bekommt Kurpfalz, Bayreuth, Passau und Berchtesgaden
  'pala_m': 'bava_m',
  'beyr3_m': 'bava_m',
  'pasc3_m': 'bava_m',
  'berh3_m': 'bava_m',

  // Dänemark bekommt Schleswig, Kiel und Holstein
  'scch_m': 'den_m',
  'kiel_m': 'den_m',
  'hols_m': 'den_m',

  // Schweden bekommt Wolgast und Bremen
  'wolg3_m': 'swe2_m',
  'bre_m': 'swe2_m',

  // Sachsen bekommt Saxe-Coburg, Saxe-Weimar, Sachsen-Anhalt, Eisenach und Schwarzburg
  'cob2_m': 'sax_m',
  'weim3_m': 'sax_m',
  'anh_m': 'sax_m',
  'eis2_m': 'sax_m',
  'schw3_m': 'sax_m',

  // Wolfenbüttel bekommt Mansfeld
  'mans3_m': 'buff3_m',

  // Münster bekommt Bentheim
  'bent3_m': 'mus_m',

  // Parma bekommt Modena und Massa
  'moden_m2': 'parm_m',
  'masx3_m': 'parm_m',

  // Lippe bekommt Minden
  'mind3_m': 'lipp3_m',

  // Lüneburg bekommt Verden
  'verd_m': 'lun_m',

  // GroßBaden bekommt Offenburg und Rottweil
  'offe3_m': 'bade_m',
  'rott3_m': 'bade_m',

  // Württemberg bekommt Biberach
  'wad3_m': 'wurt_m',

  // Polen-Litauen bekommt Saporischja
  'zaph_m': 'pol2_m',

  // Kirchenstaat bekommt Urbino
  'urb_m': 'papa_m2',

  // Toskana bekommt Piombino und Lucca
  'piom3_m': 'tusc_m2',
  'luc_m': 'tusc_m2',

  // Hessen bekommt Fulda und Hanau
  'full3_m': 'hess_m',
  'hana3_m': 'hess_m',

  // Osmanisches Reich bekommt Samtskhe, Mingrelien und Imeretien sowie Krim, Natukhai und Guria
  'samt_m': 'tur_m',
  'min_m': 'tur_m',
  'imer_m': 'tur_m',
  'crkh_m2': 'tur_m',
  'nata3_m': 'tur_m',
  'gur3_m': 'tur_m',

  // Bayern bekommt Speyer
  'spex3_m': 'bava_m',

  // Österreich bekommt Cieszyn
  'cies3_m': 'atr_m2',

  // Nassau bekommt Tecklenburg
  'teck3_m': 'nass_m'
};

// Explicit province specific transfers
const specificProvinceTransfers = {
  // Gizab an Persien
  5842: 'ira_m2',
  // Speyer an Bayern
  782: 'bava_m',
  // Cieszyn an Österreich
  3705: 'atr_m2',
  // Guria (Lanchkhuti) an das Osmanische Reich
  1214: 'tur_m',
  // Tecklenburg / Lingen an Nassau
  616: 'nass_m',
  // Venedig bekommt Carpi (prov 166)
  166: 'ver_g',
  // Savoyen bekommt die gesamte Insel Sardinien
  2275: 'savo_m', // Carbonia
  2276: 'savo_m', // Olbia
  2277: 'savo_m', // Sassari
  2278: 'savo_m', // Cagliari
  2279: 'savo_m', // Oristano
  2280: 'savo_m', // Nuoro
  2281: 'savo_m', // Tortoli
  3013: 'savo_m', // Macomer
  3014: 'savo_m', // Laconi
  6892: 'savo_m', // Budoni
  // Winterthur (6879) an die Schweiz
  6879: 'swi_m',
  // Massa (154) an Parma
  154: 'parm_m',
  // Mansfeld (754) an Wolfenbüttel
  754: 'buff3_m',
  // Eisenach (755) & Schwarzburg (750) an Sachsen
  755: 'sax_m',
  750: 'sax_m',
  // Bayreuth (6916), Passau (719) & Berchtesgaden (715) an Bayern
  6916: 'bava_m',
  719: 'bava_m',
  715: 'bava_m',
  // Rottweil (764) an Baden
  764: 'bade_m',
  // Biberach (6601) an Württemberg
  6601: 'wurt_m'
};

// Execute province updates
let transferCount = 0;
for (const p of provs) {
  if (specificProvinceTransfers[p.id]) {
    p.owner = specificProvinceTransfers[p.id];
    p.controller = specificProvinceTransfers[p.id];
    transferCount++;
  } else if (p.owner && transferMap[p.owner]) {
    p.owner = transferMap[p.owner];
    p.controller = transferMap[p.owner];
    transferCount++;
  }
}
console.log(`Transferred ${transferCount} provinces across all rules.`);

// 5. Update nation province counts & filter active nations
const nationMap = new Map();
for (const n of nations) {
  n.provincesCount = provs.filter(p => p.owner === n.tag).length;
  nationMap.set(n.tag, n);
}

// Keep all active nations with > 0 provinces
const activeNations = nations.filter(n => n.provincesCount > 0);
console.log(`Active nations with territory: ${activeNations.length} (from ${nations.length})`);

// 6. Update regions control breakdown
for (const [rId, reg] of Object.entries(regions)) {
  const breakdown = {};
  let total = 0;
  if (reg.provinces) {
    for (const pid of reg.provinces) {
      const p = provs.find(pr => pr.id === pid);
      if (p && p.owner) {
        breakdown[p.owner] = (breakdown[p.owner] || 0) + 1;
        total++;
      }
    }
  }
  const pctBreakdown = {};
  let controller = null;
  for (const [tag, count] of Object.entries(breakdown)) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    pctBreakdown[tag] = pct;
    if (pct === 100) controller = tag;
  }
  reg.controlBreakdown = pctBreakdown;
  reg.controller = controller;
}

// 7. Save updated datasets to all locations
const targets = [
  { p: provsPath, data: provs },
  { p: nationsPath, data: activeNations },
  { p: regionsPath, data: regions },
  { p: path.join(__dirname, '../client/public/data/provinces.json'), data: provs },
  { p: path.join(__dirname, '../client/public/data/nations.json'), data: activeNations },
  { p: path.join(__dirname, '../client/public/data/regions.json'), data: regions },
  { p: path.join(__dirname, '../client/dist/data/provinces.json'), data: provs },
  { p: path.join(__dirname, '../client/dist/data/nations.json'), data: activeNations },
  { p: path.join(__dirname, '../client/dist/data/regions.json'), data: regions }
];

for (const t of targets) {
  if (fs.existsSync(path.dirname(t.p))) {
    fs.writeFileSync(t.p, JSON.stringify(t.data, null, 2), 'utf8');
    console.log(`Updated ${path.basename(t.p)} in ${path.dirname(t.p)}`);
  }
}

// Copy 1830 Sardinia/Savoy flag if available
const flagSource = path.join(__dirname, 'assets/sardinia_1830.png');
if (fs.existsSync(flagSource)) {
  const flagDestinations = [
    path.join(__dirname, '../client/public/assets/flags/savo_m.png'),
    path.join(__dirname, '../client/dist/assets/flags/savo_m.png'),
    path.join(__dirname, '../client/public/assets/flags/sard_m.png'),
    path.join(__dirname, '../client/dist/assets/flags/sard_m.png')
  ];
  for (const dst of flagDestinations) {
    if (fs.existsSync(path.dirname(dst))) {
      fs.copyFileSync(flagSource, dst);
      console.log(`Updated flag: ${dst}`);
    }
  }
}

console.log('--- Summary of Major Powers ---');
const majorTags = ['prus_m', 'atr_m2', 'swi_m', 'savo_m', 'spa3_m', 'bava_m', 'den_m', 'swe2_m', 'tur_m', 'sax_m', 'buff3_m', 'mus_m', 'parm_m', 'bade_m', 'wurt_m', 'lun_m', 'pol2_m', 'egyo_m', 'trip_m'];
for (const tag of majorTags) {
  const n = activeNations.find(x => x.tag === tag);
  if (n) console.log(`${n.name} (${n.tag}): ${n.provincesCount} provinces`);
}
