import { getFundraiserBySlug } from "@/lib/db";
import { claimSquare } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = (await req.json()) as { fundraiserSlug?: string; cellIndex?: number; donorName?: string };
  const { fundraiserSlug, cellIndex, donorName } = body;
  if (
    typeof fundraiserSlug !== "string" ||
    typeof cellIndex !== "number" ||
    typeof donorName !== "string" ||
    donorName.trim() === ""
  ) {
    return NextResponse.json(
      { error: "fundraiserSlug, cellIndex, and donorName required" },
      { status: 400 }
    );
  }
  const fundraiser = await getFundraiserBySlug(fundraiserSlug);
  if (!fundraiser) {
    return NextResponse.json({ error: "Fundraiser not found" }, { status: 404 });
  }
  const id = fundraiser.PK.replace("FUNDRAISER#", "");
  if (cellIndex < 0 || cellIndex >= 40) {
    return NextResponse.json({ error: "Invalid square" }, { status: 400 });
  }
  try {
    const updated = await claimSquare(id, cellIndex, donorName.trim());
    if (!updated) {
      return NextResponse.json({ error: "Square is not available" }, { status: 409 });
    }
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to claim square" }, { status: 500 });
  }
}
