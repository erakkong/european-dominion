const fs = require('fs');
const path = require('path');

const savesDir = path.join(__dirname, '../saves');
if (!fs.existsSync(savesDir)) fs.mkdirSync(savesDir, { recursive: true });

function saveGameState(simulationState, saveName = null) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const name = saveName || `save_${simulationState.date.year}_${simulationState.date.month}_${simulationState.date.day}_${timestamp}`;
  const filepath = path.join(savesDir, `${name}.json`);

  const saveData = {
    saveName: name,
    savedAt: new Date().toISOString(),
    state: simulationState
  };

  fs.writeFileSync(filepath, JSON.stringify(saveData));
  console.log(`[SAVE] Game state saved successfully to ${name}.json`);
  return { success: true, saveName: name };
}

function loadGameState(saveName) {
  const filepath = path.join(savesDir, `${saveName}.json`);
  if (!fs.existsSync(filepath)) {
    return { success: false, error: 'Save file not found' };
  }

  const raw = fs.readFileSync(filepath, 'utf8');
  const parsed = JSON.parse(raw);
  console.log(`[LOAD] Game state loaded from ${saveName}.json`);
  return { success: true, data: parsed.state };
}

function listSaves() {
  if (!fs.existsSync(savesDir)) return [];
  const files = fs.readdirSync(savesDir).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const stat = fs.statSync(path.join(savesDir, f));
    return {
      name: f.replace('.json', ''),
      size: stat.size,
      modified: stat.mtime
    };
  }).sort((a, b) => b.modified - a.modified);
}

module.exports = {
  saveGameState,
  loadGameState,
  listSaves
};
