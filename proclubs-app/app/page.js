"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFavorites } from "../lib/favorites";
import { PLATFORM_OPTIONS, ErrorNotice, toFriendlyError } from "./components/ClubDisplay";

export default function Home() {
  const [platform, setPlatform] = useState(PLATFORM_OPTIONS[0].value);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("idle"); // idle | searching | error
  const [error, setError] = useState("");
  const [technicalError, setTechnicalError] = useState("");
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [results, setResults] = useState(null);
  const [fieldError, setFieldError] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [debugMode, setDebugMode] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    setFavorites(getFavorites());
    // Hidden debug mode - append ?debug=1 to the URL to see raw API
    // responses and technical error details. Regular visitors never see
    // this; it's for troubleshooting when EA's response shape changes.
    if (typeof window !== "undefined") {
      setDebugMode(new URLSearchParams(window.location.search).get("debug") === "1");
    }
  }, []);

  function reportError(err) {
    setError(toFriendlyError(err.message));
    setTechnicalError(err.message);
    setShowErrorDetails(false);
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

  const platformLabel = PLATFORM_OPTIONS.find((p) => p.value === platform)?.label;

  function clubHref(clubId, clubPlatform, name) {
    const params = new URLSearchParams({ platform: clubPlatform, name: name || "" });
    if (debugMode) params.set("debug", "1");
    return `/club/${clubId}?${params.toString()}`;
  }

  return (
    <main className="shell">
      <p className="badge">⚽ Unofficial fan project — not affiliated with or endorsed by EA</p>
      <h1 className="title display">Clubs Lookup</h1>
      <p className="subtitle">
        Search a Pro Clubs team and pull every stat EA's own servers expose — club
        record, playoff history, full roster stats, and per-player match breakdowns.
      </p>

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

      {error && (
        <ErrorNotice
          message={error}
          technical={debugMode ? technicalError : ""}
          showDetails={showErrorDetails}
          onToggleDetails={() => setShowErrorDetails((v) => !v)}
        />
      )}

      {status === "searching" && <SearchSkeleton />}

      {results && results.length === 0 && (
        <p className="status">
          No clubs found for "{query}" on {platformLabel}. Try the exact in-game name.
        </p>
      )}

      {results && results.length > 0 && (
        <div className="resultList">
          {results.map((r, i) => {
            const name = r?.clubInfo?.name ?? r?.name ?? "Unknown club";
            const clubId = r?.clubInfo?.clubId ?? r?.clubId;
            const wins = r?.wins ?? r?.clubInfo?.wins;
            const losses = r?.losses ?? r?.clubInfo?.losses;
            const rating = r?.skillRating ?? r?.clubInfo?.skillRating;
            if (!clubId) return null;
            return (
              <Link
                key={i}
                href={clubHref(clubId, platform, name)}
                target="_blank"
                rel="noopener noreferrer"
                className="resultCard"
              >
                <div>
                  <div className="resultName">{name}</div>
                  <div className="resultMeta">
                    {wins != null && losses != null ? `${wins}W – ${losses}L · ` : ""}
                    {rating != null ? `Skill rating ${rating}` : "Tap to view stats"}
                  </div>
                </div>
                <span className="chevron">↗</span>
              </Link>
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
              <Link
                key={`${f.platform}:${f.clubId}`}
                href={clubHref(f.clubId, f.platform, f.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="resultCard"
              >
                <div>
                  <div className="resultName">★ {f.name}</div>
                  <div className="resultMeta">
                    {PLATFORM_OPTIONS.find((p) => p.value === f.platform)?.label ?? f.platform}
                  </div>
                </div>
                <span className="chevron">↗</span>
              </Link>
            ))}
          </div>
          <p className="status" style={{ fontSize: 12 }}>
            Saved on this device only — favorites won't follow you to another phone or browser.
          </p>
        </>
      )}

      {status === "idle" && !results && (
        <p className="status">Search for a club to see live stats — opens in a new tab.</p>
      )}

      {debugMode && results && (
        <>
          <button className="backLink" style={{ marginTop: 24 }} onClick={() => setShowRaw((v) => !v)}>
            {showRaw ? "Hide" : "Show"} raw search response (debug mode)
          </button>
          {showRaw && <pre className="rawBox">{JSON.stringify(results, null, 2)}</pre>}
        </>
      )}

      <p className="disclaimer">
        Not affiliated with or endorsed by EA. Data is fetched live from EA's public,
        unofficial Pro Clubs endpoints, which can change or go down without notice —
        including which game (FC26 vs FC27) they're currently pointing at.
      </p>
    </main>
  );
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
