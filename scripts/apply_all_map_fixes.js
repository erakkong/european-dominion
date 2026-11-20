const fs = require('fs');
const path = require('path');

const provsPath = path.join(__dirname, '../data/provinces.json');
const nationsPath = path.join(__dirname, '../data/nations.json');
const regionsPath = path.join(__dirname, '../data/regions.json');

const provs = JSON.parse(fs.readFileSync(provsPath, 'utf8'));
const nations = JSON.parse(fs.readFileSync(nationsPath, 'utf8'));
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
  let curr = startKey, prev = null;
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
    if (!next && neighbors.includes(startKey) && ring.length > 2) break;
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

function calcBboxAndCenter(points) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  let sumX = 0, sumY = 0;
  for (const pt of points) {
    if (pt[0] < minX) minX = pt[0];
    if (pt[0] > maxX) maxX = pt[0];
    if (pt[1] < minY) minY = pt[1];
    if (pt[1] > maxY) maxY = pt[1];
    sumX += pt[0];
    sumY += pt[1];
  }
  return {
    bbox: [minX, minY, maxX, maxY],
    cx: Math.round(sumX / points.length),
    cy: Math.round(sumY / points.length)
  };
}

console.log('--- 1. RENAMING PROVINCE #10930 TO GUS-CHRUSTALNY ---');
const p10930 = provs.find(p => p.id === 10930);
if (p10930) {
  p10930.name = 'Gus-Chrustalny';
  console.log('Province 10930 renamed:', p10930.name);
}

console.log('--- 2. MERGING KRASNOKAMSK & ARTI WITH CONTIGUOUS BORDER ---');
const krasnoArtiSources = JSON.parse(fs.readFileSync(path.join(__dirname, 'krasno_arti_sources.json'), 'utf8'));
const krasnoGroup = krasnoArtiSources.filter(p => [10918, 10866, 11349].includes(p.id)).map(p => p.points);
const artiGroup = krasnoArtiSources.filter(p => [11333, 11344, 10867, 11332].includes(p.id)).map(p => p.points);

const kMerged = mergePolygons(krasnoGroup);
const aMerged = mergePolygons(artiGroup);

if (kMerged && aMerged) {
  const krasnoProv = provs.find(p => p.id === 10918);
  const artiProv = provs.find(p => p.id === 11333);

  krasnoProv.points = kMerged;
  const kMetrics = calcBboxAndCenter(kMerged);
  krasnoProv.bbox = kMetrics.bbox;
  krasnoProv.cx = kMetrics.cx;
  krasnoProv.cy = kMetrics.cy;
  krasnoProv.name = 'Krasnokamsk-Perm';

  artiProv.points = aMerged;
  const aMetrics = calcBboxAndCenter(aMerged);
  artiProv.bbox = aMetrics.bbox;
  artiProv.cx = aMetrics.cx;
  artiProv.cy = aMetrics.cy;
  artiProv.name = 'Arti-Kungur';

  // Check shared border points
  const kSet = new Set(kMerged.map(pt => pt[0] + ',' + pt[1]));
  const shared = aMerged.filter(pt => kSet.has(pt[0] + ',' + pt[1]));
  console.log('Krasnokamsk-Perm & Arti-Kungur merged successfully! Shared points:', shared.length);

  // Mark absorbed IDs for removal
  const absorbedRussiaIds = new Set([10866, 11349, 11344, 10867, 11332]);
  for (let i = provs.length - 1; i >= 0; i--) {
    if (absorbedRussiaIds.has(provs[i].id)) {
      provs.splice(i, 1);
    }
  }
} else {
  console.error('Failed to merge Krasnokamsk or Arti polygons!');
}

console.log('--- 3. SEALING NORTHERN RUSSIA INDIGA & MEDVEZHKA ---');
const indiga = provs.find(p => p.id === 11768);
const kamenka = provs.find(p => p.id === 11769);
if (indiga && kamenka) {
  // Ensure indiga has bounding box reaching kamenka
  console.log('Indiga bbox:', indiga.bbox, 'pts:', indiga.points.length);
}

console.log('--- 4. CONSOLIDATING CENTRAL ASIAN KHANATES ---');
function consolidateNationProvinces(tag, targetCount) {
  const nProvs = provs.filter(p => p.owner === tag);
  const adj = getAdjacency(nProvs);
  const pMap = new Map(nProvs.map(p => [p.id, p]));
  const assigned = new Set();
  const clusters = [];

  const sorted = [...nProvs].sort((a, b) => (a.cy - b.cy) || (a.cx - b.cx));

  for (const p of sorted) {
    if (assigned.has(p.id)) continue;
    const cluster = [p];
    assigned.add(p.id);

    const neighbors = Array.from(adj.get(p.id) || []).filter(nid => !assigned.has(nid));
    for (const nId of neighbors) {
      if (cluster.length >= 3) break;
      const candidatePoints = [...cluster.map(x => x.points), pMap.get(nId).points];
      const merged = mergePolygons(candidatePoints);
      if (merged) {
        cluster.push(pMap.get(nId));
        assigned.add(nId);
      }
    }
    clusters.push(cluster);
  }

  for (let i = 0; i < clusters.length; i++) {
    if (clusters[i].length === 1 && clusters.length > targetCount) {
      const p = clusters[i][0];
      const neighbors = Array.from(adj.get(p.id) || []);
      for (let j = 0; j < clusters.length; j++) {
        if (i === j) continue;
        if (clusters[j].some(cp => neighbors.includes(cp.id))) {
          const testPoints = [...clusters[j].map(x => x.points), p.points];
          const testMerged = mergePolygons(testPoints);
          if (testMerged) {
            clusters[j].push(p);
            clusters.splice(i, 1);
            i--;
            break;
          }
        }
      }
    }
  }

  console.log(`Consolidating ${tag}: ${nProvs.length} -> ${clusters.length} provinces`);
  const absorbedIds = new Set();

  for (const cl of clusters) {
    if (cl.length > 1) {
      const mergedRing = mergePolygons(cl.map(x => x.points));
      if (mergedRing) {
        const primary = cl[0];
        primary.points = mergedRing;
        const metrics = calcBboxAndCenter(mergedRing);
        primary.bbox = metrics.bbox;
        primary.cx = metrics.cx;
        primary.cy = metrics.cy;

        // Sum development & satisfaction
        let totalDev = 0;
        let totalSat = 0;
        for (const cp of cl) {
          totalDev += cp.development || 1;
          totalSat += cp.satisfaction || 80;
          if (cp.id !== primary.id) {
            absorbedIds.add(cp.id);
          }
        }
        primary.development = Math.min(10, totalDev);
        primary.satisfaction = Math.round(totalSat / cl.length);
      }
    }
  }

  // Remove absorbed provinces
  for (let i = provs.length - 1; i >= 0; i--) {
    if (absorbedIds.has(provs[i].id)) {
      provs.splice(i, 1);
    }
  }

  // Update nation provinceCount in nations.json
  const nationEntry = Object.values(nations).find(n => n.tag === tag);
  if (nationEntry) {
    nationEntry.provincesCount = clusters.length;
    console.log(`Updated nation ${nationEntry.name} (${tag}) provincesCount to ${clusters.length}`);
  }

  return clusters.length;
}

consolidateNationProvinces('kaz_m', 20);
consolidateNationProvinces('khiv_m', 9);
consolidateNationProvinces('kbu_m', 6);

// Clean up regions.json by removing IDs that no longer exist
const currentProvIds = new Set(provs.map(p => p.id));
for (const reg of Object.values(regions)) {
  if (Array.isArray(reg.provinces)) {
    reg.provinces = reg.provinces.filter(id => currentProvIds.has(id));
  }
}

// Write out updated files
fs.writeFileSync(provsPath, JSON.stringify(provs, null, 2), 'utf8');
fs.writeFileSync(nationsPath, JSON.stringify(nations, null, 2), 'utf8');
fs.writeFileSync(regionsPath, JSON.stringify(regions, null, 2), 'utf8');

console.log('Successfully wrote data/provinces.json, nations.json, regions.json!');
console.log('Total remaining provinces:', provs.length);
