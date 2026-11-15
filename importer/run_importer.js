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

console.log('=== [PHASE 1] RUNNING MASTER DATA IMPORTER ===');

// 1. Load Province Details & Names
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

// 3. Load 1792 Scenario Civs & Ownership
console.log('3. Loading 1792 scenario...');
const p1792 = path.join(aoh3, 'map/Earth3/scenarios/1792');
const civs = eval('(' + fs.readFileSync(path.join(p1792, 'Data.json'), 'utf8') + ')');
const provsByCiv = eval('(' + fs.readFileSync(path.join(p1792, 'DataProvinces.json'), 'utf8') + ')');

const provOwnerMap = new Map();
for (let cIdx = 0; cIdx < civs.length; cIdx++) {
  const c = civs[cIdx];
  const list = provsByCiv[cIdx] ? provsByCiv[cIdx].Provinces : [];
  for (const pid of list) {
    provOwnerMap.set(pid, c.CivTAG);
  }
}

// 4. Load Localization for Country Names
console.log('4. Loading civilization localization...');
const bundleDe = fs.readFileSync(path.join(aoh3, 'game/languages/civilizations/Bundle_de.properties'), 'utf8');
const bundleEn = fs.readFileSync(path.join(aoh3, 'game/languages/civilizations/Bundle.properties'), 'utf8');

function getCivName(tag) {
  // Strip gov suffix: prus_m -> prus, spa3_m -> spa3 or spa
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
  return tag;
}

// 5. Read Victoria 3 State Regions
console.log('5. Loading Victoria 3 state regions...');
const vic3Regions = parseVictoriaStateRegions();

// 6. Read All Province Polygons
console.log('6. Loading all province boundary polygons from AoH3 Earth3...');
const ppDir = path.join(aoh3, 'map/Earth3/data/ProvincePoints');
const allPolygons = []; // index = pid

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

// 7. Filter European & Anatolian Provinces
console.log('7. Filtering European & Anatolian theater provinces...');
// Find bounding box and centroids
const europeanProvinces = [];
let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

for (let pid = 0; pid < pdetails.length; pid++) {
  const p = pdetails[pid];
  const poly = allPolygons[pid];
  if (!poly || poly.px.length === 0) continue;

  // Calculate centroid and bounding box of this province
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

  // Check if in European / Anatolian / Near East Theater:
  // Longitude X: 7100 to 11800 (Azores/Iceland to Urals/Caspian)
  // Latitude Y: 550 to 3200 (North Cape to Mediterranean / North Africa coast)
  const inTheaterCoords = (cx >= 7100 && cx <= 11800 && cy >= 550 && cy <= 3250);
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

console.log(`Matched ${europeanProvinces.length} provinces in theater.`);
console.log(`Original bounding box: X [${minX}, ${maxX}] (w: ${maxX - minX}), Y [${minY}, ${maxY}] (h: ${maxY - minY})`);

// 8. Transform & Normalize coordinates
const PADDING = 60;
const originX = minX - PADDING;
const originY = minY - PADDING;
const totalWidth = (maxX - minX) + PADDING * 2;
const totalHeight = (maxY - minY) + PADDING * 2;

console.log(`Normalized map canvas size: ${totalWidth} x ${totalHeight}`);

// 9. Assign Region & Create Province Data
console.log('8. Assigning large regions and creating province records...');

// Define historical regions mapping based on Victoria 3 states and geographic clusters
const REGIONS = {
  // Prussia & German States
  'brandenburg': { id: 'brandenburg', name: 'Brandenburg', color: '#4a6572', stateRegion: 'STATE_BRANDENBURG' },
  'schlesien': { id: 'schlesien', name: 'Schlesien', color: '#557a95', stateRegion: 'STATE_SILESIA' },
  'ostpreussen': { id: 'ostpreussen', name: 'Ostpreußen', color: '#334e68', stateRegion: 'STATE_EAST_PRUSSIA' },
  'pommern': { id: 'pommern', name: 'Pommern', color: '#627d98', stateRegion: 'STATE_POMERANIA' },
  'rheinland': { id: 'rheinland', name: 'Rheinland', color: '#486581', stateRegion: 'STATE_RHINELAND' },
  'westfalen': { id: 'westfalen', name: 'Westfalen', color: '#3e4c59', stateRegion: 'STATE_WESTPHALIA' },
  'sachsen': { id: 'sachsen', name: 'Sachsen', color: '#65548e', stateRegion: 'STATE_SAXONY' },
  'bayern': { id: 'bayern', name: 'Bayern', color: '#2b6cb0', stateRegion: 'STATE_BAVARIA' },
  'hannover': { id: 'hannover', name: 'Hannover', color: '#319795', stateRegion: 'STATE_HANOVER' },
  'wuerttemberg_baden': { id: 'wuerttemberg_baden', name: 'Württemberg & Baden', color: '#38a169', stateRegion: 'STATE_BADEN' },
  'boehmen_maehren': { id: 'boehmen_maehren', name: 'Böhmen & Mähren', color: '#d69e2e', stateRegion: 'STATE_BOHEMIA' },
  'oesterreich_alpen': { id: 'oesterreich_alpen', name: 'Österreich & Tirol', color: '#dd6b20', stateRegion: 'STATE_AUSTRIA' },
  'ungarn': { id: 'ungarn', name: 'Ungarn', color: '#e53e3e', stateRegion: 'STATE_HUNGARY' },
  
  // France
  'ile_de_france': { id: 'ile_de_france', name: 'Île-de-France', color: '#1a365d', stateRegion: 'STATE_ILE_DE_FRANCE' },
  'normandie': { id: 'normandie', name: 'Normandie', color: '#2a4365', stateRegion: 'STATE_NORMANDY' },
  'bretagne': { id: 'bretagne', name: 'Bretagne', color: '#2b6cb0', stateRegion: 'STATE_BRITTANY' },
  'burgund': { id: 'burgund', name: 'Burgund & Champagne', color: '#4c51bf', stateRegion: 'STATE_BURGUNDY' },
  'aquitanien': { id: 'aquitanien', name: 'Aquitanien', color: '#6b46c1', stateRegion: 'STATE_AQUITAINE' },
  'provence': { id: 'provence', name: 'Provence & Rhônetal', color: '#805ad5', stateRegion: 'STATE_PROVENCE' },
  
  // Great Britain & Low Countries
  'england_south': { id: 'england_south', name: 'Südengland & London', color: '#c53030', stateRegion: 'STATE_HOME_COUNTIES' },
  'england_north': { id: 'england_north', name: 'Nordengland & Midlands', color: '#9b2c2c', stateRegion: 'STATE_YORKSHIRE' },
  'schottland': { id: 'schottland', name: 'Schottland', color: '#742a2a', stateRegion: 'STATE_SCOTTISH_LOWLANDS' },
  'irland': { id: 'irland', name: 'Irland', color: '#22543d', stateRegion: 'STATE_LEINSTER' },
  'niederlande_flandern': { id: 'niederlande_flandern', name: 'Flandern & Holland', color: '#c05621', stateRegion: 'STATE_HOLLAND' },
  
  // Italy & Iberia
  'lombardei_venetien': { id: 'lombardei_venetien', name: 'Lombardei & Venetien', color: '#276749', stateRegion: 'STATE_LOMBARDY' },
  'piemont': { id: 'piemont', name: 'Piemont & Ligurien', color: '#2f855a', stateRegion: 'STATE_PIEDMONT' },
  'toskana_kirchenstaat': { id: 'toskana_kirchenstaat', name: 'Toskana & Kirchenstaat', color: '#319795', stateRegion: 'STATE_LATIUM' },
  'neapel_sizilien': { id: 'neapel_sizilien', name: 'Neapel & Sizilien', color: '#2c7a7b', stateRegion: 'STATE_CAMPANIA' },
  'kastilien': { id: 'kastilien', name: 'Kastilien & Madrid', color: '#b7791f', stateRegion: 'STATE_CASTILE' },
  'katalonien': { id: 'katalonien', name: 'Katalonien & Valencia', color: '#c05621', stateRegion: 'STATE_CATALONIA' },
  'andalusien': { id: 'andalusien', name: 'Andalusien', color: '#975a16', stateRegion: 'STATE_ANDALUSIA' },
  'portugal': { id: 'portugal', name: 'Portugal', color: '#234e52', stateRegion: 'STATE_ESTREMADURA' },
  
  // Scandinavia & Baltic
  'svealand_scania': { id: 'svealand_scania', name: 'Svealand & Götaland', color: '#2b6cb0', stateRegion: 'STATE_SVEALAND' },
  'norwegen': { id: 'norwegen', name: 'Norwegen', color: '#3182ce', stateRegion: 'STATE_EASTERN_NORWAY' },
  'daenemark': { id: 'daenemark', name: 'Dänemark & Holstein', color: '#e53e3e', stateRegion: 'STATE_ZEALAND' },
  'baltikum': { id: 'baltikum', name: 'Livland & Kurland', color: '#4a5568', stateRegion: 'STATE_LIVONIA' },
  
  // Poland & Eastern Europe
  'polen': { id: 'polen', name: 'Groß- & Kleinpolen', color: '#9b2c2c', stateRegion: 'STATE_MAZOVIA' },
  'galizien_lodomerien': { id: 'galizien_lodomerien', name: 'Galizien & Wolhynien', color: '#7b341e', stateRegion: 'STATE_WEST_GALICIA' },
  'ukraine_dnieper': { id: 'ukraine_dnieper', name: 'Dnjepr-Ukraine', color: '#744210', stateRegion: 'STATE_KIEV' },
  'russland_moskau': { id: 'russland_moskau', name: 'Zentralrussland & Moskau', color: '#1a202c', stateRegion: 'STATE_MOSCOW' },
  'russland_petersburg': { id: 'russland_petersburg', name: 'Ingermanland & St. Petersburg', color: '#2d3748', stateRegion: 'STATE_INGRIA' },
  
  // Balkans & Ottoman / Anatolia
  'balkan_serbien': { id: 'balkan_serbien', name: 'Serbien & Bosnien', color: '#742a2a', stateRegion: 'STATE_SERBIA' },
  'rumaenien_donau': { id: 'rumaenien_donau', name: 'Walachei & Moldau', color: '#822727', stateRegion: 'STATE_WALLACHIA' },
  'griechenland': { id: 'griechenland', name: 'Griechenland & Ägäis', color: '#2b6cb0', stateRegion: 'STATE_ATTICA' },
  'thrakien_konstantinopel': { id: 'thrakien_konstantinopel', name: 'Thrakien & Meerengen', color: '#702459', stateRegion: 'STATE_EDIRNE' },
  'westanatolien': { id: 'westanatolien', name: 'Westanatolien & Smyrna', color: '#521b41', stateRegion: 'STATE_AYDIN' },
  'zentralanatolien': { id: 'zentralanatolien', name: 'Zentralanatolien & Ankara', color: '#441434', stateRegion: 'STATE_ANKARA' },
  'kaukasus': { id: 'kaukasus', name: 'Kaukasus & Georgien', color: '#234e52', stateRegion: 'STATE_GEORGIA' },
  'schweiz': { id: 'schweiz', name: 'Schweizer Kantone', color: '#e53e3e', stateRegion: 'STATE_SWITZERLAND' }
};

// Function to find best matching region based on coordinates & country
function determineRegion(cx, cy, ownerTag) {
  // Coordinate based assignment
  // Great Britain / Ireland
  if (cx >= 7600 && cx <= 8400 && cy >= 1200 && cy <= 2200) {
    if (cx <= 8000 && cy >= 1700) return 'irland';
    if (cy <= 1550) return 'schottland';
    if (cy >= 1900) return 'england_south';
    return 'england_north';
  }
  // Iberia
  if (cx >= 7600 && cx <= 8500 && cy >= 2600 && cy <= 3250) {
    if (cx <= 7980) return 'portugal';
    if (cy >= 2950) return 'andalusien';
    if (cx >= 8350) return 'katalonien';
    return 'kastilien';
  }
  // France
  if (cx >= 8200 && cx <= 8850 && cy >= 2000 && cy <= 2650) {
    if (cx <= 8380 && cy <= 2250) return 'bretagne';
    if (cx <= 8550 && cy <= 2180) return 'normandie';
    if (cy >= 2480) return 'provence';
    if (cx <= 8500 && cy >= 2300) return 'aquitanien';
    if (cx >= 8650) return 'burgund';
    return 'ile_de_france';
  }
  // Low Countries
  if (cx >= 8450 && cx <= 8750 && cy >= 1850 && cy <= 2080) {
    return 'niederlande_flandern';
  }
  // Germany & Central Europe
  if (cx >= 8650 && cx <= 9400 && cy >= 1800 && cy <= 2450) {
    if (cx <= 8800 && cy <= 2100) return 'rheinland';
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
  if (cx >= 8700 && cx <= 9400 && cy >= 2500 && cy <= 3150) {
    if (cx <= 8900 && cy <= 2650) return 'piemont';
    if (cy <= 2650) return 'lombardei_venetien';
    if (cy <= 2800) return 'toskana_kirchenstaat';
    return 'neapel_sizilien';
  }
  // Scandinavia
  if (cx >= 8500 && cx <= 9800 && cy >= 600 && cy <= 1800) {
    if (cy >= 1700 && cx <= 8850) return 'daenemark';
    if (cx <= 8900) return 'norwegen';
    return 'svealand_scania';
  }
  // Poland & Baltics
  if (cx >= 9300 && cx <= 9900 && cy >= 1600 && cy <= 2150) {
    if (cy <= 1800) return 'baltikum';
    if (cx >= 9500 && cy >= 1950) return 'galizien_lodomerien';
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
  if (cx >= 9800 && cx <= 11600 && cy >= 2550 && cy <= 3150) {
    if (cx <= 10150) return 'westanatolien';
    if (cx <= 10700) return 'zentralanatolien';
    return 'kaukasus';
  }
  // Russia & Ukraine
  if (cx >= 9800 && cx <= 11800 && cy >= 900 && cy <= 2550) {
    if (cy <= 1650) return 'russland_petersburg';
    if (cy >= 2100) return 'ukraine_dnieper';
    return 'russland_moskau';
  }

  return 'brandenburg';
}

const finalProvinces = [];
const regionProvincesMap = {};

for (const p of europeanProvinces) {
  // Normalize polygon points
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

  // Determine owner in 1792
  const owner = provOwnerMap.get(p.pid) || (isSea ? null : 'neutral');
  const cityName = cityMap.get(p.pid) || (isSea ? `Seegebiet #${p.pid}` : `Provinz #${p.pid}`);
  const regionId = isSea ? null : determineRegion(p.cx, p.cy, owner);

  if (regionId) {
    if (!regionProvincesMap[regionId]) regionProvincesMap[regionId] = [];
    regionProvincesMap[regionId].push(p.pid);
  }

  // Terrain info
  const terrainDef = terrainTypes[p.tr] || { Name: isSea ? 'Sea' : 'Plains' };

  // Resource info
  const resDef = resourceList[p.rs] || { Name: 'Grain' };

  // Population calculation based on growth and terrain
  let pop = 0;
  if (!isSea) {
    const basePop = 40000 + Math.round((p.gr || 15) * 4500);
    pop = Math.max(15000, Math.min(450000, basePop));
    if (p.pid === 592 || p.pid === 260 || p.pid === 825 || p.pid === 688 || p.pid === 1116 || p.pid === 6561) {
      // Capital cities: Berlin, Paris, London, Vienna, Constantinople, Madrid
      pop = Math.round(pop * 2.2);
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
    satisfaction: 85, // 0-100%
    development: Math.max(1, Math.min(20, Math.round((p.gr || 10) / 2.5))),
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
      university: 0,
      administration: 1,
      barracks: 0,
      fortress: (p.bd > 25 ? 1 : 0),
      port: isSea ? 0 : (p.tr === 0 ? 1 : 0),
      railway: 0
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

// 10. Process Nations
console.log('9. Compiling sovereign nations list with historical data...');

// Roster of notable rulers around 1770 - 1792
const HISTORICAL_RULERS = {
  'prus_m': { name: 'Friedrich Wilhelm II.', dynasty: 'Hohenzollern', age: 48, legitimacy: 90, traits: ['Militärisch erzogen', 'Prunkliebend'] },
  'fra_p': { name: 'Louis XVI.', dynasty: 'Bourbon', age: 38, legitimacy: 65, traits: ['Unentschlossen', 'Reformfreudig'] },
  'atr_m': { name: 'Franz II.', dynasty: 'Habsburg-Lothringen', age: 24, legitimacy: 95, traits: ['Verteidiger des Reiches', 'Traditionsbewusst'] },
  'uni_n': { name: 'George III.', dynasty: 'Hannover', age: 54, legitimacy: 88, traits: ['Willensstark', 'Maritim fokussiert'] },
  'rus2_m': { name: 'Katharina II. (die Große)', dynasty: 'Romanow', age: 63, legitimacy: 92, traits: ['Aufgeklärte Herrscherin', 'Große Reformerin'] },
  'tur_m': { name: 'Selim III.', dynasty: 'Osman', age: 31, legitimacy: 85, traits: ['Nizam-i Djedid Reformer', 'Kultiviert'] },
  'spa3_m': { name: 'Carlos IV.', dynasty: 'Bourbon', age: 44, legitimacy: 80, traits: ['Zögerlich', 'Kunstmäzen'] },
  'por_m': { name: 'Maria I.', dynasty: 'Braganza', age: 58, legitimacy: 82, traits: ['Fromm', 'Kolonialmacht'] },
  'nodm_m': { name: 'Christian VII.', dynasty: 'Oldenburg', age: 43, legitimacy: 78, traits: ['Geleitet von Ministern'] },
  'swe_m': { name: 'Gustav III.', dynasty: 'Holstein-Gottorp', age: 46, legitimacy: 86, traits: ['Erleuchteter Despot', 'Kühn'] },
  'pol2_m': { name: 'Stanisław II. August', dynasty: 'Poniatowski', age: 60, legitimacy: 70, traits: ['Verfassungsmacher 1791', 'Tragischer Reformer'] },
  'bava_m': { name: 'Karl Theodor', dynasty: 'Wittelsbach', age: 68, legitimacy: 84, traits: ['Pfalz-Neuburg Erbe', 'Reichsfürst'] },
  'sax_m': { name: 'Friedrich August III.', dynasty: 'Wettin', age: 42, legitimacy: 88, traits: ['Gerechter Kurfürst', 'Wirtschaftsförderer'] },
  'savo_m': { name: 'Viktor Amadeus III.', dynasty: 'Savoyen', age: 66, legitimacy: 85, traits: ['Militärische Disziplin'] },
  'nap_m': { name: 'Ferdinand IV.', dynasty: 'Bourbon', age: 41, legitimacy: 76, traits: ['Süditalienischer Monarch'] },
  'papa_o': { name: 'Papst Pius VI.', dynasty: 'Braschi', age: 75, legitimacy: 98, traits: ['Kirchenoberhaupt'] }
};

const nations = [];
const provCountByNation = {};
for (const p of finalProvinces) {
  if (p.owner && p.owner !== 'neutral') {
    provCountByNation[p.owner] = (provCountByNation[p.owner] || 0) + 1;
  }
}

// Read Civ colors from game/civilizations
for (const c of civs) {
  const tag = c.CivTAG;
  const provCount = provCountByNation[tag] || 0;
  if (provCount === 0) continue;

  const baseTag = tag.replace(/_[a-z0-9]+$/, '');
  const baseTagNoNum = baseTag.replace(/[0-9]+$/, '');

  // Look for JSON in civilizations
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

  // Copy flag asset
  let flagFound = false;
  let flagFilename = `${tag}.png`;
  const flagSources = [
    path.join(aoh3, 'gfx/flagsXH', `${tag}.png`),
    path.join(aoh3, 'gfx/flags', `${tag}.png`),
    path.join(aoh3, 'gfx/flagsXH', `${baseTag}.png`),
    path.join(aoh3, 'gfx/flags', `${baseTag}.png`),
    path.join(aoh3, 'gfx/flagsH', `${tag}.png`),
    path.join(aoh3, 'gfx/flagsH', `${baseTag}.png`)
  ];

  for (const fSrc of flagSources) {
    if (fs.existsSync(fSrc)) {
      fs.copyFileSync(fSrc, path.join(flagsDir, `${tag}.png`));
      flagFound = true;
      break;
    }
  }

  const name = getCivName(tag);
  const ruler = HISTORICAL_RULERS[tag] || {
    name: `König von ${name}`,
    dynasty: `Haus ${name}`,
    age: 40,
    legitimacy: 80,
    traits: ['Souverän']
  };

  // Capital province
  const capitalPid = c.CPID;

  nations.push({
    tag,
    name,
    color: `rgb(${r}, ${g}, ${b})`,
    rgb: [r, g, b],
    capital: capitalPid,
    flag: `/assets/flags/${tag}.png`,
    provincesCount: provCount,
    ruler,
    treasury: 1000 + provCount * 120,
    income: 0,
    expenses: 0,
    balance: 0,
    prestige: 50 + Math.min(250, provCount * 2),
    stability: 80, // %
    manpower: 10000 + provCount * 800,
    government: tag.endsWith('_r') ? 'Republik' : (tag.endsWith('_p') ? 'Konstitutionelle Monarchie' : 'Absolute Monarchie'),
    laws: {
      power: 'Absolutismus',
      economy: 'Merkantilismus',
      society: 'Adelsprivilegien',
      military: 'Berufsheer'
    }
  });
}

// Sort nations by province count descending
nations.sort((a, b) => b.provincesCount - a.provincesCount);
console.log(`Compiled ${nations.length} sovereign nations.`);

// 11. Strategic Chokepoints (Straits & Major Waterways)
console.log('10. Compiling strategic chokepoints and waterways...');
const STRAITS = [
  {
    id: 'oresund',
    name: 'Öresund & Großer Belt',
    type: 'strait',
    controllingNation: 'nodm_m', // Denmark
    provinces: [965, 966, 967, 1049],
    tollRateGoldPerShip: 15,
    isBlockaded: false,
    freePassageAgreements: ['swe_m', 'prus_m'],
    description: 'Historischer Sundzoll (Öresundzoll). Kontrolliert den gesamten Handelszugang von der Nordsee in den Ostseeraum.'
  },
  {
    id: 'bosporus',
    name: 'Bosporus & Konstantinopel',
    type: 'strait',
    controllingNation: 'tur_m', // Ottoman Empire
    provinces: [1116, 1117, 1118],
    tollRateGoldPerShip: 25,
    isBlockaded: false,
    freePassageAgreements: ['rus2_m'],
    description: 'Das Nadelöhr zwischen Europa und Asien. Kontrolliert sämtliche maritime Ein- und Ausfahrten ins Schwarze Meer.'
  },
  {
    id: 'dardanellen',
    name: 'Dardanellen (Hellespont)',
    type: 'strait',
    controllingNation: 'tur_m', // Ottoman Empire
    provinces: [1119, 1120],
    tollRateGoldPerShip: 20,
    isBlockaded: false,
    freePassageAgreements: [],
    description: 'Südliche Einfahrt des Marmarameeres und Schlüsselfestung der osmanischen Seeverteidigung.'
  },
  {
    id: 'gibraltar',
    name: 'Straße von Gibraltar',
    type: 'strait',
    controllingNation: 'spa3_m', // Spain / Britain
    provinces: [6561, 8042, 8089],
    tollRateGoldPerShip: 30,
    isBlockaded: false,
    freePassageAgreements: ['uni_n', 'por_m'],
    description: 'Die Säulen des Herkules. Kontrolliert den maritimen Durchgang zwischen Atlantischem Ozean und Mittelmeer.'
  },
  {
    id: 'aermelkanal',
    name: 'Straße von Dover (Ärmelkanal)',
    type: 'strait',
    controllingNation: 'uni_n', // Great Britain
    provinces: [825, 260],
    tollRateGoldPerShip: 10,
    isBlockaded: false,
    freePassageAgreements: ['net_n', 'fra_p'],
    description: 'Engpass zwischen Großbritannien und dem europäischen Festland mit dem weltweit dichtesten Frachtverkehr.'
  },
  {
    id: 'messina',
    name: 'Straße von Messina',
    type: 'strait',
    controllingNation: 'nap_m', // Kingdom of Two Sicilies
    provinces: [196, 200],
    tollRateGoldPerShip: 12,
    isBlockaded: false,
    freePassageAgreements: [],
    description: 'Strategische Meerenge zwischen Kalabrien und Sizilien im Herzen des zentralen Mittelmeers.'
  },
  // Major Rivers
  {
    id: 'rhein',
    name: 'Rhein-Handelswasserstraße',
    type: 'river',
    controllingNation: 'prus_m',
    provinces: [554, 763, 773, 6502],
    tollRateGoldPerShip: 8,
    isBlockaded: false,
    freePassageAgreements: ['net_n', 'bade_m'],
    description: 'Die wirtschaftliche Hauptschlagader Westeuropas von den Alpen über Deutschland bis zur Rheinmündung bei Rotterdam.'
  },
  {
    id: 'donau',
    name: 'Donau-Handelswasserstraße',
    type: 'river',
    controllingNation: 'atr_m',
    provinces: [688, 716, 3190],
    tollRateGoldPerShip: 10,
    isBlockaded: false,
    freePassageAgreements: ['bava_m', 'tur_m'],
    description: 'Mächtige mitteleuropäische Verkehrsader, die Süddeutschland, Wien, Ungarn und den Balkan mit dem Schwarzen Meer verbindet.'
  },
  {
    id: 'elbe',
    name: 'Elbe-Schifffahrtsweg',
    type: 'river',
    controllingNation: 'prus_m',
    provinces: [592, 603, 633],
    tollRateGoldPerShip: 6,
    isBlockaded: false,
    freePassageAgreements: ['sax_m', 'ham_m'],
    description: 'Verbindet Böhmen und Sachsen über Magdeburg und Hamburg mit der Nordsee.'
  }
];

// 12. Copy Audio Assets (Sounds, SFX, Music)
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
  for (const bf of bFiles.slice(0, 30)) {
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

console.log('=== [PHASE 1] IMPORTER PIPELINE FINISHED SUCCESSFULLY! ===');
