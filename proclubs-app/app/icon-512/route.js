import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0b0e14",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 340,
            height: 340,
            borderRadius: "50%",
            border: "24px solid #22e584",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 180,
          }}
        >
          ⚽
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
