import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f3d2e",
          borderRadius: 36,
        }}
      >
        <div
          style={{
            width: 128,
            height: 128,
            borderRadius: 64,
            background: "#f4f1ea",
            border: "6px solid #e8a33d",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 68,
          }}
        >
          ⚽
        </div>
      </div>
    ),
    { ...size }
  );
}
