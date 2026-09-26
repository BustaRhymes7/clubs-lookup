import { NextResponse } from "next/server";
import { searchClubs } from "../../../lib/ea";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const clubName = searchParams.get("clubName");
  const platform = searchParams.get("platform");

  if (!clubName || !clubName.trim()) {
    return NextResponse.json({ error: "clubName is required" }, { status: 400 });
  }

  try {
    const data = await searchClubs(clubName.trim(), platform);
    // EA returns an object keyed by clubId, not an array - normalize it
    // so the frontend can just .map() over it.
    const results = data && typeof data === "object" ? Object.values(data) : [];
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Search failed" }, { status: 502 });
  }
}
