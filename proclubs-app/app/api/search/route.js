import { NextResponse } from "next/server";
import { searchClubs } from "../../../lib/ea";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const clubName = searchParams.get("clubName");
  const platform = searchParams.get("platform") || undefined;

  if (!clubName || clubName.trim().length === 0) {
    return NextResponse.json({ error: "clubName is required" }, { status: 400 });
  }

  try {
    const results = await searchClubs(clubName.trim(), platform);
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
