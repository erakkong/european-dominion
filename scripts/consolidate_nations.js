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

// 2b. Restore liberated Caucasian nations
const liberatedNationDefs = [
  {
    tag: 'samt_m',
    name: 'Samtskhe',
    color: 'rgb(231, 227, 218)',
    rgb: [231, 227, 218],
    capital: 12169,
    flag: '/assets/flags/samt_m.png',
    provincesCount: 9,
    ruler: { name: 'Herrscher von Samtskhe', dynasty: 'Haus Samtskhe', age: 38, legitimacy: 80, traits: ['Reichsstand'] },
    treasury: 2460, income: 0, expenses: 0, balance: 0, prestige: 68, stability: 80, manpower: 14300,
    government: 'Absolute Monarchie', laws: { power: 'Absolutismus', economy: 'Merkantilismus', society: 'Adelsprivilegien', military: 'Söldnerheer' }
  },
  {
    tag: 'min_m',
    name: 'Mingrelien',
    color: 'rgb(84, 140, 195)',
    rgb: [84, 140, 195],
    capital: 1162,
    flag: '/assets/flags/min_m.png',
    provincesCount: 3,
    ruler: { name: 'Herrscher von Mingrelien', dynasty: 'Haus Mingrelien', age: 38, legitimacy: 80, traits: ['Reichsstand'] },
    treasury: 1620, income: 0, expenses: 0, balance: 0, prestige: 56, stability: 80, manpower: 10100,
    government: 'Absolute Monarchie', laws: { power: 'Absolutismus', economy: 'Merkantilismus', society: 'Adelsprivilegien', military: 'Söldnerheer' }
  },
  {
    tag: 'imer_m',
    name: 'Imeretien',
    color: 'rgb(9, 54, 107)',
    rgb: [9, 54, 107],
    capital: 4904,
    flag: '/assets/flags/imer_m.png',
    provincesCount: 4,
    ruler: { name: 'Herrscher von Imeretien', dynasty: 'Haus Imeretien', age: 38, legitimacy: 80, traits: ['Reichsstand'] },
    treasury: 1760, income: 0, expenses: 0, balance: 0, prestige: 58, stability: 80, manpower: 10800,
    government: 'Absolute Monarchie', laws: { power: 'Absolutismus', economy: 'Merkantilismus', society: 'Adelsprivilegien', military: 'Söldnerheer' }
  },
  {
    tag: 'nata3_m',
    name: 'Natukhai',
    color: 'rgb(24, 138, 26)',
    rgb: [24, 138, 26],
    capital: 10814,
    flag: '/assets/flags/nata3_m.png',
    provincesCount: 1,
    ruler: { name: 'Herrscher von Natukhai', dynasty: 'Haus Natukhai', age: 38, legitimacy: 80, traits: ['Reichsstand'] },
    treasury: 1340, income: 0, expenses: 0, balance: 0, prestige: 52, stability: 80, manpower: 8700,
    government: 'Absolute Monarchie', laws: { power: 'Absolutismus', economy: 'Merkantilismus', society: 'Adelsprivilegien', military: 'Söldnerheer' }
  },
  {
    tag: 'gur3_m',
    name: 'Guria',
    color: 'rgb(218, 226, 85)',
    rgb: [218, 226, 85],
    capital: 1214,
    flag: '/assets/flags/gur3_m.png',
    provincesCount: 1,
    ruler: { name: 'Herrscher von Guria', dynasty: 'Haus Guria', age: 38, legitimacy: 80, traits: ['Reichsstand'] },
    treasury: 1340, income: 0, expenses: 0, balance: 0, prestige: 52, stability: 80, manpower: 8700,
    government: 'Absolute Monarchie', laws: { power: 'Absolutismus', economy: 'Merkantilismus', society: 'Adelsprivilegien', military: 'Söldnerheer' }
  }
];

for (const natDef of liberatedNationDefs) {
  if (!nations.find(n => n.tag === natDef.tag)) {
    nations.push(natDef);
  }
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

  // Osmanisches Reich behält Krim und bekommt Siebenbürgen, Wallachei und Moldau
  'crkh_m2': 'tur_m',
  'trass_m': 'tur_m',
  'wala_m': 'tur_m',
  'mo_m2': 'tur_m',

  // Bayern bekommt Speyer, Kempten und Worms
  'spex3_m': 'bava_m',
  'kemp3_m': 'bava_m',
  'worm_m': 'bava_m',

  // Österreich bekommt Cieszyn
  'cies3_m': 'atr_m2',

  // Nassau bekommt Tecklenburg und Sayn
  'teck3_m': 'nass_m',
  'sayn3_m': 'nass_m',

  // Württemberg bekommt Ravensburg
  'rav_m': 'wurt_m',

  // Münster bekommt Osnabrück
  'osna3_m': 'mus_m',

  // Lüttich bekommt Aachen
  'aac_m': 'lie_m',

  // Österreich bekommt Bregenz
  'bre3_m': 'atr_m2',

  // Hessen bekommt Waldeck
  'wald3_m': 'hess_m'
};

// Explicit province specific transfers
const specificProvinceTransfers = {
  // Bregenz / Oberstdorf zu Österreich
  7373: 'atr_m2',
  388: 'atr_m2',
  // Waldeck zu Hessen
  735: 'hess_m',
  // Befreite Länder (Kaukasus): Samtskhe, Mingrelien, Imeretien, Natukhai, Guria
  // Samtskhe
  1091: 'samt_m',
  1092: 'samt_m',
  1093: 'samt_m',
  1163: 'samt_m',
  1164: 'samt_m',
  1199: 'samt_m',
  1200: 'samt_m',
  10445: 'samt_m',
  12169: 'samt_m',
  // Mingrelien
  1162: 'min_m',
  7262: 'min_m',
  11519: 'min_m',
  // Imeretien
  1215: 'imer_m',
  4904: 'imer_m',
  10446: 'imer_m',
  12168: 'imer_m',
  // Natukhai
  10814: 'nata3_m',
  // Guria
  1214: 'gur3_m',

  // Ravensburg zu Württemberg
  7308: 'wurt_m',
  // Kempten zu Bayern
  711: 'bava_m',
  // Sayn zu Nassau
  776: 'nass_m',
  // Osnabrück zu Münster
  619: 'mus_m',
  7276: 'mus_m',
  // Lüttich bekommt Aachen und Namur
  558: 'lie_m',
  387: 'lie_m',
  // Worms zu Bayern
  7269: 'bava_m',

  // Gizab an Persien
  5842: 'ira_m2',
  // Speyer an Bayern
  782: 'bava_m',
  // Cieszyn an Österreich
  3705: 'atr_m2',
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

// 4b. Fix blocky / square island & microstate geometries (e.g. Monaco, Malta, Ibiza, etc.)
const enhancedGeometries = {
  // 1. Monaco (134): Natural Riviera coastline with Le Rocher promontory & Port Hercule
  134: [
    [2089, 2618], [2091, 2615], [2092, 2613], [2093, 2612], [2096, 2611], [2098, 2613], [2099, 2615], [2103, 2615],
    [2102, 2616], [2100, 2617], [2098, 2618], [2096, 2619], [2095, 2620],
    [2094, 2621], [2093, 2622], [2092, 2622], [2091, 2621], [2090, 2620],
    [2089, 2619]
  ],
  // 2. Valletta / Malta & Gozo (270): Authentic NW-to-SE Mediterranean archipelago
  270: [
    [2417, 3103], [2420, 3101], [2424, 3102], [2426, 3105], [2423, 3108], [2419, 3107],
    [2426, 3110], [2428, 3108], [2432, 3109],
    [2436, 3112], [2440, 3114], [2443, 3118], [2447, 3121], [2451, 3125],
    [2452, 3128], [2449, 3131], [2445, 3130],
    [2440, 3128], [2436, 3124], [2432, 3120], [2429, 3116], [2425, 3113],
    [2421, 3110], [2416, 3106]
  ],
  // 3. Ibiza & Formentera (2274): Authentic Balearic island geometry
  2274: [
    [1806, 2917], [1810, 2920], [1813, 2924],
    [1815, 2928], [1817, 2933], [1814, 2937],
    [1812, 2941], [1811, 2945], [1808, 2948], [1805, 2948], [1803, 2945], [1804, 2941],
    [1801, 2938], [1796, 2935], [1792, 2931],
    [1791, 2928], [1794, 2924], [1798, 2921], [1802, 2918]
  ],
  // 4. St Helier / Jersey (258): Authentic Channel Island shape
  258: [
    [1623, 2221], [1628, 2220], [1634, 2221], [1638, 2224],
    [1640, 2228], [1639, 2232],
    [1636, 2236], [1632, 2238], [1627, 2239], [1623, 2237],
    [1619, 2234], [1618, 2229], [1620, 2225]
  ],
  // 5. Les Martins / Guernsey (259): Authentic triangular Channel Island shape
  259: [
    [1611, 2202], [1615, 2205],
    [1617, 2209], [1616, 2213],
    [1613, 2217], [1609, 2219], [1604, 2218],
    [1599, 2216], [1597, 2212], [1598, 2207], [1603, 2204], [1607, 2202]
  ],
  // 6. Pantelleria (4693): Authentic elliptical Mediterranean volcanic island
  4693: [
    [2313, 3051], [2318, 3051], [2322, 3054],
    [2326, 3058], [2329, 3063], [2327, 3067],
    [2324, 3071], [2319, 3073], [2315, 3072],
    [2310, 3068], [2307, 3063], [2308, 3057], [2310, 3053]
  ],
  // 7. Mesta / Chios (3218): Authentic indented Greek Aegean island
  3218: [
    [2989, 2947], [2995, 2946], [3002, 2948], [3007, 2953],
    [3010, 2959], [3011, 2966], [3007, 2971],
    [3004, 2976], [2998, 2979], [2992, 2979],
    [2985, 2977], [2979, 2973], [2976, 2967],
    [2978, 2961], [2982, 2956], [2985, 2951]
  ],
  // 8. Gibraltar (85): Authentic tapered Rock of Gibraltar pointing south
  85: [
    [1471, 3093], [1474, 3092], [1477, 3093],
    [1479, 3095], [1478, 3098], [1476, 3101],
    [1474, 3102], [1473, 3102],
    [1471, 3100], [1469, 3097], [1470, 3094]
  ],
  // 9. Ceuta (10021): Tapered peninsula of Almina into Mediterranean
  10021: [
    [1470, 3103], [1472, 3102], [1474, 3102],
    [1478, 3103], [1483, 3104], [1488, 3106],
    [1494, 3108], [1495, 3110], [1492, 3112],
    [1486, 3112], [1480, 3111], [1475, 3110], [1472, 3107], [1471, 3104]
  ],
  // 10. Melilla (10023): Curved Cape Tres Forcas coastal headland
  10023: [
    [1589, 3130], [1593, 3128], [1597, 3129],
    [1602, 3131], [1606, 3134], [1608, 3137],
    [1607, 3141], [1603, 3143], [1598, 3144],
    [1593, 3142], [1589, 3139], [1588, 3135]
  ],
  // 11. Santa Cruz das Flores / Azores (11390): Organic volcanic Atlantic island
  11390: [
    [214, 2871], [221, 2870], [227, 2873],
    [233, 2878], [235, 2886], [234, 2895],
    [231, 2905], [226, 2913], [220, 2915], [214, 2912],
    [206, 2904], [200, 2894], [198, 2884], [202, 2877], [207, 2873]
  ]
};

for (const [idStr, newPts] of Object.entries(enhancedGeometries)) {
  const pid = Number(idStr);
  const p = provs.find(x => x.id === pid);
  if (p) {
    p.points = newPts;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    let sumX = 0, sumY = 0;
    for (const [x, y] of newPts) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      sumX += x;
      sumY += y;
    }
    p.bbox = [minX, minY, maxX, maxY];
    p.cx = Math.round(sumX / newPts.length);
    p.cy = Math.round(sumY / newPts.length);
    console.log(`Updated realistic geometry for province #${pid} (${p.name}): ${newPts.length} points.`);
  }
}

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
