// Login attempt limit: 5 wrong passwords per user or 20 per computer, 15-minute window
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_USER = 5;
const MAX_PER_IP = 20;
const failures = new Map();

function entry(key) {
  const e = failures.get(key);
  if (e && Date.now() - e.first > WINDOW_MS) { failures.delete(key); return null; }
  return e || null;
}
function minutesLeft(e) { return Math.max(1, Math.ceil((e.first + WINDOW_MS - Date.now()) / 60000)); }
const userKey = (ip, username) => 'u:' + ip + ':' + String(username).toLowerCase();
const ipKey = ip => 'i:' + ip;

// Minutes left to wait (0 = allowed)
function blocked(ip, username) {
  const u = entry(userKey(ip, username)), i = entry(ipKey(ip));
  if (u && u.count >= MAX_PER_USER) return minutesLeft(u);
  if (i && i.count >= MAX_PER_IP) return minutesLeft(i);
  return 0;
}

function fail(ip, username) {
  for (const key of [userKey(ip, username), ipKey(ip)]) {
    const e = entry(key) || { count: 0, first: Date.now() };
    e.count += 1;
    failures.set(key, e);
  }
}

function reset(ip, username) { failures.delete(userKey(ip, username)); }

setInterval(() => { for (const key of failures.keys()) entry(key); }, WINDOW_MS).unref();

module.exports = { blocked, fail, reset, MAX_PER_USER, clearAll: () => failures.clear() };
