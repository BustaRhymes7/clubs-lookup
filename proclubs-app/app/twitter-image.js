import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0b0e14",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 64, color: "#f5f7fa", fontWeight: 700, display: "flex" }}>
          Clubs Lookup
        </div>
        <div style={{ fontSize: 28, color: "#8b93a7", marginTop: 20, display: "flex" }}>
          Free Pro Clubs stats — record, form, squad, and player breakdowns
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 18,
            color: "#22e584",
            border: "2px solid #22e584",
            borderRadius: 999,
            padding: "8px 24px",
            display: "flex",
          }}
        >
          Unofficial fan project — not affiliated with EA
        </div>
      </div>
    ),
    size
  );
}
