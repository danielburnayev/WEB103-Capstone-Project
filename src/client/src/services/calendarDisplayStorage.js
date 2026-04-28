const STORAGE_KEY = "insync-calendar-display";

function normalizeJoinCode(joinCode) {
  return `${joinCode || ""}`.trim().toUpperCase();
}

export function getCalendarDisplay(joinCode) {
  const key = normalizeJoinCode(joinCode);
  if (!key) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    const entry = all[key];
    if (!entry || typeof entry !== "object") return null;
    const username = typeof entry.username === "string" ? entry.username : "";
    const color = typeof entry.color === "string" ? entry.color : "";
    if (!username && !color) return null;
    return { username, color };
  } catch {
    return null;
  }
}

export function setCalendarDisplay(joinCode, { username, color }) {
  const key = normalizeJoinCode(joinCode);
  if (!key) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[key] = {
      username: `${username || ""}`.trim().slice(0, 50),
      color: color || "#3b82f6",
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

export function removeCalendarDisplay(joinCode) {
  const key = normalizeJoinCode(joinCode);
  if (!key) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    delete all[key];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}
