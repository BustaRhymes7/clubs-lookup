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
  { value: "roster", label: "Roster" },
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
  { key: "redcards", label: "🟥" },
  { key: "man_of_the_match", label: "MOTM" },
  { key: "rating", label: "Rating" },
];

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
              {MATCH_PLAYER_COLUMNS.map((c) => (
                <td key={c.key}>
                  {c.key === "man_of_the_match" || c.key === "redcards"
                    ? Number(p?.[c.key]) > 0
                      ? "✓"
                      : ""
                    : p?.[c.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const MEMBER_COLUMNS = [
  { key: ["proName", "name"], label: "Name" },
  { key: ["favoritePosition", "proPos", "position"], label: "Pos" },
  { key: ["gamesPlayed", "proGamesPlayed"], label: "GP" },
  { key: ["goals", "proGoals"], label: "Goals" },
  { key: ["assists", "proAssists"], label: "Assists" },
  { key: ["manOfTheMatch", "proMOTM"], label: "MOTM" },
  { key: ["redCards", "proRedCards"], label: "🟥" },
  { key: ["winRate", "proWinRate"], label: "Win %" },
  { key: ["ratingAve", "proAvgRating"], label: "Avg rating" },
];

function pick(obj, keys) {
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
