const fs = require('fs');
const path = require('path');

const chatFilePath = path.join(__dirname, '../data/chat_history.json');

// Initial system announcement if empty
const defaultHistory = [
  {
    id: 'system_welcome',
    userId: 'system',
    username: 'Reichskanzlei',
    role: 'system',
    nationTag: null,
    nationName: 'Europäischer Kurier',
    nationColor: 'rgb(245, 158, 11)',
    text: 'Willkommen in der diplomatischen Depeschenkammer von European Dominion! Angemeldete Herrscher können hier Botschaften austauschen.',
    timestamp: '16:18',
    time: Date.now()
  }
];

let chatHistory = [];

function loadHistory() {
  try {
    if (fs.existsSync(chatFilePath)) {
      const data = JSON.parse(fs.readFileSync(chatFilePath, 'utf8'));
      if (Array.isArray(data) && data.length > 0) {
        chatHistory = data;
        return;
      }
    }
  } catch (err) {
    console.error('[CHAT] Error loading chat history:', err.message);
  }
  chatHistory = [...defaultHistory];
  saveHistory();
}

function saveHistory() {
  try {
    fs.writeFileSync(chatFilePath, JSON.stringify(chatHistory.slice(-100), null, 2), 'utf8');
  } catch (err) {
    console.error('[CHAT] Error saving chat history:', err.message);
  }
}

// Initialize on module load
loadHistory();

function getHistory() {
  return chatHistory.slice(-100);
}

function addMessage({ user, text, simulation }) {
  if (!user) {
    return { success: false, error: 'Nicht angemeldet.' };
  }

  const cleanText = (text || '').trim();
  if (!cleanText) {
    return { success: false, error: 'Nachricht darf nicht leer sein.' };
  }
  if (cleanText.length > 500) {
    return { success: false, error: 'Nachricht darf maximal 500 Zeichen lang sein.' };
  }

  let nationName = 'Reichsunmittelbar';
  let nationColor = 'rgb(148, 163, 184)';
  const nationTag = user.nationTag || (user.role === 'admin' ? simulation?.playerNation : null);

  if (nationTag && simulation?.nations && simulation.nations[nationTag]) {
    const nat = simulation.nations[nationTag];
    nationName = nat.name || nationTag;
    nationColor = nat.color || nationColor;
  } else if (user.role === 'admin') {
    nationName = 'Spielleitung (Admin)';
    nationColor = 'rgb(245, 158, 11)';
  }

  const now = new Date();
  const timeString = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  const message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId: user.id || user.username,
    username: user.username,
    role: user.role || 'player',
    nationTag: nationTag,
    nationName: nationName,
    nationColor: nationColor,
    text: cleanText,
    timestamp: timeString,
    time: Date.now()
  };

  chatHistory.push(message);
  if (chatHistory.length > 100) {
    chatHistory = chatHistory.slice(-100);
  }
  saveHistory();

  return { success: true, message };
}

module.exports = {
  getHistory,
  addMessage
};
