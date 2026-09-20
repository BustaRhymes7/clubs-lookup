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
          background: "#0a2b20",
          color: "#f4f1ea",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 28, color: "#e8a33d", letterSpacing: 4, display: "flex" }}>
          PRO CLUBS · LIVE FROM EA
        </div>
        <div style={{ fontSize: 96, fontWeight: 700, marginTop: 20, display: "flex" }}>
          Clubs Lookup
        </div>
        <div style={{ fontSize: 32, color: "#9db8a8", marginTop: 24, display: "flex", maxWidth: 900 }}>
          Club stats, match history &amp; full player breakdowns — live.
        </div>
      </div>
    ),
    { ...size }
  );
}
