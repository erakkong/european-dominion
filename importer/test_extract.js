const fs = require('fs');
const path = require('path');

const aoh3 = 'C:/Program Files (x86)/Steam/steamapps/common/Age of History 3';
const pdetailsPath = path.join(aoh3, 'map/Earth3/data/ProvinceDetails.json');
const citiesPath = path.join(aoh3, 'map/Earth3/cities/cities.json');

console.log('Loading ProvinceDetails...');
const rawDetails = fs.readFileSync(pdetailsPath, 'utf8');
const pdetails = eval('(' + rawDetails + ')');
console.log('Loaded details:', pdetails.length);

console.log('Loading Cities...');
const rawCities = fs.readFileSync(citiesPath, 'utf8');
const cities = eval('(' + rawCities + ')');
const cityMap = new Map();
for (const c of cities) {
  if (c.p !== undefined && !cityMap.has(c.p)) {
    cityMap.set(c.p, c.Name);
  }
}
console.log('Cities mapped:', cityMap.size);

// Read scenario
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
console.log('Provinces owned in 1792 scenario:', provOwnerMap.size);

// Test reading ProvincePoints for a chunk
const ppDir = path.join(aoh3, 'map/Earth3/data/ProvincePoints');
console.log('Testing ProvincePoints extraction...');
const p0 = fs.readFileSync(path.join(ppDir, 'ProvincePoints.json'), 'utf8');
const px0 = [...p0.matchAll(/pX\s*:\s*\[([^\]]+)\]/g)];
console.log('Found pX in file 0:', px0.length);
