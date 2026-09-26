"use client";

import { useState } from "react";
import { PLAYER_EASTER_EGGS } from "../../lib/easterEggs";

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

export function Stat({ label, value, compact }) {
  return (
    <div className={compact ? "statTileCompact" : "statTile"}>
      <div className={compact ? "statValueCompact display" : "statValue display"}>
        {value ?? "—"}
      </div>
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

// Colored win/draw/loss record, recent form, a win-rate readout, and a
// streak callout - the dense "at a glance" summary block that sits at the
// very top of the club page, above everything else.
export function RecordSummary({ wins, losses, ties, goals, goalsAgainst, form }) {
  const w = Number(wins) || 0;
  const l = Number(losses) || 0;
  const t = Number(ties) || 0;
  const played = w + l + t;
  const winRate = played > 0 ? Math.round((w / played) * 100) : null;
  const goalDiff =
    goals != null && goalsAgainst != null ? Number(goals) - Number(goalsAgainst) : null;
  const streak = computeStreak(form);
  const winRateTier = winRate == null ? "" : winRate >= 55 ? "Good" : winRate >= 40 ? "Mid" : "Bad";

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

      <FormStrip form={form} />

      {winRate != null && (
        <div className="winRateBlock">
          <div className="winRateTop">
            <div className="winRateBig display">
              {winRate}
              <span className="winRatePct">%</span>
            </div>
            <div className="winRateMeta">
              <div className="winRateMetaLabel">Win rate</div>
              {goalDiff != null && (
                <div className="winRateMetaSub">
                  {goals} scored / {goalsAgainst} conceded
                  <br />
                  {goalDiff >= 0 ? "+" : ""}
                  {goalDiff} goal difference
                </div>
              )}
            </div>
          </div>
          <div className="winRateTrack">
            <div
              className={`winRateFill winRateFill${winRateTier}`}
              style={{ width: `${winRate}%` }}
            />
          </div>
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
// The actual list lives in lib/easterEggs.js - edit that file to add,
// remove, or change any player's popup line.

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
// Score is built entirely from position-neutral stats, so a goalkeeper or a
// defender has the same shot at the podium as a striker:
//   - Average match rating (EA already scores this per-position - a GK's
//     rating reflects saves/clean sheets, a striker's reflects goals, so
//     equal ratings mean equal performance *for their role*)  -> 60%
//   - Win rate (applies identically to every position)         -> 25%
//   - Man-of-the-match rate (motm / games played)               -> 15%
// Each is normalized against the squad's own max before weighting, and a
// small penalty is applied per red card so a reckless player can't podium
// purely on rating.

export function Podium({ members, onSelect }) {
  const withScore = members.map((m) => {
    const ratingAve = Number(pick(m, ["ratingAve"])) || 0;
    const winRate = Number(pick(m, ["winRate"])) || 0;
    const gamesPlayed = Number(pick(m, ["gamesPlayed"])) || 0;
    const motm = Number(pick(m, ["manOfTheMatch"])) || 0;
    const motmRate = gamesPlayed > 0 ? (motm / gamesPlayed) * 100 : 0;
    const redCards = Number(pick(m, ["redCards"])) || 0;
    return { member: m, ratingAve, winRate, motmRate, redCards };
  });

  const maxRating = Math.max(...withScore.map((s) => s.ratingAve), 1);
  const maxWinRate = Math.max(...withScore.map((s) => s.winRate), 1);
  const maxMotmRate = Math.max(...withScore.map((s) => s.motmRate), 1);

  const ranked = withScore
    .map((s) => {
      const raw =
        (s.ratingAve / maxRating) * 60 +
        (s.winRate / maxWinRate) * 25 +
        (s.motmRate / maxMotmRate) * 15;
      return { player: s.member, score: Math.max(raw - s.redCards * 2, 0) };
    })
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

// Standalone wrapper so the podium can be placed anywhere on the page
// (independent of the squad list below it) while still opening the same
// player modal when a spot is clicked.
export function PodiumSection({ members }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  if (!members || members.length < 3) return null;
  return (
    <>
      <Podium members={members} onSelect={setSelectedPlayer} />
      <p className="podiumNote">
        Ranked by match rating, win rate, and MOTM awards — not goals, so every position has an
        equal shot.
      </p>
      {selectedPlayer && (
        <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </>
  );
}

// --- Squad leaders -----------------------------------------------

export function SquadLeaders({ members }) {
  if (!members || members.length === 0) return null;

  const withStats = members.map((m) => ({ member: m, ...deriveMemberStats(m) }));

  // Top G+A gets its own featured hero card (like the club's skill rating)
  // instead of sitting as a 7th tile in the grid below - it's the headline
  // "who's carrying this club" stat, so it earns the bigger treatment.
  let topGA = null;
  let topGAValue = -Infinity;
  for (const s of withStats) {
    const v = s.goals + s.assists;
    if (v > topGAValue) {
      topGAValue = v;
      topGA = s;
    }
  }
  const topGAEntry =
    topGA && topGAValue > 0
      ? { value: topGAValue, name: pick(topGA.member, ["name", "proName"]) ?? "—" }
      : null;

  // Nine categories on purpose - fills three even rows of three with nothing
  // orphaned on its own row. The three "rate" categories use EA's own
  // accuracy fields directly (passSuccessRate, tackleSuccessRate); clean
  // sheet rate isn't a field EA exposes, so it's derived (clean sheets /
  // games played) and is an approximation, not an EA-reported number.
  const categories = [
    { label: "Top scorer", value: (s) => s.goals },
    { label: "Top assister", value: (s) => s.assists },
    { label: "Most wins", value: (s) => s.wins },
    { label: "Top passer", value: (s) => s.completedPasses },
    { label: "Top tackler", value: (s) => s.successfulTackles },
    { label: "Top clean sheets", value: (s) => s.cleanSheets },
    {
      label: "Best pass accuracy",
      value: (s) => Number(pick(s.member, ["passSuccessRate"])) || 0,
      suffix: "%",
    },
    {
      label: "Best tackle rate",
      value: (s) => Number(pick(s.member, ["tackleSuccessRate"])) || 0,
      suffix: "%",
    },
    {
      label: "Best clean sheet rate",
      value: (s) => {
        const gamesPlayed = Number(pick(s.member, ["gamesPlayed"])) || 0;
        return gamesPlayed > 0 ? Math.round((s.cleanSheets / gamesPlayed) * 100) : 0;
      },
      suffix: "%",
    },
  ];

  const leaders = categories
    .map(({ label, value, suffix }) => {
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
      return {
        label,
        value: bestValue,
        suffix,
        name: pick(best.member, ["name", "proName"]) ?? "—",
      };
    })
    .filter(Boolean);

  if (leaders.length === 0 && !topGAEntry) return null;

  return (
    <>
      {topGAEntry && (
        <div className="leaderHero">
          <div>
            <div className="leaderHeroValue display">{topGAEntry.value}</div>
            <div className="leaderHeroLabel">Top G+A</div>
          </div>
          <div className="leaderHeroName">{topGAEntry.name}</div>
        </div>
      )}
      <div className="leaderRow">
        {leaders.map((l) => (
          <div className="leaderCard" key={l.label}>
            <div className="leaderLabel">{l.label}</div>
            <div className="leaderValue">
              {l.value}
              {l.suffix ?? ""}
            </div>
            <div className="leaderName">{l.name}</div>
          </div>
        ))}
      </div>
    </>
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
      <button className="compareToggleButton" onClick={toggleCompareMode}>
        <span className="compareToggleIcon">⇄</span>
        <span>
          <span className="compareToggleTitle">
            {compareMode ? "Comparing players" : "Compare two players"}
          </span>
          <span className="compareToggleSub">
            {compareMode
              ? compareSelection.length < 2
                ? `Tap ${2 - compareSelection.length} more player${compareSelection.length === 1 ? "" : "s"} below`
                : "Showing comparison below — tap to exit"
              : "Pick any two players from the squad to see them head-to-head"}
          </span>
        </span>
      </button>

      {compareMode && compareSelection.length === 2 && (
        <PlayerCompare players={compareSelection} />
      )}

      <div className="squadList">
        {members.map((m, i) => {
          const name = pick(m, ["name", "proName"]) ?? "Player";
          const selectionIndex = compareSelection.findIndex(
            (p) => pick(p, ["name", "proName"]) === name
          );
          const isSelected = selectionIndex !== -1;
          return (
            <button
              key={i}
              className={isSelected ? "squadRowSelected" : "squadRow"}
              onClick={() => handleRowClick(m)}
            >
              <span className="squadNameRow">
                {compareMode && (
                  <span className={isSelected ? "squadPickBadgeActive" : "squadPickBadge"}>
                    {isSelected ? selectionIndex + 1 : ""}
                  </span>
                )}
                <span className="squadName">{name}</span>
              </span>
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
            <h2 className="clubName display" style={{ fontSize: 22, marginBottom: 2 }}>
              {name}
            </h2>
            <div className="clubSub" style={{ marginBottom: 12 }}>
              {pick(player, ["proPos", "favoritePosition"]) ?? "Position unknown"}
              {pick(player, ["proOverallStr"]) ? ` · OVR ${pick(player, ["proOverallStr"])}` : ""}
            </div>
            <div className="statGridCompact">
              <Stat compact label="Games" value={player.gamesPlayed} />
              <Stat compact label="Goals" value={player.goals} />
              <Stat compact label="Assists" value={player.assists} />
              <Stat compact label="MOTM" value={player.manOfTheMatch} />
              <Stat compact label="Red cards" value={player.redCards} />
              <Stat compact label="Win %" value={player.winRate} />
              <Stat compact label="Avg rating" value={player.ratingAve} />
              <Stat compact label="Passes made" value={player.passesMade} />
              <Stat compact label="Pass success %" value={player.passSuccessRate} />
              <Stat compact label="Tackles made" value={player.tacklesMade} />
              <Stat compact label="Tackle success %" value={player.tackleSuccessRate} />
              <Stat compact label="Shot success %" value={player.shotSuccessRate} />
              <Stat compact label="Clean sheets (Def)" value={player.cleanSheetsDef} />
              <Stat compact label="Clean sheets (GK)" value={player.cleanSheetsGK} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// --- Hall of Shame (roasts the squad's worst performers) ------------------
// Picks out the lowest average rating, the worst win rate, and the most red
// cards on the squad and pairs each with a roast line. Only players who've
// actually played are eligible - can't roast someone for a stat of 0/0.
// If one player sweeps more than one category, their card just stacks the
// extra lines instead of repeating them as separate cards.

export function HallOfShame({ members }) {
  if (!members || members.length < 2) return null;

  const withStats = members
    .map((m) => ({
      name: pick(m, ["name", "proName"]) ?? "Player",
      ratingAve: Number(pick(m, ["ratingAve"])) || 0,
      winRate: Number(pick(m, ["winRate"])) || 0,
      redCards: Number(pick(m, ["redCards"])) || 0,
      gamesPlayed: Number(pick(m, ["gamesPlayed"])) || 0,
    }))
    .filter((s) => s.gamesPlayed > 0);

  if (withStats.length < 2) return null;

  const worstRating = [...withStats].sort((a, b) => a.ratingAve - b.ratingAve)[0];
  const worstWinRate = [...withStats].sort((a, b) => a.winRate - b.winRate)[0];
  const mostRedCards = [...withStats].sort((a, b) => b.redCards - a.redCards)[0];

  const roasts = [];
  if (worstRating.ratingAve > 0) {
    roasts.push({
      name: worstRating.name,
      line: `Lowest average rating (${worstRating.ratingAve.toFixed(1)}) — the club wins in spite of them, not because of them.`,
    });
  }
  if (worstWinRate.winRate < 100) {
    roasts.push({
      name: worstWinRate.name,
      line: `Worst win rate on the squad (${worstWinRate.winRate}%) — a certified L machine.`,
    });
  }
  if (mostRedCards.redCards > 0) {
    roasts.push({
      name: mostRedCards.name,
      line: `${mostRedCards.redCards} red card${mostRedCards.redCards === 1 ? "" : "s"} — the ref has their number on speed dial.`,
    });
  }

  const byPlayer = {};
  for (const r of roasts) {
    (byPlayer[r.name] ??= []).push(r.line);
  }
  const cards = Object.entries(byPlayer);
  if (cards.length === 0) return null;

  return (
    <div className="shameGrid">
      {cards.map(([name, lines]) => (
        <div className="shameCard" key={name}>
          <div className="shameName">🔥 {name}</div>
          {lines.map((line, i) => (
            <p className="shameLine" key={i}>
              {line}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
