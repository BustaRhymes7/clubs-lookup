import { NextResponse } from "next/server";
import {
  getClubInfo,
  getClubMatches,
  getMemberStats,
  getOverallStats,
  getPlayoffAchievements,
} from "../../../../lib/ea";

// Fetches every section independently so that one unconfirmed/broken EA
// endpoint (overallStats, playoffAchievements, etc.) doesn't take down the
// whole club page - each section reports its own ok/error status instead.
async function section(promise) {
  try {
    const data = await promise;
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function GET(request, { params }) {
  const clubId = params.id;
  const { searchParams } = new URL(request.url);
  const matchType = searchParams.get("matchType") || "leagueMatch";
  const platform = searchParams.get("platform") || undefined;

  const [info, overallStats, playoffAchievements, matches, members] = await Promise.all([
    section(getClubInfo(clubId, platform)),
    section(getOverallStats(clubId, platform)),
    section(getPlayoffAchievements(clubId, platform)),
    section(getClubMatches(clubId, matchType, platform)),
    section(getMemberStats(clubId, platform)),
  ]);

  // If literally everything failed, surface that as a real error.
  if (![info, overallStats, playoffAchievements, matches, members].some((s) => s.ok)) {
    return NextResponse.json({ error: info.error || "Failed to load club" }, { status: 502 });
  }

  return NextResponse.json({ info, overallStats, playoffAchievements, matches, members });
}
