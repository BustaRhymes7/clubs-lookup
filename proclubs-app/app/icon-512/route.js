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
          background: "#0b0e14",
        }}
      >
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: 90,
            background: "#151a25",
            border: "14px solid #22e584",
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
