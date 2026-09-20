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
  { key: ["proName", "name"], label: "Name" },
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

function getEasterEgg(name) {
  if (!name) return null;
  return PLAYER_EASTER_EGGS[String(name).trim().toLowerCase()] ?? null;
}

// --- Podium (top 3 by average rating) -----------------------------------

export function Podium({ members, onSelect }) {
  const ranked = members
    .filter((m) => pick(m, ["ratingAve"]) != null && !Number.isNaN(Number(m.ratingAve)))
    .sort((a, b) => Number(b.ratingAve) - Number(a.ratingAve))
    .slice(0, 3);

  if (ranked.length < 3) return null;

  const [first, second, third] = ranked;
  const spots = [
    { player: second, place: 2 },
    { player: first, place: 1 },
    { player: third, place: 3 },
  ];
  const medal = { 1: "🥇", 2: "🥈", 3: "🥉" };

  return (
    <div className="podium">
      {spots.map(({ player, place }) => (
        <button
          key={place}
          className={`podiumSpot podiumSpot${place}`}
          onClick={() => onSelect(player)}
        >
          <div className="podiumMedal">{medal[place]}</div>
          <div className="podiumName">{pick(player, ["proName", "name"]) ?? "—"}</div>
          <div className="podiumRating">{player.ratingAve}</div>
          <div className="podiumBase">{place}</div>
        </button>
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
        const name = pick(m, ["proName", "name"]);
        const already = prev.find((p) => pick(p, ["proName", "name"]) === name);
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
          const name = pick(m, ["proName", "name"]) ?? "Player";
          const isSelected = compareSelection.some(
            (p) => pick(p, ["proName", "name"]) === name
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
    { label: "Position", key: ["proPos", "favoritePosition"] },
    { label: "Games played", key: ["gamesPlayed"] },
    { label: "Goals", key: ["goals"] },
    { label: "Assists", key: ["assists"] },
    { label: "MOTM", key: ["manOfTheMatch"] },
    { label: "Red cards", key: ["redCards"] },
    { label: "Win %", key: ["winRate"] },
    { label: "Avg rating", key: ["ratingAve"] },
    { label: "Passes made", key: ["passesMade"] },
    { label: "Pass success %", key: ["passSuccessRate"] },
    { label: "Tackles made", key: ["tacklesMade"] },
    { label: "Tackle success %", key: ["tackleSuccessRate"] },
    { label: "Shot success %", key: ["shotSuccessRate"] },
  ];
  const [a, b] = players;
  return (
    <div className="compareCard">
      <div className="compareHeader">
        <span>{pick(a, ["proName", "name"])}</span>
        <span>{pick(b, ["proName", "name"])}</span>
      </div>
      {rows.map((r) => (
        <div className="compareRow" key={r.label}>
          <span className="compareValue">{pick(a, r.key) ?? "—"}</span>
          <span className="compareLabel">{r.label}</span>
          <span className="compareValue">{pick(b, r.key) ?? "—"}</span>
        </div>
      ))}
    </div>
  );
}

function PlayerModal({ player, onClose }) {
  const name = pick(player, ["proName", "name"]) ?? "Player";
  const egg = getEasterEgg(name);
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
