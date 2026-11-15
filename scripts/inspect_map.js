const fs = require('fs');
const path = require('path');

const aoh3 = 'C:/Program Files (x86)/Steam/steamapps/common/Age of History 3';
const ppDir = path.join(aoh3, 'map/Earth3/data/ProvincePoints');
const files = fs.readdirSync(ppDir);
console.log('Total ProvincePoints files:', files.length);

// Each ProvincePoints file contains a chunk of provinces.
// Let's inspect the files list:
console.log('Sample file names:', files.slice(0, 10));

// Let's read ProvincePoints.json without strict JSON.parse, using a simple regex or eval in a safe function
function parseRelaxed(raw) {
  // Turn relaxed json to standard json
  let s = raw.replace(/\/\/.*/g, '');
  // replace keys: e.g. Age_of_History: Data -> "Age_of_History": "Data"
  s = s.replace(/([\{\s,])([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)([\r\n,])/g, '$1"$2": "$3"$4');
  s = s.replace(/([\{\s,])([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
  s = s.replace(/,\s*([\]\}])/g, '$1');
  return JSON.parse(s);
}

try {
  const raw0 = fs.readFileSync(path.join(ppDir, 'ProvincePoints.json'), 'utf8');
  // Or extract pX and pY using regex directly!
  const pxMatches = [...raw0.matchAll(/pX\s*:\s*\[([^\]]+)\]/g)];
  const pyMatches = [...raw0.matchAll(/pY\s*:\s*\[([^\]]+)\]/g)];
  console.log('In ProvincePoints.json: found pX blocks:', pxMatches.length, 'pY blocks:', pyMatches.length);
} catch (e) {
  console.error('Error:', e);
}
