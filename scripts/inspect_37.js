const fs = require('fs');
const provs = JSON.parse(fs.readFileSync('data/provinces.json', 'utf8'));

const targetIds = [
  259, // Less Martins (Guernsey)
  258, // St. Helier (Jersey)
  11390, // Santa Cruz das flores (Flores)
  11388, // Angra do hero ismo (Terceira)
  11389, // Ponta del garda (Ponta Delgada / São Miguel)
  10021, // Ceuta
  85, // Gibraltar
  10023, // Melilla
  2274, // Ibiza
  4693, // Pantelleria
  3218, // Mesta (Chios)
  3220, // Myrina (Lemnos)
  3217, // Andros
  12576, // Tinos
  12573, // Coressia (Kea)
  12116, // Adamas (Milos)
  12511, // Naxos
  12577, // Sikinos
  12509, // Pira (Fira / Santorini)
  12570, // Samos
  3219, // Ikaria
  12571, // Kampos (Patmos)
  12127, // Liros (Leros)
  12572, // Kos
  3216, // Eresos (Lesbos)
  2228, // Corfu
  3044, // Dubrovnik
  3075, // Macarska (Makarska)
  6826, // Zadar
  3132, // Mali losinj
  2302, // Pula
  6828, // Porz (Poreč)
  7347, // Labin
  3079, // Gospic
  3077, // Sibenik
  165, // Venedig
  11768 // Indiga
];

console.log('=== INSPECTING THE 37 PROVINCES ===');
for (const id of targetIds) {
  const p = provs.find(x => x.id === id);
  if (!p) {
    console.log(`ID ${id} NOT FOUND!`);
    continue;
  }
  // Check for flat lines or boxy cuts
  const pts = p.points || [];
  let flatEdges = 0;
  for (let i = 0; i < pts.length; i++) {
    const p1 = pts[i];
    const p2 = pts[(i + 1) % pts.length];
    if (p1[0] === p2[0] || p1[1] === p2[1]) {
      const len = Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);
      if (len >= 5) flatEdges++;
    }
  }
  console.log(`${p.id} | ${p.name.padEnd(24)} | bbox: [${p.bbox}] | pts: ${pts.length} | flatEdges: ${flatEdges} | cx/cy: (${p.cx}, ${p.cy})`);
}
