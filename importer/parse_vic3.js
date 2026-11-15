const fs = require('fs');
const path = require('path');

const v3Path = 'C:/Program Files (x86)/Steam/steamapps/common/Victoria 3/game/map_data/state_regions';

function parseVictoriaStateRegions() {
  const files = ['00_west_europe.txt', '01_south_europe.txt', '02_east_europe.txt', '08_middle_east.txt'];
  const regions = {};

  for (const file of files) {
    const fullPath = path.join(v3Path, file);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');

    // Regex to match STATE_NAME = { ... }
    const stateRegex = /(STATE_[A-Z0-9_]+)\s*=\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/g;
    let match;
    while ((match = stateRegex.exec(content)) !== null) {
      const stateKey = match[1];
      const body = match[2];

      const idMatch = body.match(/id\s*=\s*(\d+)/);
      const arableMatch = body.match(/arable_land\s*=\s*(\d+)/);
      const traitsMatch = body.match(/traits\s*=\s*\{([^}]+)\}/);
      const arableResMatch = body.match(/arable_resources\s*=\s*\{([^}]+)\}/);
      const cappedResMatch = body.match(/capped_resources\s*=\s*\{([^}]+)\}/);

      const traits = traitsMatch ? traitsMatch[1].trim().split(/\s+/).map(s => s.replace(/"/g, '')) : [];
      const arableResources = arableResMatch ? arableResMatch[1].trim().split(/\s+/).map(s => s.replace(/"/g, '')) : [];

      // Clean state name for display: STATE_BRANDENBURG -> Brandenburg
      const cleanName = stateKey
        .replace('STATE_', '')
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

      regions[stateKey] = {
        key: stateKey,
        name: cleanName,
        id: idMatch ? parseInt(idMatch[1], 10) : 0,
        arableLand: arableMatch ? parseInt(arableMatch[1], 10) : 20,
        traits: traits,
        arableResources: arableResources,
        bonuses: {
          taxEfficiency: 0.20,
          productionOutput: 0.15,
          adminCostReduction: 0.25,
          recruitmentSpeed: 0.20,
          throughput: 0.20
        }
      };
    }
  }

  return regions;
}

if (require.main === module) {
  const regions = parseVictoriaStateRegions();
  console.log(`Parsed ${Object.keys(regions).length} Victoria 3 European/Middle-East State Regions.`);
  console.log('Sample states:', Object.values(regions).slice(0, 10));
}

module.exports = { parseVictoriaStateRegions };
