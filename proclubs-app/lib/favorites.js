// Device-local favorites - no servers, no accounts. Everything lives in
// this browser's localStorage, so favorites don't follow the user to
// another phone or browser, and nothing about them is ever sent anywhere.

const KEY = "clubslookup:favorites";

function readAll() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Private browsing / storage disabled / corrupted value - fail quiet.
    return [];
  }
}

function writeAll(list) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Storage full or disabled - nothing we can do, fail quiet.
  }
}

export function getFavorites() {
  return readAll();
}

export function isFavorited(clubId, platform) {
  return readAll().some((f) => String(f.clubId) === String(clubId) && f.platform === platform);
}

export function addFavorite({ clubId, platform, name }) {
  const list = readAll();
  if (list.some((f) => String(f.clubId) === String(clubId) && f.platform === platform)) return;
  list.push({ clubId: String(clubId), platform, name: name || "Unknown club", savedAt: Date.now() });
  writeAll(list);
}

export function removeFavorite(clubId, platform) {
  writeAll(readAll().filter((f) => !(String(f.clubId) === String(clubId) && f.platform === platform)));
}

export function toggleFavorite({ clubId, platform, name }) {
  if (isFavorited(clubId, platform)) {
    removeFavorite(clubId, platform);
  } else {
    addFavorite({ clubId, platform, name });
  }
}
