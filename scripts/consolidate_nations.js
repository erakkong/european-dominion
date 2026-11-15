const fs = require('fs');
const path = require('path');

const provsPath = path.join(__dirname, '../data/provinces.json');
const nationsPath = path.join(__dirname, '../data/nations.json');
const regionsPath = path.join(__dirname, '../data/regions.json');

const provs = JSON.parse(fs.readFileSync(provsPath, 'utf8'));
const nations = JSON.parse(fs.readFileSync(nationsPath, 'utf8'));
const regions = JSON.parse(fs.readFileSync(regionsPath, 'utf8'));

// 1. Ensure swi_m and sard_m exist in nations
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

let sardNation = nations.find(n => n.tag === 'sard_m');
if (!sardNation) {
  sardNation = {
    tag: 'sard_m',
    name: 'Königreich Sardinien',
    color: 'rgb(37, 99, 235)',
    rgb: [37, 99, 235],
    capital: 148,
    flag: '/assets/flags/sard_m.png',
    provincesCount: 0,
    ruler: {
      name: 'Karl Emanuel I. (Haus Savoyen)',
      dynasty: 'Haus Savoyen',
      age: 56,
      legitimacy: 85,
      traits: ['Militärreformer', 'Dynastische Politik']
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
  nations.push(sardNation);
}

// 2. Renaming
const lun = nations.find(n => n.tag === 'lun_m');
if (lun) {
  lun.name = 'Kurfürstentum Hannover';
  lun.ruler.traits.push('Haus Hannover');
}

const stet = nations.find(n => n.tag === 'stet3_m');
if (stet) {
  stet.name = 'Herzogtum Pommern';
}

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

// 3. Define province transfers
// Tag mappings
const transferMap = {
  // preußen bekommt brandenburg
  'baa_m': 'prus_m',
  // österreich bekommt böhmen und ungarn als auch tirol
  'bohe_m': 'atr_m2',
  'hun_m': 'atr_m2',
  'tyro_m': 'atr_m2',
  // vereinige die schweiz
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
  // sardinien bekommt savoyen
  'savo_m': 'sard_m',
  // spanien bekommt burgundy und neapel
  'burg_m2': 'spa3_m',
  'nap_m': 'spa3_m',
  // bayern bekommt kurpfalz
  'pala_m': 'bava_m',
  // dänemark bekommt schleswig kiel und holstein
  'scch_m': 'den_m',
  'kiel_m': 'den_m',
  'hols_m': 'den_m',
  // sachsen bekommt saxe coburg, saxe weimar und sachsen anhalt
  'cob2_m': 'sax_m',
  'weim3_m': 'sax_m',
  'anh_m': 'sax_m',
  // lippe bekommt minden
  'mind3_m': 'lipp3_m',
  // fürstentum lüneburg (hannover) bekommt verden
  'verd_m': 'lun_m',
  // großbaden bekommt offenburg
  'offe3_m': 'bade_m',
  // stettin (pommern) bekommt cammin
  'camm3_m': 'stet3_m',
  // polen litauen bekommt saporischja
  'zaph_m': 'pol2_m',
  // kirchenstaat bekommt surbino (urbino)
  'urb_m': 'papa_m2',
  // großtoskana bekommt piombino und lucca
  'piom3_m': 'tusc_m2',
  'luc_m': 'tusc_m2',
  // parma bekommt modena
  'moden_m2': 'parm_m',
  // hessen bekommt fulda und hanau
  'full3_m': 'hess_m',
  'hana3_m': 'hess_m'
};

// Explicit province specific transfers
const specificProvinceTransfers = {
  // venedig bekommt carpi (prov 166)
  166: 'ver_g',
  // sardinien bekommt sardinien insel (Sassari 2277 & Cagliari 2278)
  2277: 'sard_m',
  2278: 'sard_m'
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

// 4. Update nation province counts & filter active nations
const nationMap = new Map();
for (const n of nations) {
  n.provincesCount = provs.filter(p => p.owner === n.tag).length;
  nationMap.set(n.tag, n);
}

// Keep all active nations with > 0 provinces
const activeNations = nations.filter(n => n.provincesCount > 0);
console.log(`Active nations with territory: ${activeNations.length} (from ${nations.length})`);

// 5. Update regions control breakdown
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

// 6. Save updated datasets to all locations
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

console.log('--- Summary of Major Powers ---');
const majorTags = ['prus_m', 'atr_m2', 'swi_m', 'sard_m', 'spa3_m', 'bava_m', 'den_m', 'ver_g', 'sax_m', 'lipp3_m', 'lun_m', 'bade_m', 'stet3_m', 'pol2_m', 'papa_m2', 'tusc_m2', 'parm_m', 'hess_m'];
for (const tag of majorTags) {
  const n = activeNations.find(x => x.tag === tag);
  if (n) console.log(`${n.name} (${n.tag}): ${n.provincesCount} provinces`);
}
