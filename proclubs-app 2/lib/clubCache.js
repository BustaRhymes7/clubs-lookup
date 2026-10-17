// Client-side cache for club data so revisiting a club (or tapping a
// search result we already prefetched) shows instantly, then refreshes in
// the background. Lives in sessionStorage, so it's per-tab and short-lived.

const PREFIX = "clubCache:v1:";
const MAX_AGE_MS = 10 * 60 * 1000;
const inflight = new Map();

export function clubCacheKey(clubId, platform, matchType) {
  return `${clubId}:${platform}:${matchType}`;
}

export function readClubCache(key) {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (!entry?.data || Date.now() - entry.savedAt > MAX_AGE_MS) return null;
    return entry;
  } catch {
    return null;
  }
}

export function writeClubCache(key, data) {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // Storage full or blocked - caching is optional, so ignore.
  }
}

// Fetches /api/club, sharing one request between callers asking for the
// same thing at the same time (e.g. a prefetch that's still running when
// the club page opens). Full responses are written to the cache.
export function fetchClub(clubId, platform, matchType, only) {
  const params = new URLSearchParams({ matchType, platform });
  if (only) params.set("only", only);
  const url = `/api/club/${clubId}?${params.toString()}`;
  if (inflight.has(url)) return inflight.get(url);

  const promise = fetch(url)
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load club");
      if (!only) writeClubCache(clubCacheKey(clubId, platform, matchType), data);
      return data;
    })
    .finally(() => inflight.delete(url));
  inflight.set(url, promise);
  return promise;
}

export function prefetchClub(clubId, platform, matchType = "leagueMatch") {
  if (!clubId || readClubCache(clubCacheKey(clubId, platform, matchType))) return;
  fetchClub(clubId, platform, matchType).catch(() => {});
}
