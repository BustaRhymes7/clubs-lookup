import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
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
        }}
      >
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: 180,
            background: "#f4f1ea",
            border: "16px solid #e8a33d",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 200,
          }}
        >
          ⚽
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
