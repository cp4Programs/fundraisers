import { auth } from "@/lib/auth";
import { getFundraiserById, releaseSquare } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const fundraiser = await getFundraiserById(id);
  if (!fundraiser || fundraiser.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = (await req.json()) as { cellIndex?: number };
  const cellIndex = body.cellIndex;
  if (typeof cellIndex !== "number" || cellIndex < 0 || cellIndex >= 40) {
    return NextResponse.json({ error: "Invalid cellIndex" }, { status: 400 });
  }
  const updated = await releaseSquare(id, cellIndex);
  if (!updated) {
    return NextResponse.json({ error: "Square not pending" }, { status: 409 });
  }
  return NextResponse.json(updated);
}
