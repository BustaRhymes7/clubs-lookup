// TEMPORARY stat overrides (prank). After OVERRIDES_EXPIRE_AT passes the
// real EA stats come back automatically - nothing needs to be redeployed.
// To end it early, set the date to the past or delete this file and its
// import in app/api/club/[id]/route.js.
const OVERRIDES_EXPIRE_AT = Date.parse("2026-10-17T06:00:00Z");

const num = (v) => Number(v) || 0;
const nameOf = (m) => String(m?.name ?? m?.proName ?? "").trim().toLowerCase();

function topOf(members, key, skip) {
  return Math.max(0, ...members.filter((m) => !skip.has(nameOf(m))).map((m) => num(m[key])));
}

export function applyStatOverrides(members) {
  if (!Array.isArray(members) || Date.now() > OVERRIDES_EXPIRE_AT) return members;

  const stars = new Set(["juzaveiro", "lazy_panda94"]);
  const skip = new Set([...stars, "j_kagchelland"]);
  const topGoals = topOf(members, "goals", skip);
  const topAssists = topOf(members, "assists", skip);
  const topMotm = topOf(members, "manOfTheMatch", skip);

  return members.map((m) => {
    const name = nameOf(m);
    const games = num(m.gamesPlayed);

    if (name === "juzaveiro") {
      return {
        ...m,
        goals: String(Math.max(Math.round(num(m.goals) * 1.2), Math.round(topGoals * 1.35) + 4)),
        assists: String(Math.max(Math.round(num(m.assists) * 1.2), Math.round(topAssists * 1.1) + 3)),
        manOfTheMatch: String(Math.max(num(m.manOfTheMatch), topMotm + 3, Math.round(games * 0.35))),
        ratingAve: "8.9",
        winRate: String(Math.max(num(m.winRate), 74)),
        passSuccessRate: "86",
        shotSuccessRate: "64",
        tackleSuccessRate: "58",
        redCards: "0",
      };
    }

    if (name === "lazy_panda94") {
      return {
        ...m,
        goals: String(Math.max(Math.round(num(m.goals) * 1.2), Math.round(topGoals * 1.15) + 2)),
        assists: String(Math.max(Math.round(num(m.assists) * 1.2), Math.round(topAssists * 1.3) + 4)),
        manOfTheMatch: String(Math.max(num(m.manOfTheMatch), topMotm + 1, Math.round(games * 0.28))),
        ratingAve: "8.6",
        winRate: String(Math.max(num(m.winRate), 71)),
        passSuccessRate: "89",
        shotSuccessRate: "57",
        tackleSuccessRate: "61",
        redCards: "0",
      };
    }

    if (name === "j_kagchelland") {
      return {
        ...m,
        goals: "0",
        assists: "0",
        manOfTheMatch: "0",
        ratingAve: "3.8",
        winRate: "6",
        passSuccessRate: "31",
        shotSuccessRate: "4",
        tackleSuccessRate: "9",
        redCards: String(Math.max(num(m.redCards), Math.round(games * 0.4), 7)),
        cleanSheetsDef: "0",
      };
    }

    return m;
  });
}
