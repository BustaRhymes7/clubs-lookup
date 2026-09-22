"use client";

import { useState } from "react";

export const PLATFORM_OPTIONS = [
  { value: "common-gen5", label: "PS5 / Xbox Series X|S / PC" },
  { value: "common-gen4", label: "PS4 / Xbox One" },
  { value: "nx", label: "Nintendo Switch" },
];

export const MATCH_TYPES = [
  { value: "leagueMatch", label: "League" },
  { value: "playoffMatch", label: "Playoffs" },
  { value: "friendlyMatch", label: "Friendlies" },
];

export const TABS = [
  { value: "overview", label: "Overview" },
  { value: "matches", label: "Matches" },
];

// Turn a raw technical error (endpoint paths, status codes) into something
// a non-technical visitor can actually act on. The raw message is only
// shown via the hidden ?debug=1 mode.
export function toFriendlyError(message = "") {
  if (/403/.test(message)) {
    return "EA is blocking this request right now (their anti-bot system, not a bug on this site). Try again shortly — if it keeps happening, it may need a hosting change.";
  }
  if (/50\d/.test(message)) {
    return "EA's servers had a hiccup responding. Try again in a moment.";
  }
  if (/non-JSON/.test(message)) {
    return "EA sent back something unexpected, likely rate limiting. Wait a few seconds and try again.";
  }
  return "Couldn't reach EA's servers right now. Try again in a moment.";
}

export function ErrorNotice({ message, technical, showDetails, onToggleDetails }) {
  return (
    <div className="errorBox">
      <p style={{ margin: 0 }}>{message}</p>
      {technical && (
        <>
          <button type="button" className="errorDetailsToggle" onClick={onToggleDetails}>
            {showDetails ? "Hide" : "Show"} technical details
          </button>
          {showDetails && <p className="errorTechnical">{technical}</p>}
        </>
      )}
    </div>
  );
}

export function Stat({ label, value }) {
  return (
    <div className="statTile">
      <div className="statValue display">{value ?? "—"}</div>
      <div className="statLabel">{label}</div>
    </div>
  );
}

export function SectionStatus({ section, label, fallback }) {
  if (!section) return null;
  if (section.ok) return <p className="status">{fallback ?? `No ${label} returned.`}</p>;
  return (
    <p className="status" style={{ color: "#ffb020" }}>
      Couldn't load {label}: this endpoint may not be confirmed yet ({section.error}).
    </p>
  );
}

export function MatchRow({ match }) {
  const [expanded, setExpanded] = useState(false);
  const clubsObj = match?.clubs || {};
  const ids = Object.keys(clubsObj);
  const home = clubsObj[ids[0]];
  const away = clubsObj[ids[1]];
  const date = match?.timestamp ? new Date(match.timestamp * 1000).toLocaleDateString() : "";
  const playersByClub = match?.players || {};

  if (!home || !away) {
    return <div className="matchRow">Unrecognized match format — check raw response.</div>;
  }

  const anyRedCard = Object.values(playersByClub).some((clubPlayers) =>
    Object.values(clubPlayers || {}).some((p) => Number(p?.redcards) > 0)
  );

  return (
    <div>
      <button
        className="matchRow"
        style={{ width: "100%", cursor: "pointer", border: "1.5px solid #262c3d" }}
        onClick={() => setExpanded((v) => !v)}
      >
        <span>
          {home?.details?.name ?? ids[0]} vs {away?.details?.name ?? ids[1]}
          {anyRedCard ? " 🟥" : ""}
        </span>
        <span className="matchScore">
          {home?.goals ?? "?"} – {away?.goals ?? "?"}
        </span>
        <span className="matchDate">{date}</span>
      </button>
      {expanded && (
        <div style={{ marginTop: 6, marginBottom: 6 }}>
          {ids.map((id) => (
            <PlayerStatsTable
              key={id}
              teamName={clubsObj[id]?.details?.name ?? id}
              players={playersByClub[id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const MATCH_PLAYER_COLUMNS = [
  { key: "playername", label: "Player" },
  { key: "pos", label: "Pos" },
  { key: "goals", label: "G" },
  { key: "assists", label: "A" },
  { key: "shots", label: "Shots" },
  { key: "tacklesmade", label: "Tackles" },
  { key: "passesmade", label: "Passes" },
  { key: "passaccuracy", label: "Pass %" },
  { key: "saves", label: "Saves" },
  { key: "redcards", label: "🟥" },
  { key: "man_of_the_match", label: "MOTM" },
  { key: "rating", label: "Rating" },
];

// A couple of columns above (pass accuracy) aren't raw EA fields - they're
// computed from ones that are (passesmade / passattempts).
function derivedMatchStat(key, p) {
  if (key === "passaccuracy") {
    const made = Number(p?.passesmade);
    const attempts = Number(p?.passattempts);
    if (!attempts) return null;
    return `${Math.round((made / attempts) * 100)}%`;
  }
  return undefined; // not a derived field - fall through to the raw lookup
}

function PlayerStatsTable({ teamName, players }) {
  const list = players ? Object.values(players) : [];
  if (list.length === 0) {
    return <p className="status">No per-player stats for {teamName}.</p>;
  }
  return (
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      <p style={{ fontSize: 12, color: "#8b93a7", margin: "8px 0 4px" }}>{teamName}</p>
      <table className="dataTable">
        <thead>
          <tr>
            {MATCH_PLAYER_COLUMNS.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list.map((p, i) => (
            <tr key={i}>
              {MATCH_PLAYER_COLUMNS.map((c) => {
                  const derived = derivedMatchStat(c.key, p);
                  const value =
                    derived !== undefined
                      ? derived
                      : c.key === "man_of_the_match" || c.key === "redcards"
                        ? Number(p?.[c.key]) > 0
                          ? "✓"
                          : ""
                        : (p?.[c.key] ?? "—");
                  return (
                    <td key={c.key}>{value === null ? "—" : value}</td>
                  );
                })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Confirmed against EA's real clubMemberSchema (via the proclubs-sdk source).
const MEMBER_COLUMNS = [
  { key: ["name", "proName"], label: "Name" },
  { key: ["proPos", "favoritePosition"], label: "Pos" },
  { key: ["gamesPlayed"], label: "GP" },
  { key: ["goals"], label: "Goals" },
  { key: ["assists"], label: "Assists" },
  { key: ["manOfTheMatch"], label: "MOTM" },
  { key: ["redCards"], label: "🟥" },
  { key: ["winRate"], label: "Win %" },
  { key: ["ratingAve"], label: "Avg rating" },
];

export function pick(obj, keys) {
  for (const k of keys) {
    if (obj?.[k] != null) return obj[k];
  }
  return null;
}

export function MembersTable({ members }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="dataTable">
        <thead>
          <tr>
            {MEMBER_COLUMNS.map((col) => (
              <th key={col.label}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map((m, i) => (
            <tr key={m?.playerId ?? m?.name ?? i}>
              {MEMBER_COLUMNS.map((col) => (
                <td key={col.label}>{pick(m, col.key) ?? "—"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// EA's per-club endpoints (info, overallStats) have been seen keyed by
// clubId, e.g. { "123": {...} }. This normalizes that into one flat record.
export function extractRecord(data, clubId) {
  if (!data) return null;
  if (data[clubId]) return data[clubId];
  if (Array.isArray(data)) return data[0];
  const firstKey = Object.keys(data)[0];
  return firstKey ? data[firstKey] : data;
}

// members/stats and members/career/stats both return
// { members: [...], positionCount: {...} } - not a bare list. Pull the
// members array out specifically rather than flattening the wrapper object.
export function extractMembers(data) {
  if (!data) return null;
  if (Array.isArray(data.members)) return data.members;
  if (Array.isArray(data)) return data; // defensive, in case the shape changes
  return null;
}

// members/stats and list-shaped endpoints have been seen either as a plain
// array, or as an object keyed by id. Normalize both into a flat array.
export function extractList(data) {
  if (!data) return null;
  if (Array.isArray(data)) return data;
  if (typeof data === "object") return Object.values(data);
  return null;
}

export function ClubSkeleton() {
  return (
    <div aria-live="polite" aria-busy="true">
      <div className="skeletonLine" style={{ width: "50%", height: 28, marginBottom: 24 }} />
      <div className="statGrid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeletonTile" />
        ))}
      </div>
    </div>
  );
}

// --- Form (recent match results as W/D/L chips) -----------------------

export function computeForm(matches, clubId, limit = 5) {
  if (!Array.isArray(matches)) return [];
  const idStr = String(clubId);
  const results = [];
  for (const m of matches) {
    const clubsObj = m?.clubs || {};
    const side = clubsObj[idStr];
    const oppId = Object.keys(clubsObj).find((id) => id !== idStr);
    const opp = oppId ? clubsObj[oppId] : null;
    if (!side || !opp) continue;
    const g = Number(side.goals);
    const og = Number(opp.goals);
    if (Number.isNaN(g) || Number.isNaN(og)) continue;
    results.push(g > og ? "W" : g < og ? "L" : "D");
    if (results.length >= limit) break;
  }
  return results;
}

export function FormStrip({ form }) {
  if (!form || form.length === 0) return null;
  return (
    <div className="formStrip">
      <span className="fieldLabel" style={{ marginBottom: 0 }}>
        FORM
      </span>
      <div className="formChips">
        {form.map((r, i) => (
          <span key={i} className={`formChip form${r}`}>
            {r}
          </span>
        ))}
      </div>
    </div>
  );
}

// The most recent unbroken run of identical results, read off the front of
// the form array (form[0] is the most recent match).
function computeStreak(form) {
  if (!form || form.length === 0) return null;
  const current = form[0];
  let count = 0;
  for (const r of form) {
    if (r !== current) break;
    count++;
  }
  const label = current === "W" ? "Win streak" : current === "L" ? "Losing streak" : "Unbeaten run";
  return { count, label, type: current };
}

// Colored win/draw/loss record, a win-rate bar, and a streak callout - the
// dense "at a glance" summary block that sits above the stat tiles.
export function RecordSummary({ wins, losses, ties, goals, goalsAgainst, form }) {
  const w = Number(wins) || 0;
  const l = Number(losses) || 0;
  const t = Number(ties) || 0;
  const played = w + l + t;
  const winRate = played > 0 ? Math.round((w / played) * 100) : null;
  const goalDiff =
    goals != null && goalsAgainst != null ? Number(goals) - Number(goalsAgainst) : null;
  const streak = computeStreak(form);

  return (
    <div>
      <div className="recordRow">
        <div className="recordTile">
          <div className="recordValue recordW display">{wins ?? "—"}</div>
          <div className="statLabel">Wins</div>
        </div>
        <div className="recordTile">
          <div className="recordValue recordD display">{ties ?? "—"}</div>
          <div className="statLabel">Draws</div>
        </div>
        <div className="recordTile">
          <div className="recordValue recordL display">{losses ?? "—"}</div>
          <div className="statLabel">Losses</div>
        </div>
      </div>

      {winRate != null && (
        <div className="winRateBlock">
          <div className="winRateHeader">
            <span>Win rate</span>
            <span className="winRateValue">{winRate}%</span>
          </div>
          <div className="winRateTrack">
            <div className="winRateFill" style={{ width: `${winRate}%` }} />
          </div>
          {goalDiff != null && (
            <div className="status" style={{ padding: "6px 0 0", fontSize: 12 }}>
              {goals} scored / {goalsAgainst} conceded ({goalDiff >= 0 ? "+" : ""}
              {goalDiff} goal difference)
            </div>
          )}
        </div>
      )}

      {streak && streak.count >= 2 && (
        <div className={`streakCard streak${streak.type}`}>
          <span className="statLabel">Current streak</span>
          <span className="streakValue display">
            {streak.count} {streak.label}
          </span>
        </div>
      )}
    </div>
  );
}

// --- Player easter eggs -------------------------------------------------

const PLAYER_EASTER_EGGS = {
  juzaveiro: "THE GOAT",
  lazy_panda94: "USELAISEEEEE",
  "zan-shah": "3197 own goals and counting",
  abood_lajam: "L1 Triangle Merchant",
  theundisputed977: "The blind eagle strikes again… and misses yet again.",
  j_kagchelland: "He runs down the wing and his teammates are running back to defend.",
  rexsullivan: "Anddddd it's another red card for Sullivan.",
};

function getEasterEgg(player) {
  const candidates = [player?.proName, player?.name].filter(Boolean);
  for (const candidate of candidates) {
    const hit = PLAYER_EASTER_EGGS[String(candidate).trim().toLowerCase()];
    if (hit) return hit;
  }
  return null;
}

// --- Shared derived stats (goals+assists, completed passes, successful
// tackles, wins, clean sheets) used by both the podium score and the squad
// leaders swimlane. EA's API doesn't expose "completed passes" or
// "successful tackles" directly - only attempts + a success rate - so those
// two are derived by multiplying the two out.
function deriveMemberStats(m) {
  const goals = Number(pick(m, ["goals"])) || 0;
  const assists = Number(pick(m, ["assists"])) || 0;
  const gamesPlayed = Number(pick(m, ["gamesPlayed"])) || 0;
  const winRate = Number(pick(m, ["winRate"])) || 0;
  const winsField = pick(m, ["wins"]);
  const wins = winsField != null ? Number(winsField) : Math.round(gamesPlayed * (winRate / 100));
  const passesMade = Number(pick(m, ["passesMade"])) || 0;
  const passSuccessRate = Number(pick(m, ["passSuccessRate"])) || 0;
  const completedPasses = Math.round(passesMade * (passSuccessRate / 100));
  const tacklesMade = Number(pick(m, ["tacklesMade"])) || 0;
  const tackleSuccessRate = Number(pick(m, ["tackleSuccessRate"])) || 0;
  const successfulTackles = Math.round(tacklesMade * (tackleSuccessRate / 100));
  const cleanSheets =
    (Number(pick(m, ["cleanSheetsDef"])) || 0) + (Number(pick(m, ["cleanSheetsGK"])) || 0);
  return { goals, assists, wins, completedPasses, successfulTackles, cleanSheets };
}

// --- Podium (top 3 by weighted performance score) ------------------------
// Score = (goals+assists) 40% + completed passes 30% + tackle success % 30%,
// each normalized against the squad's own max so the three components (very
// different scales) are comparable before being weighted.

export function Podium({ members, onSelect }) {
  const withScore = members.map((m) => {
    const stats = deriveMemberStats(m);
    const tackleSuccessRate = Number(pick(m, ["tackleSuccessRate"])) || 0;
    return { member: m, ga: stats.goals + stats.assists, completedPasses: stats.completedPasses, tackleSuccessRate };
  });

  const maxGA = Math.max(...withScore.map((s) => s.ga), 1);
  const maxPasses = Math.max(...withScore.map((s) => s.completedPasses), 1);
  const maxTackle = Math.max(...withScore.map((s) => s.tackleSuccessRate), 1);

  const ranked = withScore
    .map((s) => ({
      player: s.member,
      score:
        (s.ga / maxGA) * 40 + (s.completedPasses / maxPasses) * 30 + (s.tackleSuccessRate / maxTackle) * 30,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (ranked.length < 3) return null;

  const [first, second, third] = ranked;
  const spots = [
    { entry: second, place: 2 },
    { entry: first, place: 1 },
    { entry: third, place: 3 },
  ];
  const medal = { 1: "🥇", 2: "🥈", 3: "🥉" };

  return (
    <div className="podium">
      {spots.map(({ entry, place }) => (
        <button
          key={place}
          className={`podiumSpot podiumSpot${place}`}
          onClick={() => onSelect(entry.player)}
        >
          <div className="podiumMedal">{medal[place]}</div>
          <div className="podiumName">{pick(entry.player, ["name", "proName"]) ?? "—"}</div>
          <div className="podiumRating">{entry.score.toFixed(1)} pts</div>
          <div className="podiumBase">{place}</div>
        </button>
      ))}
    </div>
  );
}

// --- Squad leaders swimlane -----------------------------------------------

export function SquadLeaders({ members }) {
  if (!members || members.length === 0) return null;

  const withStats = members.map((m) => ({ member: m, ...deriveMemberStats(m) }));

  const categories = [
    { label: "Top scorer", value: (s) => s.goals },
    { label: "Top assister", value: (s) => s.assists },
    { label: "Most wins", value: (s) => s.wins },
    { label: "Top G+A", value: (s) => s.goals + s.assists },
    { label: "Top passer", value: (s) => s.completedPasses },
    { label: "Top tackler", value: (s) => s.successfulTackles },
    { label: "Top clean sheets", value: (s) => s.cleanSheets },
  ];

  const leaders = categories
    .map(({ label, value }) => {
      let best = null;
      let bestValue = -Infinity;
      for (const s of withStats) {
        const v = value(s);
        if (v > bestValue) {
          bestValue = v;
          best = s;
        }
      }
      if (!best || bestValue <= 0) return null;
      return { label, value: bestValue, name: pick(best.member, ["name", "proName"]) ?? "—" };
    })
    .filter(Boolean);

  if (leaders.length === 0) return null;

  return (
    <div className="leaderRow">
      {leaders.map((l) => (
        <div className="leaderCard" key={l.label}>
          <div className="leaderLabel">{l.label}</div>
          <div className="leaderValue">{l.value}</div>
          <div className="leaderName">{l.name}</div>
        </div>
      ))}
    </div>
  );
}

// --- Squad list, player modal, and comparison ---------------------------

export function SquadSection({ members }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState([]);

  function handleRowClick(m) {
    if (compareMode) {
      setCompareSelection((prev) => {
        const name = pick(m, ["name", "proName"]);
        const already = prev.find((p) => pick(p, ["name", "proName"]) === name);
        if (already) return prev.filter((p) => p !== m);
        if (prev.length >= 2) return [prev[1], m];
        return [...prev, m];
      });
    } else {
      setSelectedPlayer(m);
    }
  }

  function toggleCompareMode() {
    setCompareMode((v) => !v);
    setCompareSelection([]);
  }

  return (
    <>
      <Podium members={members} onSelect={setSelectedPlayer} />

      <div className="tabRow" style={{ marginTop: 20, marginBottom: 12 }}>
        <button className={compareMode ? "chipActive" : "chip"} onClick={toggleCompareMode}>
          {compareMode ? "Exit compare" : "Compare players"}
        </button>
        {compareMode && (
          <span className="status" style={{ padding: "6px 0", fontSize: 12 }}>
            {compareSelection.length < 2
              ? `Pick ${2 - compareSelection.length} more player${compareSelection.length === 1 ? "" : "s"}`
              : "Comparing below"}
          </span>
        )}
      </div>

      {compareMode && compareSelection.length === 2 && (
        <PlayerCompare players={compareSelection} />
      )}

      <div className="squadList">
        {members.map((m, i) => {
          const name = pick(m, ["name", "proName"]) ?? "Player";
          const isSelected = compareSelection.some(
            (p) => pick(p, ["name", "proName"]) === name
          );
          return (
            <button
              key={i}
              className={isSelected ? "squadRowSelected" : "squadRow"}
              onClick={() => handleRowClick(m)}
            >
              <span className="squadName">{name}</span>
              <span className="squadMeta">
                {pick(m, ["proPos", "favoritePosition"]) ?? "—"} · {m.goals ?? 0}G · {m.assists ?? 0}A
              </span>
            </button>
          );
        })}
      </div>

      {selectedPlayer && (
        <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </>
  );
}

function PlayerCompare({ players }) {
  const rows = [
    { label: "Games played", key: ["gamesPlayed"] },
    { label: "Goals", key: ["goals"], higherIsBetter: true },
    { label: "Assists", key: ["assists"], higherIsBetter: true },
    { label: "MOTM", key: ["manOfTheMatch"], higherIsBetter: true },
    { label: "Red cards", key: ["redCards"], higherIsBetter: false },
    { label: "Win %", key: ["winRate"], higherIsBetter: true },
    { label: "Avg rating", key: ["ratingAve"], higherIsBetter: true },
    { label: "Passes made", key: ["passesMade"], higherIsBetter: true },
    { label: "Pass success %", key: ["passSuccessRate"], higherIsBetter: true },
    { label: "Tackles made", key: ["tacklesMade"], higherIsBetter: true },
    { label: "Tackle success %", key: ["tackleSuccessRate"], higherIsBetter: true },
    { label: "Shot success %", key: ["shotSuccessRate"], higherIsBetter: true },
  ];
  const [a, b] = players;
  const nameA = pick(a, ["name", "proName"]);
  const nameB = pick(b, ["name", "proName"]);

  let aWins = 0;
  let bWins = 0;
  const scored = rows.map((r) => {
    const av = pick(a, r.key);
    const bv = pick(b, r.key);
    if (r.higherIsBetter == null || av == null || bv == null || Number(av) === Number(bv)) {
      return { ...r, av, bv, winner: null };
    }
    const aBetter = r.higherIsBetter ? Number(av) > Number(bv) : Number(av) < Number(bv);
    if (aBetter) aWins++;
    else bWins++;
    return { ...r, av, bv, winner: aBetter ? "a" : "b" };
  });

  return (
    <div className="compareCard">
      <div className="compareHeader">
        <span>{nameA}</span>
        <span>{nameB}</span>
      </div>
      {scored.map((r) => (
        <div className="compareRow" key={r.label}>
          <span className={`compareValue${r.winner === "a" ? " compareWinner" : ""}`}>
            {r.winner === "a" ? "✓ " : ""}
            {r.av ?? "—"}
          </span>
          <span className="compareLabel">{r.label}</span>
          <span className={`compareValue${r.winner === "b" ? " compareWinner" : ""}`}>
            {r.winner === "b" ? "✓ " : ""}
            {r.bv ?? "—"}
          </span>
        </div>
      ))}
      {(aWins > 0 || bWins > 0) && (
        <div className="compareTally">
          {aWins === bWins
            ? `Tied ${aWins}-${bWins}`
            : `🏆 ${aWins > bWins ? nameA : nameB} wins ${Math.max(aWins, bWins)}-${Math.min(aWins, bWins)}!`}
        </div>
      )}
    </div>
  );
}

function PlayerModal({ player, onClose }) {
  const name = pick(player, ["name", "proName"]) ?? "Player";
  const egg = getEasterEgg(player);
  const [showEgg, setShowEgg] = useState(!!egg);

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalCard" onClick={(e) => e.stopPropagation()}>
        <button className="modalClose" onClick={onClose} aria-label="Close">
          ✕
        </button>
        {showEgg ? (
          <div className="eggScreen">
            <p className="eggText display">{egg}</p>
            <button className="searchButton" onClick={() => setShowEgg(false)}>
              See stats
            </button>
          </div>
        ) : (
          <>
            <h2 className="clubName display" style={{ fontSize: 26 }}>
              {name}
            </h2>
            <div className="clubSub" style={{ marginBottom: 18 }}>
              {pick(player, ["proPos", "favoritePosition"]) ?? "Position unknown"}
              {pick(player, ["proOverallStr"]) ? ` · OVR ${pick(player, ["proOverallStr"])}` : ""}
            </div>
            <div className="statGrid">
              <Stat label="Games" value={player.gamesPlayed} />
              <Stat label="Goals" value={player.goals} />
              <Stat label="Assists" value={player.assists} />
              <Stat label="MOTM" value={player.manOfTheMatch} />
              <Stat label="Red cards" value={player.redCards} />
              <Stat label="Win %" value={player.winRate} />
              <Stat label="Avg rating" value={player.ratingAve} />
              <Stat label="Passes made" value={player.passesMade} />
              <Stat label="Pass success %" value={player.passSuccessRate} />
              <Stat label="Tackles made" value={player.tacklesMade} />
              <Stat label="Tackle success %" value={player.tackleSuccessRate} />
              <Stat label="Shot success %" value={player.shotSuccessRate} />
              <Stat label="Clean sheets (Def)" value={player.cleanSheetsDef} />
              <Stat label="Clean sheets (GK)" value={player.cleanSheetsGK} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
