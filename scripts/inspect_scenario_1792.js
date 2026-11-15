const fs = require('fs');
const path = require('path');

const aoh3 = 'C:/Program Files (x86)/Steam/steamapps/common/Age of History 3';
const p1792 = path.join(aoh3, 'map/Earth3/scenarios/1792');

// Read Data.json
const rawData = fs.readFileSync(path.join(p1792, 'Data.json'), 'utf8');
// Parse relaxed json:
function parseRelaxed(raw) {
  let s = raw.replace(/\/\/.*/g, '');
  s = s.replace(/([\{\s,])([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)([\r\n,])/g, '$1"$2": "$3"$4');
  s = s.replace(/([\{\s,])([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
  s = s.replace(/,\s*([\]\}])/g, '$1');
  return JSON.parse(s);
}

try {
  const data = parseRelaxed(rawData);
  console.log('Scenario Data keys:', Object.keys(data));
  if (data.Civ) {
    console.log('Civilizations count:', data.Civ.length);
    console.log('First 20 civs:', data.Civ.slice(0, 20));
  }
} catch (e) {
  console.error('Data.json error:', e.message);
  // let's print first 500 chars of Data.json
  console.log('Data.json preview:', rawData.slice(0, 500));
}

// Read DataProvinces.json
const rawProvs = fs.readFileSync(path.join(p1792, 'DataProvinces.json'), 'utf8');
console.log('DataProvinces preview:', rawProvs.slice(0, 400));
