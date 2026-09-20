"use client";

// Favorites live entirely in this browser's localStorage - no server, no
// account, nothing sent anywhere. That also means they don't sync across
// devices or browsers, and are lost if the user clears site data.
const KEY = "clubslookup:favorites";

function readAll() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeAll(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // localStorage unavailable (private browsing, storage full, etc.) -
    // favoriting silently becomes a no-op rather than crashing the app.
  }
}

function favoriteId(clubId, platform) {
  return `${platform}:${clubId}`;
}

export function getFavorites() {
  return readAll().sort((a, b) => b.savedAt - a.savedAt);
}

export function isFavorited(clubId, platform) {
  const id = favoriteId(clubId, platform);
  return readAll().some((f) => favoriteId(f.clubId, f.platform) === id);
}

export function addFavorite({ clubId, platform, name }) {
  const list = readAll();
  const id = favoriteId(clubId, platform);
  if (list.some((f) => favoriteId(f.clubId, f.platform) === id)) return list;
  const next = [...list, { clubId, platform, name, savedAt: Date.now() }];
  writeAll(next);
  return next;
}

export function removeFavorite(clubId, platform) {
  const id = favoriteId(clubId, platform);
  const next = readAll().filter((f) => favoriteId(f.clubId, f.platform) !== id);
  writeAll(next);
  return next;
}

export function toggleFavorite({ clubId, platform, name }) {
  return isFavorited(clubId, platform)
    ? removeFavorite(clubId, platform)
    : addFavorite({ clubId, platform, name });
}
