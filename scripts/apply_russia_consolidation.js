const fs = require('fs');
const path = require('path');

const provsPath = path.join(__dirname, '../data/provinces.json');
const regionsPath = path.join(__dirname, '../data/regions.json');

const provs = JSON.parse(fs.readFileSync(provsPath, 'utf8'));
const regions = JSON.parse(fs.readFileSync(regionsPath, 'utf8'));

function mergePolygons(polys) {
  const edgeCount = new Map();
  const edges = [];

  for (const poly of polys) {
    for (let i = 0; i < poly.length; i++) {
      const u = poly[i];
      const v = poly[(i + 1) % poly.length];
      const uKey = u[0] + ',' + u[1];
      const vKey = v[0] + ',' + v[1];
      if (uKey === vKey) continue;
      const unKey = uKey < vKey ? (uKey + '|' + vKey) : (vKey + '|' + uKey);
      edgeCount.set(unKey, (edgeCount.get(unKey) || 0) + 1);
      edges.push({ uKey, vKey, u, v, unKey });
    }
  }

  const boundaryEdges = edges.filter(e => edgeCount.get(e.unKey) === 1);
  if (boundaryEdges.length === 0) return null;

  const adj = new Map();
  const ptMap = new Map();
  for (const e of boundaryEdges) {
    ptMap.set(e.uKey, e.u);
    ptMap.set(e.vKey, e.v);
    if (!adj.has(e.uKey)) adj.set(e.uKey, new Set());
    if (!adj.has(e.vKey)) adj.set(e.vKey, new Set());
    adj.get(e.uKey).add(e.vKey);
    adj.get(e.vKey).add(e.uKey);
  }

  const startKey = boundaryEdges[0].uKey;
  let curr = startKey;
  let prev = null;
  const ring = [];
  const visited = new Set();

  while (curr) {
    visited.add(curr);
    ring.push(ptMap.get(curr));
    const neighbors = Array.from(adj.get(curr) || []);
    let next = null;
    for (const n of neighbors) {
      if (n !== prev && !visited.has(n)) {
        next = n;
        break;
      }
    }
    if (!next && neighbors.includes(startKey) && ring.length > 2) {
      break;
    }
    prev = curr;
    curr = next;
  }

  return ring.length >= 3 ? ring : null;
}

function getAdjacency(provincesList) {
  const adj = new Map();
  const coordToProv = new Map();
  for (const p of provincesList) {
    adj.set(p.id, new Set());
    for (const pt of p.points) {
      const key = pt[0] + ',' + pt[1];
      if (!coordToProv.has(key)) coordToProv.set(key, []);
      coordToProv.get(key).push(p.id);
    }
  }
  for (const [, pids] of coordToProv.entries()) {
    if (pids.length > 1) {
      for (let i = 0; i < pids.length; i++) {
        for (let j = i + 1; j < pids.length; j++) {
          adj.get(pids[i]).add(pids[j]);
          adj.get(pids[j]).add(pids[i]);
        }
      }
    }
  }
  return adj;
}

const rus = provs.filter(p => p.owner === 'rus3_m');
console.log('Total Russian provinces before consolidation:', rus.length);

// 1. Zone 1: Far East (cx >= 4300) -> Large mega-provinces (clusters of 3-4)
const z1 = rus.filter(p => p.cx >= 4300);
const z1Adj = getAdjacency(z1);
const z1Assigned = new Set();
const z1Clusters = [];

for (const p of z1) {
  if (z1Assigned.has(p.id)) continue;
  const cluster = [p];
  z1Assigned.add(p.id);
  const neighbors = Array.from(z1Adj.get(p.id) || []).filter(nid => !z1Assigned.has(nid));
  for (const nid of neighbors) {
    if (cluster.length >= 3) break;
    const np = z1.find(x => x.id === nid);
    if (np) {
      cluster.push(np);
      z1Assigned.add(nid);
    }
  }
  z1Clusters.push(cluster);
}

// 2. Zone 2: Mid-East / Urals (3900 <= cx < 4300) -> Medium provinces (pairs of 2)
const z2 = rus.filter(p => p.cx >= 3900 && p.cx < 4300);
const z2Adj = getAdjacency(z2);
const z2Assigned = new Set();
const z2Clusters = [];

for (const p of z2) {
  if (z2Assigned.has(p.id)) continue;
  const cluster = [p];
  z2Assigned.add(p.id);
  const neighbors = Array.from(z2Adj.get(p.id) || []).filter(nid => !z2Assigned.has(nid));
  if (neighbors.length > 0) {
    const np = z2.find(x => x.id === neighbors[0]);
    if (np) {
      cluster.push(np);
      z2Assigned.add(np.id);
    }
  }
  z2Clusters.push(cluster);
}

const absorbedIds = new Set();
let mergedClusterCount = 0;

function applyCluster(cluster) {
  if (cluster.length <= 1) return;
  const ring = mergePolygons(cluster.map(p => p.points));
  if (!ring) {
    console.warn('Failed to merge cluster around', cluster[0].name);
    return;
  }
  const base = cluster[0];
  base.points = ring;

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  let sumX = 0, sumY = 0;
  for (const [x, y] of ring) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    sumX += x;
    sumY += y;
  }
  base.bbox = [minX, minY, maxX, maxY];
  base.cx = Math.round(sumX / ring.length);
  base.cy = Math.round(sumY / ring.length);

  for (let i = 1; i < cluster.length; i++) {
    const other = cluster[i];
    base.population = (base.population || 5000) + (other.population || 5000);
    base.development = Math.max(base.development || 3, other.development || 3);
    absorbedIds.add(other.id);
  }
  mergedClusterCount++;
}

for (const cl of z1Clusters) applyCluster(cl);
for (const cl of z2Clusters) applyCluster(cl);

console.log(`Merged ${mergedClusterCount} clusters. Absorbed ${absorbedIds.size} provinces.`);

// Filter out absorbed provinces
const finalProvs = provs.filter(p => !absorbedIds.has(p.id));

// Fix Amsterdam coordinates (p.id === 6502)
const amsterdam = finalProvs.find(p => p.id === 6502 || p.name === 'Amsterdam');
if (amsterdam) {
  amsterdam.cx = 1978;
  amsterdam.cy = 1993;
  console.log('Fixed Amsterdam center to:', amsterdam.cx, amsterdam.cy);
}

// Update regions
for (const [rId, reg] of Object.entries(regions)) {
  if (reg.provinces) {
    reg.provinces = reg.provinces.filter(pid => !absorbedIds.has(pid));
  }
}

console.log('Final provinces count:', finalProvs.length, '(was ' + provs.length + ')');
const finalRus = finalProvs.filter(p => p.owner === 'rus3_m');
console.log('Final Russian provinces count:', finalRus.length, '(was ' + rus.length + ')');

const outPaths = [
  provsPath,
  path.join(__dirname, '../client/public/data/provinces.json'),
  path.join(__dirname, '../client/dist/data/provinces.json')
];

for (const op of outPaths) {
  if (fs.existsSync(path.dirname(op))) {
    fs.writeFileSync(op, JSON.stringify(finalProvs, null, 2), 'utf8');
    console.log('Wrote', op);
  }
}

const regPaths = [
  regionsPath,
  path.join(__dirname, '../client/public/data/regions.json'),
  path.join(__dirname, '../client/dist/data/regions.json')
];

for (const rp of regPaths) {
  if (fs.existsSync(path.dirname(rp))) {
    fs.writeFileSync(rp, JSON.stringify(regions, null, 2), 'utf8');
    console.log('Wrote', rp);
  }
}
