const fs = require('fs');
const path = require('path');

const aoh3 = 'C:/Program Files (x86)/Steam/steamapps/common/Age of History 3';
const pdetails = eval('(' + fs.readFileSync(path.join(aoh3, 'map/Earth3/data/ProvinceDetails.json'), 'utf8') + ')');
const pnp = eval('(' + fs.readFileSync(path.join(aoh3, 'map/Earth3/data/ProvinceNamePoints.json'), 'utf8') + ')');

// Build map of pid -> pnp
const pnpMap = new Map();
for (const p of pnp) {
  pnpMap.set(p.pid, p);
}

// Find European and Anatolian provinces
// European provinces: p.co === 2
// Anatolian provinces: p.co === 1 and x is roughly between 9500 and 11500, y between 2300 and 3100
let minX = 999999, maxX = -999999, minY = 999999, maxY = -999999;
let count = 0;

for (const p of pdetails) {
  const pt = pnpMap.get(p.pid);
  if (!pt) continue;
  const isEurope = p.co === 2;
  const isAnatolia = (p.co === 1 && pt.cx >= 9700 && pt.cx <= 11200 && pt.cy >= 2350 && pt.cy <= 3150);
  if (isEurope || isAnatolia) {
    count++;
    if (pt.cx < minX) minX = pt.cx;
    if (pt.cx > maxX) maxX = pt.cx;
    if (pt.cy < minY) minY = pt.cy;
    if (pt.cy > maxY) maxY = pt.cy;
  }
}

console.log(`Matched ${count} provinces.`);
console.log(`Bounding box: X: [${minX}, ${maxX}] (width: ${maxX - minX}), Y: [${minY}, ${maxY}] (height: ${maxY - minY})`);
