const fs = require('fs');
const path = require('path');
const { parseVictoriaStateRegions } = require('./parse_vic3');
const { getMilitarySystemData } = require('./parse_hoi4');
const { parseRelaxedJson } = require('./utils');

const aoh3 = 'C:/Program Files (x86)/Steam/steamapps/common/Age of History 3';
const outDataDir = path.join(__dirname, '../data');
const outClientAssets = path.join(__dirname, '../client/public/assets');

if (!fs.existsSync(outDataDir)) fs.mkdirSync(outDataDir, { recursive: true });
if (!fs.existsSync(outClientAssets)) fs.mkdirSync(outClientAssets, { recursive: true });

const flagsDir = path.join(outClientAssets, 'flags');
const audioDir = path.join(outClientAssets, 'audio');
const iconsDir = path.join(outClientAssets, 'icons');
if (!fs.existsSync(flagsDir)) fs.mkdirSync(flagsDir, { recursive: true });
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

console.log('=== RUNNING IMPORTER FOR 1618 SCENARIO & EXPANDED NORTHERN MAP ===');

// 1. Load Province Details & Cities
console.log('1. Loading AoH3 province details and cities...');
const rawDetails = fs.readFileSync(path.join(aoh3, 'map/Earth3/data/ProvinceDetails.json'), 'utf8');
const pdetails = eval('(' + rawDetails + ')');

const rawCities = fs.readFileSync(path.join(aoh3, 'map/Earth3/cities/cities.json'), 'utf8');
const cities = eval('(' + rawCities + ')');
const cityMap = new Map();
for (const c of cities) {
  if (c.p !== undefined && !cityMap.has(c.p)) {
    cityMap.set(c.p, c.Name);
  }
}

// 2. Load Terrain Types & Resources
console.log('2. Loading terrain types and resources...');
const rawTerrain = fs.readFileSync(path.join(aoh3, 'game/terrain/TerrainTypes.json'), 'utf8');
const terrainJson = parseRelaxedJson(rawTerrain);
const terrainTypes = terrainJson.Data || [];

const rawRes = fs.readFileSync(path.join(aoh3, 'game/resources/Resources.json'), 'utf8');
const resJson = parseRelaxedJson(rawRes);
const resourceList = resJson.Resources || [];

// 3. Load 1618_Thirty Scenario Civs & Ownership
console.log('3. Loading 1618_Thirty scenario (Dreißigjähriger Krieg)...');
const p1618 = path.join(aoh3, 'map/Earth3/scenarios/1618_Thirty');
const civs = eval('(' + fs.readFileSync(path.join(p1618, 'Data.json'), 'utf8') + ')');
const provsByCiv = eval('(' + fs.readFileSync(path.join(p1618, 'DataProvinces.json'), 'utf8') + ')');

const provOwnerMap = new Map();
for (let cIdx = 0; cIdx < civs.length; cIdx++) {
  const c = civs[cIdx];
  const list = provsByCiv[cIdx] ? provsByCiv[cIdx].Provinces : [];
  for (const pid of list) {
    provOwnerMap.set(pid, c.CivTAG);
  }
}
console.log(`Mapped 1618 province ownership across ${provOwnerMap.size} provinces.`);

// 4. Load Localization for Country Names
console.log('4. Loading civilization localization...');
const bundleDe = fs.readFileSync(path.join(aoh3, 'game/languages/civilizations/Bundle_de.properties'), 'utf8');
const bundleEn = fs.readFileSync(path.join(aoh3, 'game/languages/civilizations/Bundle.properties'), 'utf8');

function getCivName(tag) {
  const baseTag = tag.replace(/_[a-z0-9]+$/, '');
  const baseTagNoNum = baseTag.replace(/[0-9]+$/, '');
  
  const tagsToTry = [tag, baseTag, baseTagNoNum];
  for (const t of tagsToTry) {
    const mDe = bundleDe.match(new RegExp('^' + t + '\\s*=\\s*(.*)$', 'm'));
    if (mDe && mDe[1].trim()) return mDe[1].trim();
  }
  for (const t of tagsToTry) {
    const mEn = bundleEn.match(new RegExp('^' + t + '\\s*=\\s*(.*)$', 'm'));
    if (mEn && mEn[1].trim()) return mEn[1].trim();
  }
  
  // Historical clean fallbacks
  if (tag.startsWith('swe')) return 'Schweden';
  if (tag.startsWith('rus')) return 'Zarentum Russland';
  if (tag.startsWith('fra')) return 'Frankreich';
  if (tag.startsWith('spa')) return 'Spanien';
  if (tag.startsWith('pol')) return 'Polen-Litauen';
  if (tag.startsWith('den')) return 'Dänemark-Norwegen';
  if (tag.startsWith('baa')) return 'Kurfürstentum Brandenburg';
  if (tag.startsWith('bohe')) return 'Königreich Böhmen';
  if (tag.startsWith('atr')) return 'Erzherzogtum Österreich';
  if (tag.startsWith('engk')) return 'Königreich England';
  if (tag.startsWith('sco')) return 'Königreich Schottland';
  if (tag.startsWith('net')) return 'Vereinigte Niederlande';
  if (tag.startsWith('tur')) return 'Osmanisches Reich';
  if (tag.startsWith('bava')) return 'Herzogtum Bayern';
  if (tag.startsWith('sax')) return 'Kurfürstentum Sachsen';
  if (tag.startsWith('pal') || tag.startsWith('pfa')) return 'Kurpfalz';
  
  return tag;
}

// 5. Read Victoria 3 State Regions
console.log('5. Loading Victoria 3 state regions...');
const vic3Regions = parseVictoriaStateRegions();

// 6. Read All Province Polygons
console.log('6. Loading all province boundary polygons from AoH3 Earth3...');
const ppDir = path.join(aoh3, 'map/Earth3/data/ProvincePoints');
const allPolygons = [];

for (let i = 0; i <= 27; i++) {
  const fName = i === 0 ? 'ProvincePoints.json' : `ProvincePoints_${i}.json`;
  const raw = fs.readFileSync(path.join(ppDir, fName), 'utf8');
  const pxMatches = [...raw.matchAll(/pX\s*:\s*\[([^\]]+)\]/g)];
  const pyMatches = [...raw.matchAll(/pY\s*:\s*\[([^\]]+)\]/g)];

  for (let j = 0; j < pxMatches.length; j++) {
    const px = pxMatches[j][1].split(',').map(Number);
    const py = pyMatches[j][1].split(',').map(Number);
    allPolygons.push({ px, py });
  }
}
console.log(`Loaded ${allPolygons.length} province polygons.`);

// 7. Filter European & Anatolian Provinces (EXPANDED TO NORTH: cy >= 80)
console.log('7. Filtering European & Anatolian provinces with EXPANDED NORTHERN BOUNDS...');
const europeanProvinces = [];
let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

for (let pid = 0; pid < pdetails.length; pid++) {
  const p = pdetails[pid];
  const poly = allPolygons[pid];
  if (!poly || poly.px.length === 0) continue;

  let sumX = 0, sumY = 0;
  let pMinX = Infinity, pMaxX = -Infinity, pMinY = Infinity, pMaxY = -Infinity;
  const n = poly.px.length;
  for (let k = 0; k < n; k++) {
    const x = poly.px[k];
    const y = poly.py[k];
    sumX += x;
    sumY += y;
    if (x < pMinX) pMinX = x;
    if (x > pMaxX) pMaxX = x;
    if (y < pMinY) pMinY = y;
    if (y > pMaxY) pMaxY = y;
  }
  const cx = Math.round(sumX / n);
  const cy = Math.round(sumY / n);

  // EXPANDED NORTHERN BOUNDS:
  // cy >= 80 encompasses Nordkap, Hammerfest, Tromsø, Alta, Kiruna, Lapland, Murmansk, Kola, Barents Sea, White Sea!
  // cx: 6800 to 11800 encompasses Iceland to Urals/Caspian.
  const inTheaterCoords = (cx >= 6800 && cx <= 11800 && cy >= 80 && cy <= 3250);
  const isEuropeContinent = (p.co === 2);
  const isOttomanOrCaucasus = (p.co === 1 && cx >= 9500 && cx <= 11600 && cy >= 2250 && cy <= 3200);
  const isNorthAfricaCoastal = (p.co === 6 && cx >= 7800 && cx <= 10400 && cy >= 2900 && cy <= 3250);
  const isSeaInBounds = (p.tr === 0 && inTheaterCoords);

  if (inTheaterCoords && (isEuropeContinent || isOttomanOrCaucasus || isNorthAfricaCoastal || isSeaInBounds)) {
    if (pMinX < minX) minX = pMinX;
    if (pMaxX > maxX) maxX = pMaxX;
    if (pMinY < minY) minY = pMinY;
    if (pMaxY > maxY) maxY = pMaxY;

    europeanProvinces.push({
      pid,
      co: p.co,
      tr: p.tr,
      rs: p.rs,
      gr: p.gr,
      bd: p.bd,
      cx,
      cy,
      pMinX,
      pMaxX,
      pMinY,
      pMaxY,
      poly
    });
  }
}

console.log(`Matched ${europeanProvinces.length} provinces in expanded theater.`);
console.log(`New Bounding Box: X [${minX}, ${maxX}] (w: ${maxX - minX}), Y [${minY}, ${maxY}] (h: ${maxY - minY})`);

// 8. Transform & Normalize coordinates
const PADDING = 60;
const originX = minX - PADDING;
const originY = minY - PADDING;
const totalWidth = (maxX - minX) + PADDING * 2;
const totalHeight = (maxY - minY) + PADDING * 2;

console.log(`Normalized map canvas size: ${totalWidth} x ${totalHeight}`);

// 9. Assign Region & Create Province Data
console.log('8. Assigning large historical regions...');

const REGIONS = {
  // Scandinavia & North
  'nordnorwegen_lapland': { id: 'nordnorwegen_lapland', name: 'Nordnorwegen & Lappland', color: '#1e40af', stateRegion: 'STATE_NORTHERN_NORWAY' },
  'finnland_kola': { id: 'finnland_kola', name: 'Finnland & Kola', color: '#1d4ed8', stateRegion: 'STATE_FINLAND' },
  'svealand_scania': { id: 'svealand_scania', name: 'Svealand & Götaland', color: '#2563eb', stateRegion: 'STATE_SVEALAND' },
  'norwegen': { id: 'norwegen', name: 'Norwegen (Oslo & Bergen)', color: '#3b82f6', stateRegion: 'STATE_EASTERN_NORWAY' },
  'daenemark': { id: 'daenemark', name: 'Dänemark & Schleswig', color: '#dc2626', stateRegion: 'STATE_ZEALAND' },
  'baltikum': { id: 'baltikum', name: 'Livland & Kurland', color: '#475569', stateRegion: 'STATE_LIVONIA' },

  // Germany & HRE in 1618
  'brandenburg': { id: 'brandenburg', name: 'Kurfürstentum Brandenburg', color: '#4a6572', stateRegion: 'STATE_BRANDENBURG' },
  'schlesien': { id: 'schlesien', name: 'Schlesien', color: '#557a95', stateRegion: 'STATE_SILESIA' },
  'ostpreussen': { id: 'ostpreussen', name: 'Herzogtum Preußen', color: '#334e68', stateRegion: 'STATE_EAST_PRUSSIA' },
  'pommern': { id: 'pommern', name: 'Pommern', color: '#627d98', stateRegion: 'STATE_POMERANIA' },
  'rheinland_pfalz': { id: 'rheinland_pfalz', name: 'Rheinland & Kurpfalz', color: '#486581', stateRegion: 'STATE_RHINELAND' },
  'westfalen': { id: 'westfalen', name: 'Westfalen & Köln', color: '#3e4c59', stateRegion: 'STATE_WESTPHALIA' },
  'sachsen': { id: 'sachsen', name: 'Kurfürstentum Sachsen', color: '#65548e', stateRegion: 'STATE_SAXONY' },
  'bayern': { id: 'bayern', name: 'Herzogtum Bayern', color: '#2b6cb0', stateRegion: 'STATE_BAVARIA' },
  'hannover': { id: 'hannover', name: 'Braunschweig-Lüneburg', color: '#319795', stateRegion: 'STATE_HANOVER' },
  'wuerttemberg_baden': { id: 'wuerttemberg_baden', name: 'Schwaben & Baden', color: '#38a169', stateRegion: 'STATE_BADEN' },
  'boehmen_maehren': { id: 'boehmen_maehren', name: 'Königreich Böhmen & Mähren', color: '#d69e2e', stateRegion: 'STATE_BOHEMIA' },
  'oesterreich_alpen': { id: 'oesterreich_alpen', name: 'Erzherzogtum Österreich & Tirol', color: '#dd6b20', stateRegion: 'STATE_AUSTRIA' },
  'ungarn': { id: 'ungarn', name: 'Königliches Ungarn', color: '#e53e3e', stateRegion: 'STATE_HUNGARY' },
  'schweiz': { id: 'schweiz', name: 'Schweizer Eidgenossenschaft', color: '#ef4444', stateRegion: 'STATE_SWITZERLAND' },

  // France
  'ile_de_france': { id: 'ile_de_france', name: 'Île-de-France (Paris)', color: '#1a365d', stateRegion: 'STATE_ILE_DE_FRANCE' },
  'normandie': { id: 'normandie', name: 'Normandie', color: '#2a4365', stateRegion: 'STATE_NORMANDY' },
  'bretagne': { id: 'bretagne', name: 'Bretagne', color: '#2b6cb0', stateRegion: 'STATE_BRITTANY' },
  'burgund': { id: 'burgund', name: 'Burgund & Champagne', color: '#4c51bf', stateRegion: 'STATE_BURGUNDY' },
  'aquitanien': { id: 'aquitanien', name: 'Aquitanien & Guyenne', color: '#6b46c1', stateRegion: 'STATE_AQUITAINE' },
  'provence': { id: 'provence', name: 'Provence & Languedoc', color: '#805ad5', stateRegion: 'STATE_PROVENCE' },

  // Britain & Low Countries
  'england_south': { id: 'england_south', name: 'Südengland & London', color: '#c53030', stateRegion: 'STATE_HOME_COUNTIES' },
  'england_north': { id: 'england_north', name: 'Nordengland & Midlands', color: '#9b2c2c', stateRegion: 'STATE_YORKSHIRE' },
  'schottland': { id: 'schottland', name: 'Königreich Schottland', color: '#742a2a', stateRegion: 'STATE_SCOTTISH_LOWLANDS' },
  'irland': { id: 'irland', name: 'Irland', color: '#22543d', stateRegion: 'STATE_LEINSTER' },
  'niederlande': { id: 'niederlande', name: 'Vereinigte Niederlande', color: '#ea580c', stateRegion: 'STATE_HOLLAND' },
  'flandern': { id: 'flandern', name: 'Spanische Niederlande (Flandern)', color: '#c2410c', stateRegion: 'STATE_FLANDERS' },

  // Italy & Iberia
  'lombardei_venetien': { id: 'lombardei_venetien', name: 'Mailand & Republik Venedig', color: '#276749', stateRegion: 'STATE_LOMBARDY' },
  'piemont': { id: 'piemont', name: 'Savoyen & Genua', color: '#2f855a', stateRegion: 'STATE_PIEDMONT' },
  'toskana_kirchenstaat': { id: 'toskana_kirchenstaat', name: 'Toskana & Kirchenstaat', color: '#319795', stateRegion: 'STATE_LATIUM' },
  'neapel_sizilien': { id: 'neapel_sizilien', name: 'Königreich Neapel & Sizilien', color: '#2c7a7b', stateRegion: 'STATE_CAMPANIA' },
  'kastilien': { id: 'kastilien', name: 'Kastilien & Madrid', color: '#b7791f', stateRegion: 'STATE_CASTILE' },
  'katalonien': { id: 'katalonien', name: 'Katalonien & Aragon', color: '#c05621', stateRegion: 'STATE_CATALONIA' },
  'andalusien': { id: 'andalusien', name: 'Andalusien & Sevilla', color: '#975a16', stateRegion: 'STATE_ANDALUSIA' },
  'portugal': { id: 'portugal', name: 'Königreich Portugal', color: '#234e52', stateRegion: 'STATE_ESTREMADURA' },

  // Eastern Europe & Poland
  'polen': { id: 'polen', name: 'Krone Polen (Groß- & Kleinpolen)', color: '#9b2c2c', stateRegion: 'STATE_MAZOVIA' },
  'litauen': { id: 'litauen', name: 'Großfürstentum Litauen', color: '#881337', stateRegion: 'STATE_LITHUANIA' },
  'galizien_wolhynien': { id: 'galizien_wolhynien', name: 'Rotrussland & Wolhynien', color: '#7b341e', stateRegion: 'STATE_WEST_GALICIA' },
  'ukraine_dnieper': { id: 'ukraine_dnieper', name: 'Saporoger Kosakenland & Kiew', color: '#744210', stateRegion: 'STATE_KIEV' },
  'russland_moskau': { id: 'russland_moskau', name: 'Zarentum Russland & Moskau', color: '#1a202c', stateRegion: 'STATE_MOSCOW' },
  'russland_nord': { id: 'russland_nord', name: 'Nowgorod & Weißes Meer', color: '#334155', stateRegion: 'STATE_NOVGOROD' },

  // Ottoman Empire & Anatolia
  'balkan_serbien': { id: 'balkan_serbien', name: 'Serbien, Bosnien & Rumelien', color: '#742a2a', stateRegion: 'STATE_SERBIA' },
  'rumaenien_donau': { id: 'rumaenien_donau', name: 'Walachei & Moldau', color: '#822727', stateRegion: 'STATE_WALLACHIA' },
  'griechenland': { id: 'griechenland', name: 'Griechenland & Morea', color: '#2b6cb0', stateRegion: 'STATE_ATTICA' },
  'thrakien_konstantinopel': { id: 'thrakien_konstantinopel', name: 'Konstantinopel & Meerengen', color: '#702459', stateRegion: 'STATE_EDIRNE' },
  'westanatolien': { id: 'westanatolien', name: 'Westanatolien', color: '#521b41', stateRegion: 'STATE_AYDIN' },
  'zentralanatolien': { id: 'zentralanatolien', name: 'Zentralanatolien', color: '#441434', stateRegion: 'STATE_ANKARA' },
  'kaukasus': { id: 'kaukasus', name: 'Kaukasus & Krim-Khanat', color: '#234e52', stateRegion: 'STATE_GEORGIA' }
};

function determineRegion(cx, cy) {
  // Far North (Lapland, Northern Norway, Murmansk, White Sea)
  if (cy <= 600) {
    if (cx >= 9800) return 'finnland_kola';
    return 'nordnorwegen_lapland';
  }
  // Scandinavia
  if (cx >= 8500 && cx <= 10100 && cy <= 1800) {
    if (cx <= 8900 && cy >= 1650) return 'daenemark';
    if (cx <= 8900) return 'norwegen';
    if (cx >= 9700) return 'baltikum';
    return 'svealand_scania';
  }
  // Great Britain & Ireland
  if (cx >= 7400 && cx <= 8400 && cy <= 2200) {
    if (cx <= 8000 && cy >= 1700) return 'irland';
    if (cy <= 1550) return 'schottland';
    if (cy >= 1900) return 'england_south';
    return 'england_north';
  }
  // Iberia
  if (cx >= 7600 && cx <= 8500 && cy >= 2600) {
    if (cx <= 7980) return 'portugal';
    if (cy >= 2950) return 'andalusien';
    if (cx >= 8350) return 'katalonien';
    return 'kastilien';
  }
  // France
  if (cx >= 8200 && cx <= 8850 && cy >= 1950 && cy <= 2650) {
    if (cx <= 8380 && cy <= 2250) return 'bretagne';
    if (cx <= 8550 && cy <= 2180) return 'normandie';
    if (cy >= 2480) return 'provence';
    if (cx <= 8500 && cy >= 2300) return 'aquitanien';
    if (cx >= 8650) return 'burgund';
    return 'ile_de_france';
  }
  // Low Countries
  if (cx >= 8450 && cx <= 8750 && cy >= 1800 && cy <= 2080) {
    if (cy <= 1950) return 'niederlande';
    return 'flandern';
  }
  // Germany & Central Europe
  if (cx >= 8650 && cx <= 9400 && cy >= 1800 && cy <= 2450) {
    if (cx <= 8800 && cy <= 2100) return 'rheinland_pfalz';
    if (cx <= 8850 && cy >= 2250) return 'wuerttemberg_baden';
    if (cy <= 1900) return 'hannover';
    if (cx <= 8900) return 'westfalen';
    if (cy >= 2300 && cx <= 9200) return 'bayern';
    if (cx >= 9000 && cy >= 2100 && cy <= 2350) return 'boehmen_maehren';
    if (cx >= 9100 && cy <= 1950) return 'pommern';
    if (cx >= 9250 && cy >= 2000 && cy <= 2200) return 'schlesien';
    if (cx >= 8950 && cy >= 2050 && cy <= 2200) return 'sachsen';
    return 'brandenburg';
  }
  // Alps & Austria
  if (cx >= 8650 && cx <= 9400 && cy >= 2350 && cy <= 2550) {
    if (cx <= 8850) return 'schweiz';
    return 'oesterreich_alpen';
  }
  // Italy
  if (cx >= 8700 && cx <= 9400 && cy >= 2500) {
    if (cx <= 8900 && cy <= 2650) return 'piemont';
    if (cy <= 2650) return 'lombardei_venetien';
    if (cy <= 2800) return 'toskana_kirchenstaat';
    return 'neapel_sizilien';
  }
  // Poland & Baltics & Ukraine
  if (cx >= 9300 && cx <= 10100 && cy <= 2250) {
    if (cx >= 9700 && cy <= 1900) return 'litauen';
    if (cx >= 9500 && cy >= 1950) return 'galizien_wolhynien';
    return 'polen';
  }
  // Hungary & Balkans
  if (cx >= 9300 && cx <= 10100 && cy >= 2200 && cy <= 2950) {
    if (cy <= 2450 && cx <= 9700) return 'ungarn';
    if (cx >= 9700 && cy <= 2550) return 'rumaenien_donau';
    if (cy >= 2750 && cx <= 9750) return 'griechenland';
    if (cx >= 9700 && cy >= 2600 && cy <= 2750) return 'thrakien_konstantinopel';
    return 'balkan_serbien';
  }
  // Anatolia & Caucasus
  if (cx >= 9800 && cx <= 11800 && cy >= 2550) {
    if (cx <= 10150) return 'westanatolien';
    if (cx <= 10700) return 'zentralanatolien';
    return 'kaukasus';
  }
  // Russia
  if (cx >= 9800 && cx <= 11800) {
    if (cy <= 1300) return 'russland_nord';
    if (cy >= 2100) return 'ukraine_dnieper';
    return 'russland_moskau';
  }

  return 'brandenburg';
}

const finalProvinces = [];
const regionProvincesMap = {};

for (const p of europeanProvinces) {
  const points = [];
  const n = p.poly.px.length;
  for (let k = 0; k < n; k++) {
    points.push([
      p.poly.px[k] - originX,
      p.poly.py[k] - originY
    ]);
  }

  const normCx = p.cx - originX;
  const normCy = p.cy - originY;
  const isSea = (p.tr === 0);

  // 1618 owner
  const owner = provOwnerMap.get(p.pid) || (isSea ? null : 'neutral');
  const cityName = cityMap.get(p.pid) || (isSea ? `Seegebiet #${p.pid}` : `Provinz #${p.pid}`);
  const regionId = isSea ? null : determineRegion(p.cx, p.cy);

  if (regionId) {
    if (!regionProvincesMap[regionId]) regionProvincesMap[regionId] = [];
    regionProvincesMap[regionId].push(p.pid);
  }

  const terrainDef = terrainTypes[p.tr] || { Name: isSea ? 'Sea' : 'Plains' };
  const resDef = resourceList[p.rs] || { Name: 'Grain' };

  let pop = 0;
  if (!isSea) {
    const basePop = 35000 + Math.round((p.gr || 12) * 4000);
    pop = Math.max(12000, Math.min(400000, basePop));
    // Capitals in 1618: Prague, Vienna, Paris, London, Madrid, Constantinople, Stockholm, Warsaw, Berlin
    if (p.pid === 656 || p.pid === 688 || p.pid === 260 || p.pid === 825 || p.pid === 6561 || p.pid === 1116 || p.pid === 1049 || p.pid === 1276 || p.pid === 592) {
      pop = Math.round(pop * 2.4);
    }
  }

  finalProvinces.push({
    id: p.pid,
    name: cityName,
    isSea,
    owner,
    controller: owner,
    region: regionId,
    terrain: terrainDef.Name.toLowerCase(),
    resource: isSea ? null : resDef.Name.toLowerCase(),
    population: pop,
    satisfaction: 80,
    development: Math.max(1, Math.min(20, Math.round((p.gr || 10) / 2.8))),
    defense: p.bd || 10,
    cx: normCx,
    cy: normCy,
    bbox: [
      p.pMinX - originX,
      p.pMinY - originY,
      p.pMaxX - originX,
      p.pMaxY - originY
    ],
    points,
    buildings: {
      farm: 1,
      market: 0,
      manufactory: 0,
      university: (p.pid === 656 || p.pid === 260 || p.pid === 825 || p.pid === 688 ? 1 : 0),
      administration: 1,
      barracks: 0,
      fortress: (p.bd > 20 ? 1 : 0),
      port: isSea ? 0 : (p.tr === 0 ? 1 : 0),
      railway: 0,
      castle: (p.pid === 656 || p.pid === 688 || p.pid === 260 ? 1 : 0)
    },
    subsidies: {
      agriculture: false,
      industry: false,
      university: false,
      infrastructure: false
    }
  });
}

console.log(`Final processed provinces: ${finalProvinces.length}`);

// 10. Process Nations for 1618 (Thirty Years' War Era)
console.log('9. Compiling 1618 sovereign nations list...');

const HISTORICAL_RULERS_1618 = {
  'atr_m2': { name: 'Kaiser Ferdinand II.', dynasty: 'Habsburg', age: 40, legitimacy: 95, traits: ['Erzherzog von Österreich', 'Kopf der Gegenreformation'] },
  'bohe_m': { name: 'Friedrich V. von der Pfalz', dynasty: 'Wittelsbach', age: 22, legitimacy: 70, traits: ['Der Winterkönig', 'Führer der Protestantischen Union'] },
  'baa_m': { name: 'Johann Sigismund', dynasty: 'Hohenzollern', age: 46, legitimacy: 85, traits: ['Kurfürst von Brandenburg', 'Herzog von Preußen'] },
  'prus_m': { name: 'Johann Sigismund', dynasty: 'Hohenzollern', age: 46, legitimacy: 85, traits: ['Herzog in Preußen'] },
  'swe2_m': { name: 'Gustav II. Adolf', dynasty: 'Wasa', age: 24, legitimacy: 92, traits: ['Der Löwe aus Mitternacht', 'Militärgenie'] },
  'fra_m': { name: 'Louis XIII. & Kardinal Richelieu', dynasty: 'Bourbon', age: 17, legitimacy: 90, traits: ['Staatsräson', 'Europäische Machtpolitik'] },
  'spa3_m': { name: 'Philipp III.', dynasty: 'Habsburg', age: 40, legitimacy: 92, traits: ['König von Spanien & Portugal', 'Herrscher der Weltmeere'] },
  'engk_m2': { name: 'James I.', dynasty: 'Stuart', age: 52, legitimacy: 88, traits: ['König von England & Schottland'] },
  'sco2_m': { name: 'James VI.', dynasty: 'Stuart', age: 52, legitimacy: 88, traits: ['König von Schottland'] },
  'den_m': { name: 'Christian IV.', dynasty: 'Oldenburg', age: 41, legitimacy: 88, traits: ['Bauherr des Nordens', 'Herr über den Sundzoll'] },
  'pol2_m': { name: 'Sigismund III. Wasa', dynasty: 'Wasa', age: 52, legitimacy: 90, traits: ['König von Polen & Großfürst von Litauen'] },
  'rus3_m': { name: 'Michael I. (Michail Fjodorowitsch)', dynasty: 'Romanow', age: 22, legitimacy: 80, traits: ['Erster Zar der Romanow-Dynastie', 'Überwinder der Zeit der Wirren'] },
  'tur_m': { name: 'Osman II.', dynasty: 'Osman', age: 14, legitimacy: 85, traits: ['Junger Reformer', 'Sultan des Reiches'] },
  'bava_m': { name: 'Maximilian I.', dynasty: 'Wittelsbach', age: 45, legitimacy: 90, traits: ['Führer der Katholischen Liga', 'Bündnispartner des Kaisers'] },
  'sax_m': { name: 'Johann Georg I.', dynasty: 'Wettin', age: 33, legitimacy: 85, traits: ['Kurfürst von Sachsen', 'Lutherscher Reichsfürst'] },
  'pal_m': { name: 'Friedrich V.', dynasty: 'Wittelsbach', age: 22, legitimacy: 80, traits: ['Kurfürst von der Pfalz'] },
  'net_m2': { name: 'Moritz von Oranien', dynasty: 'Nassau-Oranien', age: 51, legitimacy: 90, traits: ['Statthalter der Republik', 'Meister der Belagerungskunst'] },
  'papa_m2': { name: 'Papst Paul V.', dynasty: 'Borghese', age: 66, legitimacy: 98, traits: ['Bischof von Rom', 'Schirmherr des Glaubens'] },
  'ver_g': { name: 'Nicolò Donato', dynasty: 'Donà', age: 78, legitimacy: 85, traits: ['Doge der Serenissima Venedig'] },
  'por2_m': { name: 'Philipp III. (Personalunion)', dynasty: 'Habsburg', age: 40, legitimacy: 78, traits: ['Krone von Portugal'] },
  'savo_m': { name: 'Karl Emanuel I.', dynasty: 'Savoyen', age: 56, legitimacy: 84, traits: ['Der Große Herzog von Savoyen'] },
  'nap_m': { name: 'Vizekönig Pedro Téllez-Girón', dynasty: 'Osuna', age: 44, legitimacy: 80, traits: ['Spanischer Vizekönig von Neapel'] }
};

const provCountByNation = {};
for (const p of finalProvinces) {
  if (p.owner && p.owner !== 'neutral') {
    provCountByNation[p.owner] = (provCountByNation[p.owner] || 0) + 1;
  }
}

const nations = [];
for (const c of civs) {
  const tag = c.CivTAG;
  const provCount = provCountByNation[tag] || 0;
  if (provCount === 0) continue;

  const baseTag = tag.replace(/_[a-z0-9]+$/, '');
  const baseTagNoNum = baseTag.replace(/[0-9]+$/, '');

  let r = 120, g = 120, b = 120;
  const civFiles = [`${tag}.json`, `${baseTag}.json`, `${baseTagNoNum}.json`];
  for (const cf of civFiles) {
    const fullPath = path.join(aoh3, 'game/civilizations', cf);
    if (fs.existsSync(fullPath)) {
      try {
        const cData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        if (cData.iR !== undefined) {
          r = parseInt(cData.iR, 10);
          g = parseInt(cData.iG, 10);
          b = parseInt(cData.iB, 10);
          break;
        }
      } catch (err) {}
    }
  }

  // Copy flag
  const flagSources = [
    path.join(aoh3, 'gfx/flagsXH', `${tag}.png`),
    path.join(aoh3, 'gfx/flags', `${tag}.png`),
    path.join(aoh3, 'gfx/flagsXH', `${baseTag}.png`),
    path.join(aoh3, 'gfx/flags', `${baseTag}.png`),
    path.join(aoh3, 'gfx/flagsXH', `${baseTagNoNum}.png`),
    path.join(aoh3, 'gfx/flags', `${baseTagNoNum}.png`),
    path.join(aoh3, 'gfx/flagsH', `${tag}.png`),
    path.join(aoh3, 'gfx/flagsH', `${baseTag}.png`)
  ];

  for (const fSrc of flagSources) {
    if (fs.existsSync(fSrc)) {
      fs.copyFileSync(fSrc, path.join(flagsDir, `${tag}.png`));
      break;
    }
  }

  const name = getCivName(tag);
  const ruler = HISTORICAL_RULERS_1618[tag] || {
    name: `Herrscher von ${name}`,
    dynasty: `Haus ${name}`,
    age: 38,
    legitimacy: 80,
    traits: ['Reichsstand']
  };

  nations.push({
    tag,
    name,
    color: `rgb(${r}, ${g}, ${b})`,
    rgb: [r, g, b],
    capital: c.CPID,
    flag: `/assets/flags/${tag}.png`,
    provincesCount: provCount,
    ruler,
    treasury: 1200 + provCount * 140,
    income: 0,
    expenses: 0,
    balance: 0,
    prestige: 50 + Math.min(300, provCount * 2),
    stability: 80,
    manpower: 8000 + provCount * 700,
    government: tag.endsWith('_r') || tag.includes('net') || tag.includes('ver') ? 'Republik' : 'Absolute Monarchie',
    laws: {
      power: 'Absolutismus',
      economy: 'Merkantilismus',
      society: 'Adelsprivilegien',
      military: 'Söldnerheer'
    }
  });
}

nations.sort((a, b) => b.provincesCount - a.provincesCount);
console.log(`Compiled ${nations.length} sovereign nations for 1618.`);

// 11. Strategic Chokepoints
const STRAITS = [
  {
    id: 'oresund',
    name: 'Öresund & Großer Belt',
    type: 'strait',
    controllingNation: 'den_m', // Christian IV. of Denmark
    provinces: [965, 966, 967, 1049],
    tollRateGoldPerShip: 20,
    isBlockaded: false,
    freePassageAgreements: ['swe2_m', 'baa_m'],
    description: 'Historischer Sundzoll von Christian IV. von Dänemark. Haupteinnahmequelle der dänischen Krone und Kontrolle über den gesamten Ostseehandel.'
  },
  {
    id: 'bosporus',
    name: 'Bosporus & Konstantinopel',
    type: 'strait',
    controllingNation: 'tur_m', // Osman II.
    provinces: [1116, 1117, 1118],
    tollRateGoldPerShip: 25,
    isBlockaded: false,
    freePassageAgreements: ['ver_g'],
    description: 'Das Tor zum Schwarzen Meer unter der Herrschaft von Sultan Osman II.'
  },
  {
    id: 'dardanellen',
    name: 'Dardanellen',
    type: 'strait',
    controllingNation: 'tur_m',
    provinces: [1119, 1120],
    tollRateGoldPerShip: 20,
    isBlockaded: false,
    freePassageAgreements: [],
    description: 'Strategischer Seeweg zwischen Ägäis und Marmarameer.'
  },
  {
    id: 'gibraltar',
    name: 'Straße von Gibraltar',
    type: 'strait',
    controllingNation: 'spa3_m', // Spanish Empire under Philipp III.
    provinces: [6561, 8042, 8089],
    tollRateGoldPerShip: 30,
    isBlockaded: false,
    freePassageAgreements: ['por2_m'],
    description: 'Kontrolliert von der spanischen Krone unter Philipp III. Pforte zu den Kolonien der Neuen Welt.'
  },
  {
    id: 'aermelkanal',
    name: 'Straße von Dover (Ärmelkanal)',
    type: 'strait',
    controllingNation: 'engk_m2', // England under James I.
    provinces: [825, 260],
    tollRateGoldPerShip: 10,
    isBlockaded: false,
    freePassageAgreements: ['net_m2', 'fra_m'],
    description: 'Seeweg zwischen England und Flandern/Frankreich.'
  },
  {
    id: 'messina',
    name: 'Straße von Messina',
    type: 'strait',
    controllingNation: 'nap_m',
    provinces: [196, 200],
    tollRateGoldPerShip: 12,
    isBlockaded: false,
    freePassageAgreements: ['spa3_m'],
    description: 'Engpass zwischen Kalabrien und Sizilien im spanisch beherrschten Süditalien.'
  },
  {
    id: 'rhein',
    name: 'Rhein-Handelswasserstraße',
    type: 'river',
    controllingNation: 'pal_m', // Kurpfalz / Friedrich V.
    provinces: [554, 763, 773, 6502],
    tollRateGoldPerShip: 10,
    isBlockaded: false,
    freePassageAgreements: ['net_m2'],
    description: 'Zollstationen der rheinischen Kurfürsten und Schlüsselgebiet des Dreißigjährigen Krieges.'
  },
  {
    id: 'donau',
    name: 'Donau-Handelswasserstraße',
    type: 'river',
    controllingNation: 'atr_m2', // Habsburg / Vienna
    provinces: [688, 716, 3190],
    tollRateGoldPerShip: 10,
    isBlockaded: false,
    freePassageAgreements: ['bava_m'],
    description: 'Hauptlebensader der Habsburgermonarchie von Bayern bis nach Ungarn.'
  },
  {
    id: 'elbe',
    name: 'Elbe-Schifffahrtsweg',
    type: 'river',
    controllingNation: 'sax_m', // Saxony / Dresden
    provinces: [592, 603, 633, 656],
    tollRateGoldPerShip: 8,
    isBlockaded: false,
    freePassageAgreements: ['baa_m', 'bohe_m'],
    description: 'Verbindet Prag, Dresden und Magdeburg mit der Hansestadt Hamburg.'
  }
];

// 12. Copy Audio Assets
console.log('11. Copying authentic audio assets from AoH3...');
const audioSources = [
  { dir: 'sounds', files: ['click.ogg', 'click2.ogg', 'build.ogg', 'action_move.ogg'] },
  { dir: 'sfx', files: ['battle.ogg', 'armyClick.ogg', 'advantage0.ogg'] },
  { dir: 'music', files: ['High Elves Theme.ogg', 'KOL_Battle_01.ogg'] }
];

for (const group of audioSources) {
  const gDir = path.join(aoh3, 'audio', group.dir);
  for (const f of group.files) {
    const src = path.join(gDir, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(audioDir, f));
    }
  }
}

// 13. Copy UI Icons & Images
console.log('12. Copying UI icons and building graphics...');
const bldDir = path.join(aoh3, 'game/buildings/buildingsImages/XH');
if (fs.existsSync(bldDir)) {
  const bFiles = fs.readdirSync(bldDir);
  for (const bf of bFiles.slice(0, 36)) {
    fs.copyFileSync(path.join(bldDir, bf), path.join(iconsDir, `bld_${bf}`));
  }
}

// 14. Compile Regions Summary
const finalRegions = {};
for (const [rId, rDef] of Object.entries(REGIONS)) {
  const provIds = regionProvincesMap[rId] || [];
  finalRegions[rId] = {
    id: rId,
    name: rDef.name,
    color: rDef.color,
    stateRegion: rDef.stateRegion,
    provinces: provIds,
    bonuses: {
      taxEfficiency: 0.20,
      productionBonus: 0.15,
      adminCostReduction: 0.25,
      recruitmentSpeed: 0.20,
      supplyBonus: 0.20
    }
  };
}

// 15. Military System from HOI4
const militaryData = getMilitarySystemData();

// 16. Write all outputs
console.log('13. Writing JSON datasets to data/ and client/public/data/...');
const publicDataDir = path.join(__dirname, '../client/public/data');
if (!fs.existsSync(publicDataDir)) fs.mkdirSync(publicDataDir, { recursive: true });

const outputs = [
  { name: 'provinces.json', data: finalProvinces },
  { name: 'map_bounds.json', data: { width: totalWidth, height: totalHeight, minX, maxX, minY, maxY, originX, originY } },
  { name: 'regions.json', data: finalRegions },
  { name: 'nations.json', data: nations },
  { name: 'straits.json', data: STRAITS },
  { name: 'military.json', data: militaryData }
];

for (const item of outputs) {
  const jsonStr = JSON.stringify(item.data);
  fs.writeFileSync(path.join(outDataDir, item.name), jsonStr);
  fs.writeFileSync(path.join(publicDataDir, item.name), jsonStr);
  console.log(`Saved ${item.name} (${Math.round(jsonStr.length / 1024)} KB)`);
}

console.log('=== [1618 SCENARIO IMPORTER FINISHED SUCCESSFULLY!] ===');
