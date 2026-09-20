import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Clubs Lookup — live EA Pro Clubs stats, match history, and player breakdowns";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0b0e14",
          color: "#f5f7fa",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 26, color: "#22e584", fontWeight: 700, letterSpacing: 2, display: "flex" }}>
          ⚽ UNOFFICIAL FAN PROJECT
        </div>
        <div style={{ fontSize: 100, fontWeight: 700, marginTop: 20, display: "flex" }}>
          Clubs Lookup
        </div>
        <div style={{ fontSize: 30, color: "#8b93a7", marginTop: 24, display: "flex", maxWidth: 900 }}>
          Club stats, match history &amp; full player breakdowns — live from EA.
        </div>
      </div>
    ),
    { ...size }
  );
}
