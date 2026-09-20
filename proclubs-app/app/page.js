"use client";

import { useEffect, useState } from "react";
import { getFavorites, isFavorited, toggleFavorite } from "../lib/favorites";

const PLATFORM_OPTIONS = [
  { value: "common-gen5", label: "PS5 / Xbox Series X|S / PC" },
  { value: "common-gen4", label: "PS4 / Xbox One" },
  { value: "nx", label: "Nintendo Switch" },
];

const MATCH_TYPES = [
  { value: "leagueMatch", label: "League" },
  { value: "playoffMatch", label: "Playoffs" },
  { value: "friendlyMatch", label: "Friendlies" },
];

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "matches", label: "Matches" },
  { value: "roster", label: "Roster" },
];

// Turn a raw technical error (endpoint paths, status codes) into something
// a non-technical visitor can actually act on. The raw message is still
// available via the "technical details" toggle for anyone who wants it.
function toFriendlyError(message = "") {
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

function ErrorNotice({ message, technical, showDetails, onToggleDetails }) {
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

export default function Home() {
  const [platform, setPlatform] = useState(PLATFORM_OPTIONS[0].value);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("idle"); // idle | searching | loadingClub | error
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);
  const [club, setClub] = useState(null);
  const [tab, setTab] = useState("overview");
  const [matchType, setMatchType] = useState("leagueMatch");
  const [showRaw, setShowRaw] = useState(false);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [fieldError, setFieldError] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [technicalError, setTechnicalError] = useState("");
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  function reportError(err) {
    setError(toFriendlyError(err.message));
    setTechnicalError(err.message);
    setShowErrorDetails(false);
  }

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  function handleToggleFavorite() {
    if (!club) return;
    const next = toggleFavorite({ clubId: club.clubId, platform: club.platform, name: infoRecord?.name ?? club.name });
    setFavorites(next);
  }

  function openFavorite(fav) {
    openClub({ clubId: fav.clubId, name: fav.name, platform: fav.platform });
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) {
      setFieldError("Enter a club name to search.");
      return;
    }
    setFieldError("");
    setStatus("searching");
    setError("");
    setResults(null);
    setClub(null);

    try {
      const res = await fetch(
        `/api/search?clubName=${encodeURIComponent(query.trim())}&platform=${platform}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setResults(Array.isArray(data.results) ? data.results : []);
      setStatus("idle");
    } catch (err) {
      reportError(err);
      setStatus("error");
    }
  }

  async function openClub(result, mt = matchType) {
    const clubId = result?.clubInfo?.clubId ?? result?.clubId ?? club?.clubId;
    const name = result?.clubInfo?.name ?? result?.name ?? club?.name ?? "Unknown club";
    const clubPlatform = result?.platform ?? club?.platform ?? platform;
    if (!clubId) {
      setError("Couldn't find a club ID in that result — see raw response below.");
      setShowRaw(true);
      return;
    }
    setStatus("loadingClub");
    setError("");

    try {
      const res = await fetch(`/api/club/${clubId}?matchType=${mt}&platform=${clubPlatform}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load club");
      setClub({ ...data, name, clubId, platform: clubPlatform });
      setFetchedAt(new Date());
      setTab("overview");
      setStatus("idle");
    } catch (err) {
      reportError(err);
      setStatus("error");
    }
  }

  function changeMatchType(mt) {
    setMatchType(mt);
    openClub(null, mt);
  }

  function reset() {
    setClub(null);
    setError("");
    setStatus("idle");
  }

  const infoRecord = extractRecord(club?.info?.data, club?.clubId);
  const statsRecord = extractRecord(club?.overallStats?.data, club?.clubId) || infoRecord;
  const memberList = extractList(club?.members?.data);
  const matchList = extractList(club?.matches?.data);
  const achievements = extractList(club?.playoffAchievements?.data);
  const platformLabel = PLATFORM_OPTIONS.find((p) => p.value === platform)?.label;

  return (
    <main className="shell">
      <p className="badge">⚽ Unofficial fan project — not affiliated with or endorsed by EA</p>
      <h1 className="title display">Clubs Lookup</h1>
      <p className="subtitle">
        Search a Pro Clubs team and pull every stat EA's own servers expose — club
        record, playoff history, full roster stats, and per-player match breakdowns.
      </p>

      {!club && (
        <>
          <label className="fieldLabel">Platform</label>
          <select
            className="platformSelect"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            {PLATFORM_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <form className="searchForm" onSubmit={handleSearch} noValidate>
            <div style={{ flex: 1 }}>
              <input
                className={fieldError ? "searchInput searchInputError" : "searchInput"}
                placeholder="Club name, e.g. Real Madrid"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (fieldError) setFieldError("");
                }}
                aria-invalid={fieldError ? "true" : "false"}
                aria-describedby={fieldError ? "search-error" : undefined}
              />
              {fieldError && (
                <p id="search-error" className="fieldError">
                  {fieldError}
                </p>
              )}
            </div>
            <button className="searchButton" type="submit" disabled={status === "searching"}>
              {status === "searching" ? "Searching…" : "Search"}
            </button>
          </form>

          {error && <ErrorNotice message={error} technical={technicalError} showDetails={showErrorDetails} onToggleDetails={() => setShowErrorDetails((v) => !v)} />}

          {status === "searching" && <SearchSkeleton />}

          {results && results.length === 0 && (
            <p className="status">No clubs found for "{query}" on {platformLabel}. Try the exact in-game name.</p>
          )}

          {results && results.length > 0 && (
            <div className="resultList">
              {results.map((r, i) => {
                const name = r?.clubInfo?.name ?? r?.name ?? "Unknown club";
                const wins = r?.wins ?? r?.clubInfo?.wins;
                const losses = r?.losses ?? r?.clubInfo?.losses;
                const rating = r?.skillRating ?? r?.clubInfo?.skillRating;
                return (
                  <button key={i} className="resultCard" onClick={() => openClub({ ...r, platform })}>
                    <div>
                      <div className="resultName">{name}</div>
                      <div className="resultMeta">
                        {wins != null && losses != null ? `${wins}W – ${losses}L · ` : ""}
                        {rating != null ? `Skill rating ${rating}` : "Tap to view stats"}
                      </div>
                    </div>
                    <span className="chevron">→</span>
                  </button>
                );
              })}
            </div>
          )}

          {favorites.length > 0 && !results && (
            <>
              <p className="sectionTitle display" style={{ marginTop: 8 }}>
                YOUR FAVORITE CLUBS
              </p>
              <div className="resultList">
                {favorites.map((f) => (
                  <button
                    key={`${f.platform}:${f.clubId}`}
                    className="resultCard"
                    onClick={() => openFavorite(f)}
                  >
                    <div>
                      <div className="resultName">★ {f.name}</div>
                      <div className="resultMeta">
                        {PLATFORM_OPTIONS.find((p) => p.value === f.platform)?.label ?? f.platform}
                      </div>
                    </div>
                    <span className="chevron">→</span>
                  </button>
                ))}
              </div>
              <p className="status" style={{ fontSize: 12 }}>
                Saved on this device only — favorites won't follow you to another phone or browser.
              </p>
            </>
          )}

          {status === "idle" && !results && (
            <p className="status">Search for a club to see live stats.</p>
          )}
        </>
      )}

      {status === "loadingClub" && <ClubSkeleton />}

      {club && status !== "loadingClub" && (
        <>
          <button className="backLink" onClick={reset}>
            ← New search
          </button>

          {error && <ErrorNotice message={error} technical={technicalError} showDetails={showErrorDetails} onToggleDetails={() => setShowErrorDetails((v) => !v)} />}

          <div className="clubHeader">
            <div className="clubHeaderRow">
              <h2 className="clubName display">{infoRecord?.name ?? club.name}</h2>
              <button
                className={isFavorited(club.clubId, club.platform) ? "favButtonActive" : "favButton"}
                onClick={handleToggleFavorite}
                aria-pressed={isFavorited(club.clubId, club.platform)}
                aria-label={
                  isFavorited(club.clubId, club.platform) ? "Remove from favorites" : "Save to favorites"
                }
              >
                {isFavorited(club.clubId, club.platform) ? "★ Saved" : "☆ Save"}
              </button>
            </div>
            <div className="clubSub">
              Club ID {club.clubId} · {PLATFORM_OPTIONS.find((p) => p.value === club.platform)?.label}
              {fetchedAt ? ` · fetched ${fetchedAt.toLocaleTimeString()}` : ""}
            </div>
          </div>

          <div className="tabRow">
            {TABS.map((t) => (
              <button
                key={t.value}
                className={tab === t.value ? "tabButtonActive" : "tabButton"}
                onClick={() => setTab(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <>
              <div className="statGrid">
                <Stat label="Wins" value={statsRecord?.wins} />
                <Stat label="Losses" value={statsRecord?.losses} />
                <Stat label="Ties" value={statsRecord?.ties} />
                <Stat label="Skill rating" value={statsRecord?.skillRating} />
                <Stat label="Games played" value={statsRecord?.gamesPlayed} />
                <Stat label="Division" value={statsRecord?.division} />
                <Stat label="Titles won" value={statsRecord?.titlesWon} />
                <Stat label="Promotions" value={statsRecord?.promotions} />
                <Stat label="Relegations" value={statsRecord?.relegations} />
              </div>
              <SectionStatus section={club.overallStats} label="overall stats" />

              <p className="sectionTitle display">PLAYOFF ACHIEVEMENTS</p>
              {achievements && achievements.length > 0 ? (
                <ul className="achievementList">
                  {achievements.map((a, i) => (
                    <li key={i}>
                      {a?.titleName ?? a?.name ?? "Achievement"}
                      {a?.timestamp ? ` — ${new Date(a.timestamp * 1000).toLocaleDateString()}` : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <SectionStatus section={club.playoffAchievements} label="playoff achievements" fallback="No playoff achievements returned." />
              )}
            </>
          )}

          {tab === "matches" && (
            <>
              <div className="tabRow" style={{ marginBottom: 16 }}>
                {MATCH_TYPES.map((mt) => (
                  <button
                    key={mt.value}
                    className={matchType === mt.value ? "chipActive" : "chip"}
                    onClick={() => changeMatchType(mt.value)}
                  >
                    {mt.label}
                  </button>
                ))}
              </div>
              {matchList && matchList.length > 0 ? (
                <div className="matchList">
                  {matchList.map((m, i) => (
                    <MatchRow key={m?.matchId ?? i} match={m} />
                  ))}
                </div>
              ) : (
                <SectionStatus section={club.matches} label="matches" fallback={`No recent ${matchType.replace("Match", "").toLowerCase()} matches returned.`} />
              )}
            </>
          )}

          {tab === "roster" && (
            <>
              {memberList && memberList.length > 0 ? (
                <MembersTable members={memberList} />
              ) : (
                <SectionStatus section={club.members} label="roster stats" />
              )}
            </>
          )}
        </>
      )}

      <button className="backLink" style={{ marginTop: 24 }} onClick={() => setShowRaw((v) => !v)}>
        {showRaw ? "Hide" : "Show"} raw API response (for debugging)
      </button>
      {showRaw && (
        <pre className="rawBox">{JSON.stringify(club ?? results ?? {}, null, 2)}</pre>
      )}

      <p className="disclaimer">
        Not affiliated with or endorsed by EA. Data is fetched live from EA's public,
        unofficial Pro Clubs endpoints, which can change or go down without notice —
        including which game (FC26 vs FC27) they're currently pointing at.
      </p>

      {club && (
        <div className="stickyMobileCta">
          <button className="searchButton" style={{ width: "100%" }} onClick={reset}>
            ← New search
          </button>
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div className="statTile">
      <div className="statValue display">{value ?? "—"}</div>
      <div className="statLabel">{label}</div>
    </div>
  );
}

function SectionStatus({ section, label, fallback }) {
  if (!section) return null;
  if (section.ok) return <p className="status">{fallback ?? `No ${label} returned.`}</p>;
  return (
    <p className="status" style={{ color: "#e8a33d" }}>
      Couldn't load {label}: this endpoint may not be confirmed yet ({section.error}).
    </p>
  );
}

function MatchRow({ match }) {
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
        style={{ width: "100%", cursor: "pointer", border: "1px solid #245640" }}
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
      <p style={{ fontSize: 12, color: "#9db8a8", margin: "8px 0 4px" }}>{teamName}</p>
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

function MembersTable({ members }) {
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
function extractRecord(data, clubId) {
  if (!data) return null;
  if (data[clubId]) return data[clubId];
  if (Array.isArray(data)) return data[0];
  const firstKey = Object.keys(data)[0];
  return firstKey ? data[firstKey] : data;
}

// members/stats and list-shaped endpoints have been seen either as a plain
// array, or as an object keyed by id. Normalize both into a flat array.
function extractList(data) {
  if (!data) return null;
  if (Array.isArray(data)) return data;
  if (typeof data === "object") return Object.values(data);
  return null;
}

function SearchSkeleton() {
  return (
    <div className="resultList" aria-live="polite" aria-busy="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="skeletonCard" />
      ))}
    </div>
  );
}

function ClubSkeleton() {
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
