const fs = require('fs');
const path = require('path');

const aoh3 = 'C:/Program Files (x86)/Steam/steamapps/common/Age of History 3';
const p1792 = path.join(aoh3, 'map/Earth3/scenarios/1792');

const rawDetails = fs.readFileSync(path.join(aoh3, 'map/Earth3/data/ProvinceDetails.json'), 'utf8');
const pdetails = eval('(' + rawDetails + ')');

const civs = eval('(' + fs.readFileSync(path.join(p1792, 'Data.json'), 'utf8') + ')');
const provsByCiv = eval('(' + fs.readFileSync(path.join(p1792, 'DataProvinces.json'), 'utf8') + ')');

// Check Ottoman
const turIndex = civs.findIndex(c => c.CivTAG.startsWith('tur'));
console.log('turIndex:', turIndex, civs[turIndex]);
const turProvs = provsByCiv[turIndex].Provinces;
console.log('Ottoman provs count in 1792:', turProvs.length);

const conts = {};
turProvs.forEach(pid => {
  const p = pdetails.find(x => x.pid === pid);
  if (p) conts[p.co] = (conts[p.co] || 0) + 1;
});
console.log('Ottoman provinces by continent (0=Ocean, 1=Asia, 2=Europe, 6=Africa):', conts);

// Check all European scenario nations
let totalEuropeanProvs = 0;
const europeanCivs = [];
for (let i = 0; i < civs.length; i++) {
  const c = civs[i];
  const provs = provsByCiv[i] ? provsByCiv[i].Provinces : [];
  let inEurope = 0;
  for (const pid of provs) {
    const p = pdetails.find(x => x.pid === pid);
    if (p && (p.co === 2 || (p.co === 1 && c.CivTAG.startsWith('tur')))) {
      inEurope++;
    }
  }
  if (inEurope > 0) {
    europeanCivs.push({ tag: c.CivTAG, id: c.CivID, capital: c.CPID, totalProvs: provs.length, inEurope });
  }
}
console.log('Total European/Anatolian scenario nations:', europeanCivs.length);
console.log('Sample nations:', europeanCivs.slice(0, 15));
