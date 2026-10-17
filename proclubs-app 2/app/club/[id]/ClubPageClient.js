"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { isFavorited, toggleFavorite } from "../../../lib/favorites";
import { getClubCrestUrl } from "../../../lib/ea";
import { clubCacheKey, readClubCache, writeClubCache, fetchClub } from "../../../lib/clubCache";
import {
  PLATFORM_OPTIONS,
  MATCH_TYPES,
  TABS,
  toFriendlyError,
  ErrorNotice,
  SectionStatus,
  MatchRow,
  SquadSection,
  SquadLeaders,
  PodiumSection,
  HallOfShame,
  WeeklyAwards,
  computeForm,
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
  const [matchesLoading, setMatchesLoading] = useState(false);
  const latestMatchType = useRef("leagueMatch");

  function reportError(err) {
    setError(toFriendlyError(err.message));
    setTechnicalError(err.message);
    setShowErrorDetails(false);
  }

  // Shows cached data straight away if we have it (revisit, or a search
  // result that was prefetched), then refreshes quietly in the background.
  async function loadClub(mt) {
    const cached = readClubCache(clubCacheKey(clubId, platform, mt));
    setError("");
    if (cached) {
      setClub(cached.data);
      setFetchedAt(new Date(cached.savedAt));
      setStatus("idle");
    } else {
      setStatus("loading");
    }
    try {
      const data = await fetchClub(clubId, platform, mt);
      setClub(data);
      setFetchedAt(new Date());
      setStatus("idle");
    } catch (err) {
      if (!cached) {
        reportError(err);
        setStatus("error");
      }
    }
  }

  useEffect(() => {
    loadClub(matchType);
    setFavorited(isFavorited(clubId, platform));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId, platform]);

  // Only the match list depends on the match type, so swap just that in
  // and leave the rest of the page as it is.
  async function changeMatchType(mt) {
    setMatchType(mt);
    latestMatchType.current = mt;
    if (!club) return loadClub(mt);

    const cached = readClubCache(clubCacheKey(clubId, platform, mt));
    if (cached) {
      setClub((prev) => ({ ...prev, matches: cached.data.matches }));
      return;
    }
    setMatchesLoading(true);
    try {
      const data = await fetchClub(clubId, platform, mt, "matches");
      if (latestMatchType.current !== mt) return;
      setClub((prev) => {
        const next = { ...prev, matches: data.matches };
        writeClubCache(clubCacheKey(clubId, platform, mt), next);
        return next;
      });
    } catch (err) {
      if (latestMatchType.current === mt) reportError(err);
    } finally {
      if (latestMatchType.current === mt) setMatchesLoading(false);
    }
  }

  const infoRecord = extractRecord(club?.info?.data, clubId);
  const displayName = infoRecord?.name ?? nameParam ?? "Club";
  const crestAssetId = infoRecord?.customKit?.crestAssetId ?? infoRecord?.crestAssetId ?? null;
  const crestUrl = getClubCrestUrl(crestAssetId, platform);
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
                  <div className="clubHeaderIdentity">
                    {crestUrl && (
                      <img
                        src={crestUrl}
                        alt=""
                        className="clubCrest"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <h1 className="clubName display">{displayName}</h1>
                  </div>
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

                  {memberList && memberList.length >= 3 && (
                    <>
                      <p className="sectionTitle display" style={{ marginTop: 24 }}>
                        PODIUM
                      </p>
                      <PodiumSection members={memberList} />
                    </>
                  )}

                  {memberList && memberList.length > 0 && (
                    <>
                      <p className="sectionTitle display" style={{ marginTop: 28 }}>
                        HALL OF SHAME
                      </p>
                      <HallOfShame members={memberList} />
                    </>
                  )}

                  {matchList && matchList.length > 0 && (
                    <>
                      <p className="sectionTitle display" style={{ marginTop: 28 }}>
                        WEEKLY AWARDS
                      </p>
                      <WeeklyAwards matches={matchList} clubId={clubId} />
                    </>
                  )}

                  <p className="sectionTitle display" style={{ marginTop: 28 }}>
                    CLUB STATS
                  </p>
                  <div className="statHero">
                    <div>
                      <div className="statHeroValue display">{statsRecord?.skillRating ?? "—"}</div>
                      <div className="statHeroLabel">Skill rating</div>
                    </div>
                    <div className="statHeroMeta">
                      Best division {statsRecord?.bestDivision ?? "—"}
                      <br />
                      Best finish {statsRecord?.bestFinishGroup ?? "—"}
                    </div>
                  </div>
                  <div className="statGridSecondary">
                    {[
                      ["Games played", statsRecord?.gamesPlayed],
                      ["Playoff games", statsRecord?.gamesPlayedPlayoff],
                      ["Promotions", statsRecord?.promotions],
                      ["Relegations", statsRecord?.relegations],
                    ].map(([label, value]) => (
                      <div className="statTileSecondary" key={label}>
                        <div className="statValueSecondary display">{value ?? "—"}</div>
                        <div className="statLabel">{label}</div>
                      </div>
                    ))}
                  </div>
                  {!club.overallStats?.ok && (
                    <SectionStatus section={club.overallStats} label="overall stats" />
                  )}

                  <p className="sectionTitle display" style={{ marginTop: 28 }}>
                    TOP PERFORMERS &amp; SQUAD
                  </p>
                  {memberList && memberList.length > 0 && (
                    <>
                      <p className="sectionTitle display" style={{ marginTop: 4, fontSize: 11 }}>
                        SQUAD LEADERS
                      </p>
                      <SquadLeaders members={memberList} />
                    </>
                  )}
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
                  {matchesLoading ? (
                    <div className="matchList">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="skeletonCard" style={{ height: 52 }} />
                      ))}
                    </div>
                  ) : matchList && matchList.length > 0 ? (
                    <div className="matchList">
                      {matchList.map((m, i) => (
                        <MatchRow key={m?.matchId ?? i} match={m} clubId={clubId} />
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
