import { ImageResponse } from "next/og";
import { getFundraiserWithSquaresBySlug } from "@/lib/db";

export const alt = "Dance fundraiser — pick a square to donate";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fundraiser = await getFundraiserWithSquaresBySlug(slug);
  if (!fundraiser) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #e9d5ff 0%, #c4b5fd 100%)",
            fontFamily: "system-ui",
          }}
        >
          <span style={{ fontSize: 32, color: "#581c87" }}>Fundraiser not found</span>
        </div>
      ),
      { ...size }
    );
  }

  const claimed = fundraiser.squares.filter((s) => s.status === "claimed").length;
  const total = fundraiser.squares.length;
  const pct = total ? Math.round((claimed / total) * 100) : 0;

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
          padding: 48,
        }}
      >
        <div style={{ fontSize: 36, fontWeight: 700, color: "#581c87", marginBottom: 16, textAlign: "center" }}>
          {fundraiser.title}
        </div>
        <div style={{ fontSize: 28, color: "#6b21a8", marginBottom: 24 }}>
          {fundraiser.dancerName}
        </div>
        <div style={{ fontSize: 24, color: "#7c3aed" }}>
          {claimed} of {total} squares claimed ({pct}%)
        </div>
        <div style={{ fontSize: 20, color: "#6b21a8", marginTop: 16 }}>
          Pick a square · Support dance
        </div>
      </div>
    ),
    { ...size }
  );
}
