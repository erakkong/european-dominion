const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const usersPath = path.join(__dirname, '../data/users.json');

// In-memory token store: token -> user session
const sessions = new Map();

// Helper to safely read users
function readUsers() {
  if (!fs.existsSync(usersPath)) {
    const defaultUsers = [
      {
        id: 'admin_1',
        username: 'admin',
        password: 'admin-123',
        role: 'admin',
        nationTag: null,
        createdAt: new Date().toISOString()
      }
    ];
    fs.writeFileSync(usersPath, JSON.stringify(defaultUsers, null, 2), 'utf8');
    return defaultUsers;
  }

  try {
    const raw = fs.readFileSync(usersPath, 'utf8');
    const users = JSON.parse(raw);
    // Ensure admin exists
    const hasAdmin = users.some(u => u.username.toLowerCase() === 'admin');
    if (!hasAdmin) {
      users.unshift({
        id: 'admin_1',
        username: 'admin',
        password: 'admin-123',
        role: 'admin',
        nationTag: null,
        createdAt: new Date().toISOString()
      });
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf8');
    }
    return users;
  } catch (e) {
    console.error('[AUTH] Error reading users.json, recreating defaults:', e.message);
    const defaultUsers = [
      {
        id: 'admin_1',
        username: 'admin',
        password: 'admin-123',
        role: 'admin',
        nationTag: null,
        createdAt: new Date().toISOString()
      }
    ];
    fs.writeFileSync(usersPath, JSON.stringify(defaultUsers, null, 2), 'utf8');
    return defaultUsers;
  }
}

function writeUsers(users) {
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf8');
}

// Generate secure random token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Login
function loginUser(username, password) {
  if (!username || !password) {
    return { success: false, error: 'Benutzername und Passwort sind erforderlich.' };
  }

  const users = readUsers();
  const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());

  if (!user || user.password !== password) {
    return { success: false, error: 'Ungültiger Benutzername oder falsches Passwort.' };
  }

  const token = generateToken();
  const sessionUser = {
    id: user.id,
    username: user.username,
    role: user.role,
    nationTag: user.nationTag || null
  };
  sessions.set(token, sessionUser);

  return {
    success: true,
    token,
    user: sessionUser
  };
}

// Register (1 Nation per User rule!)
function registerUser(username, password, nationTag, nationsList) {
  const cleanUsername = (username || '').trim();
  const cleanPassword = (password || '').trim();

  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, error: 'Der Benutzername muss mindestens 3 Zeichen lang sein.' };
  }
  if (!cleanPassword || cleanPassword.length < 4) {
    return { success: false, error: 'Das Passwort muss mindestens 4 Zeichen lang sein.' };
  }
  if (!nationTag) {
    return { success: false, error: 'Bitte wähle eine Nation für dein Spielerkonto aus.' };
  }

  const users = readUsers();

  // Check username collision
  if (users.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
    return { success: false, error: `Der Benutzername "${cleanUsername}" ist bereits vergeben.` };
  }

  // Check valid nation
  const nation = nationsList.find(n => n.tag === nationTag);
  if (!nation) {
    return { success: false, error: 'Die ausgewählte Nation existiert nicht.' };
  }

  // Enforce 1 NATION PER USER rule!
  const alreadyClaimed = users.find(u => u.role !== 'admin' && u.nationTag === nationTag);
  if (alreadyClaimed) {
    return {
      success: false,
      error: `Die Nation "${nation.name}" ist bereits von Spieler "${alreadyClaimed.username}" belegt! Wähle eine freie Nation.`
    };
  }

  const newUser = {
    id: `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    username: cleanUsername,
    password: cleanPassword,
    role: 'player',
    nationTag: nationTag,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeUsers(users);

  const token = generateToken();
  const sessionUser = {
    id: newUser.id,
    username: newUser.username,
    role: newUser.role,
    nationTag: newUser.nationTag
  };
  sessions.set(token, sessionUser);

  return {
    success: true,
    token,
    user: sessionUser
  };
}

// Get claimed nations map: nationTag -> username
function getClaimedNations() {
  const users = readUsers();
  const claimed = {};
  for (const u of users) {
    if (u.role !== 'admin' && u.nationTag) {
      claimed[u.nationTag] = u.username;
    }
  }
  return claimed;
}

// Validate token from request
function getUserFromToken(token) {
  if (!token) return null;
  return sessions.get(token) || null;
}

// Logout
function logoutUser(token) {
  if (token) {
    sessions.delete(token);
  }
}

// Admin reassign nation
function adminSetUserNation(targetUsername, newNationTag, nationsList) {
  const users = readUsers();
  const user = users.find(u => u.username.toLowerCase() === targetUsername.toLowerCase());
  if (!user) {
    return { success: false, error: 'Benutzer nicht gefunden.' };
  }

  if (newNationTag) {
    const nation = nationsList.find(n => n.tag === newNationTag);
    if (!nation) {
      return { success: false, error: 'Ungültige Nation.' };
    }
    // Check if taken by another non-admin user
    const takenBy = users.find(u => u.username.toLowerCase() !== targetUsername.toLowerCase() && u.role !== 'admin' && u.nationTag === newNationTag);
    if (takenBy) {
      return { success: false, error: `Bereits vergeben an ${takenBy.username}.` };
    }
  }

  user.nationTag = newNationTag;
  writeUsers(users);

  // Update live session if user is logged in
  for (const [token, s] of sessions.entries()) {
    if (s.username.toLowerCase() === targetUsername.toLowerCase()) {
      s.nationTag = newNationTag;
    }
  }

  return { success: true, user: { id: user.id, username: user.username, role: user.role, nationTag: user.nationTag } };
}

module.exports = {
  readUsers,
  loginUser,
  registerUser,
  getClaimedNations,
  getUserFromToken,
  logoutUser,
  adminSetUserNation
};
