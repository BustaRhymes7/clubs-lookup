// Thin wrapper around EA's unofficial, undocumented Pro Clubs API.
// This is not affiliated with or endorsed by EA. Endpoints can change
// or disappear at any time - see README.md for context.

const BASE_URL = "https://proclubs.ea.com/api/fc";

// EA fronts this with Akamai bot protection: requests that don't look
// like a real browser XHR call get an HTML error page instead of JSON.
// NOTE: even a full, realistic header set is not guaranteed to bypass
// this - Akamai scores cloud/datacenter IP ranges (Vercel, AWS, Cloudflare,
// etc.) down regardless of headers. If this is still returning 403 after
// deploying, it's very likely an IP-reputation block, not a header gap.
// See README.md "If you're getting 403 errors" for next steps.
const EA_HEADERS = {
  accept: "application/json",
  "accept-language": "en-US,en;q=0.9",
  "sec-ch-ua": '"Google Chrome";v="129", "Not?A_Brand";v="8", "Chromium";v="129"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "same-origin",
  origin: "https://proclubs.ea.com",
  referer: "https://proclubs.ea.com/en/clubs/search",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
};

// Platform pools EA groups consoles into. "common-gen5" is the default
// (current-gen + PC); the other two are exposed via the platform selector.
export const PLATFORMS = {
  "common-gen5": "PS5 / Xbox Series X|S / PC",
  "common-gen4": "PS4 / Xbox One",
  nx: "Nintendo Switch",
};
export const DEFAULT_PLATFORM = "common-gen5";

function normalizePlatform(platform) {
  return PLATFORMS[platform] ? platform : DEFAULT_PLATFORM;
}

async function eaFetch(path) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, { headers: EA_HEADERS, cache: "no-store" });

  if (!res.ok) {
    throw new Error(`EA API returned ${res.status} for ${path}`);
  }

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    // Akamai sometimes returns an HTML error page with a 200 status.
    throw new Error("EA API returned a non-JSON response (likely rate limited or blocked)");
  }
}

// --- Search & identity -------------------------------------------------

export function searchClubs(clubName, platform = DEFAULT_PLATFORM) {
  const p = normalizePlatform(platform);
  const q = encodeURIComponent(clubName);
  return eaFetch(`/allTimeLeaderboard/search?platform=${p}&clubName=${q}`);
}

export function getClubInfo(clubId, platform = DEFAULT_PLATFORM) {
  const p = normalizePlatform(platform);
  return eaFetch(`/clubs/info?platform=${p}&clubIds=${clubId}`);
}

// EA serves club crests from a separate image endpoint keyed by
// crestAssetId (found on info.customKit.crestAssetId). An id of 0/undefined
// means "no custom crest set" - there's nothing to fetch in that case.
export function getClubCrestUrl(crestAssetId, platform = DEFAULT_PLATFORM) {
  if (!crestAssetId || Number(crestAssetId) === 0) return null;
  const p = normalizePlatform(platform);
  return `${BASE_URL}/clubs/crest?platform=${p}&crestAssetId=${crestAssetId}`;
}

// --- Stats & history -----------------------------------------------------

export function getOverallStats(clubId, platform = DEFAULT_PLATFORM) {
  const p = normalizePlatform(platform);
  return eaFetch(`/clubs/overallStats?platform=${p}&clubIds=${clubId}`);
}

export function getPlayoffAchievements(clubId, platform = DEFAULT_PLATFORM) {
  const p = normalizePlatform(platform);
  // NOTE: this endpoint takes clubId (singular) - unlike every other
  // per-club endpoint here, which take clubIds (plural). Confirmed against
  // EA's actual query param naming; using clubIds here 400s.
  return eaFetch(`/club/playoffAchievements?platform=${p}&clubId=${clubId}`);
}

export function getClubMatches(clubId, matchType = "leagueMatch", platform = DEFAULT_PLATFORM) {
  const p = normalizePlatform(platform);
  return eaFetch(
    `/clubs/matches?platform=${p}&clubIds=${clubId}&matchType=${matchType}&maxResultCount=10`
  );
}

// --- Roster ----------------------------------------------------------------

export function getMemberStats(clubId, platform = DEFAULT_PLATFORM) {
  const p = normalizePlatform(platform);
  return eaFetch(`/members/stats?platform=${p}&clubId=${clubId}`);
}

export function getMemberCareerStats(clubId, platform = DEFAULT_PLATFORM) {
  const p = normalizePlatform(platform);
  return eaFetch(`/members/career/stats?platform=${p}&clubId=${clubId}`);
}

// --- Rankings ----------------------------------------------------------------

export function getCurrentSeasonLeaderboard(platform = DEFAULT_PLATFORM) {
  const p = normalizePlatform(platform);
  return eaFetch(`/currentSeasonLeaderboard?platform=${p}`);
}
