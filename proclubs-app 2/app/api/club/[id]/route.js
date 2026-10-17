import { NextResponse } from "next/server";
import {
  getClubInfo,
  getOverallStats,
  getMemberStats,
  getClubMatches,
  getPlayoffAchievements,
} from "../../../../lib/ea";

// Fetches every endpoint for a club in parallel and returns each as its
// own { ok, data, error } section. One endpoint failing (EA's data isn't
// consistent for every club - e.g. clubs with no playoff history) never
// takes down the whole page; the frontend shows a small "couldn't load X"
// note for just that section instead.
async function safeSection(promise) {
  try {
    const data = await promise;
    return { ok: true, data };
  } catch (err) {
    return { ok: false, data: null, error: err.message || "Failed to load" };
  }
}

export async function GET(request, { params }) {
  const clubId = params.id;
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform");
  const matchType = searchParams.get("matchType") || "leagueMatch";

  if (!clubId) {
    return NextResponse.json({ error: "club id is required" }, { status: 400 });
  }

  const [info, overallStats, members, matches, playoffAchievements] = await Promise.all([
    safeSection(getClubInfo(clubId, platform)),
    safeSection(getOverallStats(clubId, platform)),
    safeSection(getMemberStats(clubId, platform)),
    safeSection(getClubMatches(clubId, matchType, platform)),
    safeSection(getPlayoffAchievements(clubId, platform)),
  ]);

  // If literally everything failed, surface it as a real error instead of
  // a "successful" response full of empty sections.
  if (!info.ok && !overallStats.ok && !members.ok && !matches.ok && !playoffAchievements.ok) {
    return NextResponse.json(
      { error: info.error || "Couldn't load this club right now" },
      { status: 502 }
    );
  }

  return NextResponse.json({ info, overallStats, members, matches, playoffAchievements });
}
