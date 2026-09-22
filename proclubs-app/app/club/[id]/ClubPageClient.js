"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { isFavorited, toggleFavorite } from "../../../lib/favorites";
import {
  PLATFORM_OPTIONS,
  MATCH_TYPES,
  TABS,
  toFriendlyError,
  ErrorNotice,
  Stat,
  SectionStatus,
  MatchRow,
  SquadSection,
  computeForm,
  FormStrip,
  RecordSummary,
  extractRecord,
  extractList,
  extractMembers,
  ClubSkeleton,
} from "../../components/ClubDisplay";

export default function ClubPageClient({ clubId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const platform = PLATFORM_OPTIONS.some((p) => p.value === searchParams.get("platform"))
    ? searchParams.get("platform")
    : PLATFORM_OPTIONS[0].value;
  const nameParam = searchParams.get("name");
  const debugMode = searchParams.get("debug") === "1";

  const [status, setStatus] = useState("loading"); // loading | idle | error
  const [error, setError] = useState("");
  const [technicalError, setTechnicalError] = useState("");
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [club, setClub] = useState(null);
  const [tab, setTab] = useState("overview");
  const [matchType, setMatchType] = useState("leagueMatch");
  const [fetchedAt, setFetchedAt] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const [favorited, setFavorited] = useState(false);

  function reportError(err) {
    setError(toFriendlyError(err.message));
    setTechnicalError(err.message);
    setShowErrorDetails(false);
  }

  async function loadClub(mt) {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`/api/club/${clubId}?matchType=${mt}&platform=${platform}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load club");
      setClub(data);
      setFetchedAt(new Date());
      setStatus("idle");
    } catch (err) {
      reportError(err);
      setStatus("error");
    }
  }

  useEffect(() => {
    loadClub(matchType);
    setFavorited(isFavorited(clubId, platform));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId, platform]);

  function changeMatchType(mt) {
    setMatchType(mt);
    loadClub(mt);
  }

  const infoRecord = extractRecord(club?.info?.data, clubId);
  const displayName = infoRecord?.name ?? nameParam ?? "Club";
  const statsRecord = extractRecord(club?.overallStats?.data, clubId) || infoRecord;
  const memberList = extractMembers(club?.members?.data);
  const matchList = extractList(club?.matches?.data);
  const achievements = extractList(club?.playoffAchievements?.data);
  const platformLabel = PLATFORM_OPTIONS.find((p) => p.value === platform)?.label;
  const form = computeForm(matchList, clubId);

  function handleToggleFavorite() {
    toggleFavorite({ clubId, platform, name: displayName });
    setFavorited(isFavorited(clubId, platform));
  }

  return (
    <main className="shell">
      <button className="backLink" onClick={() => router.push("/")}>
        ← New search
      </button>

      {status === "loading" && <ClubSkeleton />}

      {status !== "loading" && (
        <>
          {error && (
            <ErrorNotice
              message={error}
              technical={debugMode ? technicalError : ""}
              showDetails={showErrorDetails}
              onToggleDetails={() => setShowErrorDetails((v) => !v)}
            />
          )}

          {club && (
            <>
              <div className="clubHeader">
                <div className="clubHeaderRow">
                  <h1 className="clubName display">{displayName}</h1>
                  <button
                    className={favorited ? "favButtonActive" : "favButton"}
                    onClick={handleToggleFavorite}
                    aria-pressed={favorited}
                    aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
                  >
                    {favorited ? "★ Saved" : "☆ Save"}
                  </button>
                </div>
                <div className="clubSub">
                  Club ID {clubId} · {platformLabel}
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
                  <RecordSummary
                    wins={statsRecord?.wins}
                    losses={statsRecord?.losses}
                    ties={statsRecord?.ties}
                    goals={statsRecord?.goals}
                    goalsAgainst={statsRecord?.goalsAgainst}
                    form={form}
                  />

                  <p className="sectionTitle display" style={{ marginTop: 24 }}>
                    CLUB STATS
                  </p>
                  <div className="statGrid">
                    <Stat label="Skill rating" value={statsRecord?.skillRating} />
                    <Stat label="Games played" value={statsRecord?.gamesPlayed} />
                    <Stat label="Playoff games" value={statsRecord?.gamesPlayedPlayoff} />
                    <Stat label="Best division" value={statsRecord?.bestDivision} />
                    <Stat label="Best finish" value={statsRecord?.bestFinishGroup} />
                    <Stat label="Promotions" value={statsRecord?.promotions} />
                    <Stat label="Relegations" value={statsRecord?.relegations} />
                  </div>
                  {!club.overallStats?.ok && (
                    <SectionStatus section={club.overallStats} label="overall stats" />
                  )}

                  <FormStrip form={form} />

                  <p className="sectionTitle display" style={{ marginTop: 28 }}>
                    TOP PERFORMERS &amp; SQUAD
                  </p>
                  {memberList && memberList.length > 0 ? (
                    <SquadSection members={memberList} />
                  ) : (
                    <SectionStatus section={club.members} label="roster stats" />
                  )}

                  <p className="sectionTitle display" style={{ marginTop: 28 }}>
                    PLAYOFF ACHIEVEMENTS
                  </p>
                  {achievements && achievements.length > 0 ? (
                    <ul className="achievementList">
                      {achievements.map((a, i) => (
                        <li key={i}>
                          {a?.seasonName ?? "Season"}
                          {a?.finishLabel ? ` — ${a.finishLabel}` : ""}
                          {a?.divisionLabel ? ` (${a.divisionLabel})` : ""}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <SectionStatus
                      section={club.playoffAchievements}
                      label="playoff achievements"
                      fallback="No playoff achievements returned."
                    />
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
                    <SectionStatus
                      section={club.matches}
                      label="matches"
                      fallback={`No recent ${matchType.replace("Match", "").toLowerCase()} matches returned.`}
                    />
                  )}
                </>
              )}

              {debugMode && (
                <>
                  <button
                    className="backLink"
                    style={{ marginTop: 24 }}
                    onClick={() => setShowRaw((v) => !v)}
                  >
                    {showRaw ? "Hide" : "Show"} raw API response (debug mode)
                  </button>
                  {showRaw && <pre className="rawBox">{JSON.stringify(club, null, 2)}</pre>}
                </>
              )}
            </>
          )}
        </>
      )}

      <p className="disclaimer">
        Not affiliated with or endorsed by EA. Data is fetched live from EA's public,
        unofficial Pro Clubs endpoints, which can change or go down without notice —
        including which game (FC26 vs FC27) they're currently pointing at.
      </p>

      <div className="stickyMobileCta">
        <button className="searchButton" style={{ width: "100%" }} onClick={() => router.push("/")}>
          ← New search
        </button>
      </div>
    </main>
  );
}
