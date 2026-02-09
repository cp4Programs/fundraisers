import { ImageResponse } from "next/og";
import { getFundraiserWithSquaresBySlug } from "@/lib/db";
import { COLS, ROWS, getCellDisplay } from "@/lib/board";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) {
    return new Response("Missing slug", { status: 400 });
  }
  const fundraiser = await getFundraiserWithSquaresBySlug(slug);
  if (!fundraiser) {
    return new Response("Not found", { status: 404 });
  }

  const byIndex = new Map(fundraiser.squares.map((s) => [s.cellIndex, s]));
  const cellSize = 32;
  const gap = 4;
  const padding = 24;
  const boardW = COLS * cellSize + (COLS - 1) * gap + padding * 2;
  const boardH = ROWS * cellSize + (ROWS - 1) * gap + padding * 2 + 80;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #e9d5ff 0%, #c4b5fd 100%)",
          fontFamily: "system-ui",
          padding: 40,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 700, color: "#581c87", marginBottom: 8 }}>
          {fundraiser.title}
        </div>
        <div style={{ fontSize: 16, color: "#6b21a8", marginBottom: 20 }}>
          {fundraiser.dancerName} · Pick a square to donate
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            width: COLS * cellSize + (COLS - 1) * gap,
            gap,
          }}
        >
          {Array.from({ length: ROWS * COLS }, (_, i) => {
            const record = byIndex.get(i);
            const status = record?.status ?? "available";
            const display = record?.displayValue ?? getCellDisplay(i);
            const isClaimed = status === "claimed";
            const isPending = status === "pending";
            return (
              <div
                key={i}
                style={{
                  width: cellSize,
                  height: cellSize,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isClaimed ? "#c4b5fd" : isPending ? "#fde68a" : "#f5f3ff",
                  border: "2px solid #a78bfa",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 600,
                  color: isClaimed ? "#5b21b6" : "#4c1d95",
                  textDecoration: isClaimed ? "line-through" : "none",
                }}
              >
                {display === "star" ? "★" : display}
              </div>
            );
          })}
        </div>
      </div>
    ),
    {
      width: Math.max(400, boardW),
      height: Math.max(400, boardH),
    }
  );
}
