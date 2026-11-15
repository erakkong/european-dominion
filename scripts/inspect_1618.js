const fs = require('fs');
const path = require('path');

const aoh3 = 'C:/Program Files (x86)/Steam/steamapps/common/Age of History 3';
const p1618 = path.join(aoh3, 'map/Earth3/scenarios/1618_Thirty');

const civs = eval('(' + fs.readFileSync(path.join(p1618, 'Data.json'), 'utf8') + ')');
const provsByCiv = eval('(' + fs.readFileSync(path.join(p1618, 'DataProvinces.json'), 'utf8') + ')');

const bundleDe = fs.readFileSync(path.join(aoh3, 'game/languages/civilizations/Bundle_de.properties'), 'utf8');

function getCivName(tag) {
  const baseTag = tag.replace(/_[a-z0-9]+$/, '');
  const baseTagNoNum = baseTag.replace(/[0-9]+$/, '');
  for (const t of [tag, baseTag, baseTagNoNum]) {
    const mDe = bundleDe.match(new RegExp('^' + t + '\\s*=\\s*(.*)$', 'm'));
    if (mDe && mDe[1].trim()) return mDe[1].trim();
  }
  return tag;
}

console.log('Total civs in 1618:', civs.length);

const results = [];
for (let i = 0; i < civs.length; i++) {
  const c = civs[i];
  const provs = provsByCiv[i] ? provsByCiv[i].Provinces : [];
  if (provs.length > 0) {
    results.push({
      tag: c.CivTAG,
      id: c.CivID,
      capital: c.CPID,
      provCount: provs.length,
      name: getCivName(c.CivTAG)
    });
  }
}

results.sort((a, b) => b.provCount - a.provCount);
console.log('Top 35 nations in 1618 by province count:');
console.table(results.slice(0, 35));
