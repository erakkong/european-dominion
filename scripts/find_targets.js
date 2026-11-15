const fs = require('fs');
const nations = JSON.parse(fs.readFileSync('data/nations.json', 'utf8'));
const provs = JSON.parse(fs.readFileSync('data/provinces.json', 'utf8'));

console.log('=== TARGET NATIONS ===');
for (const n of nations) {
  const name = (n.name || '').toLowerCase();
  const tag = (n.tag || '').toLowerCase();
  if (['krim', 'crimea', 'speyer', 'nassau', 'persia', 'bavaria', 'bayern', 'savoy', 'sardinien', 'natuk', 'guri', 'ciesz', 'teck'].some(k => name.includes(k) || tag.includes(k))) {
    console.log(`Tag: ${n.tag}, Name: ${n.name}, ProvCount: ${n.provincesCount}`);
  }
}

console.log('\n=== PROVINCE SEARCH ===');
function searchP(query) {
  const q = query.toLowerCase();
  return provs.filter(p => (p.name && p.name.toLowerCase().includes(q)) || (p.owner && p.owner.toLowerCase().includes(q)));
}

console.log('Gizab:', searchP('gizab').map(p => ({ id: p.id, name: p.name, owner: p.owner })));
console.log('Speyer:', searchP('speyer').map(p => ({ id: p.id, name: p.name, owner: p.owner })));
console.log('Natuk / Natukh / Natok / Adyge / Circass:');
const circassProvs = provs.filter(p => {
  const n = (p.name || '').toLowerCase();
  const o = (p.owner || '').toLowerCase();
  return n.includes('natu') || n.includes('adyg') || n.includes('circ') || o.includes('natu') || o.includes('adyg') || o.includes('cir');
});
console.log(circassProvs.map(p => ({ id: p.id, name: p.name, owner: p.owner })));

console.log('Cieszyn / Teschen / Ciszyn:');
const cieszProvs = provs.filter(p => {
  const n = (p.name || '').toLowerCase();
  const o = (p.owner || '').toLowerCase();
  return n.includes('ciesz') || n.includes('tesch') || n.includes('cisz') || o.includes('cies') || o.includes('tesch');
});
console.log(cieszProvs.map(p => ({ id: p.id, name: p.name, owner: p.owner })));

console.log('Guria / Gurien:');
const guriaProvs = provs.filter(p => {
  const n = (p.name || '').toLowerCase();
  const o = (p.owner || '').toLowerCase();
  return n.includes('guri') || o.includes('guri');
});
console.log(guriaProvs.map(p => ({ id: p.id, name: p.name, owner: p.owner })));

console.log('Tecklenburg / Lingen:');
const teckProvs = provs.filter(p => {
  const n = (p.name || '').toLowerCase();
  const o = (p.owner || '').toLowerCase();
  return n.includes('teck') || n.includes('ling') || o.includes('teck');
});
console.log(teckProvs.map(p => ({ id: p.id, name: p.name, owner: p.owner })));

console.log('Crimea / Krim:');
const crimeaProvs = provs.filter(p => {
  const n = (p.name || '').toLowerCase();
  const o = (p.owner || '').toLowerCase();
  return n.includes('krim') || n.includes('crimea') || o.includes('kri') || o.includes('crm');
});
console.log(crimeaProvs.slice(0, 10).map(p => ({ id: p.id, name: p.name, owner: p.owner })));
console.log('Crimea total matches:', crimeaProvs.length);
