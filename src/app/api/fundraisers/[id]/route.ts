import { auth } from "@/lib/auth";
import { getFundraiserById, updateFundraiserPhoto } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const existing = await getFundraiserById(id);
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = (await req.json()) as { dancerPhotoS3Key?: string };
  if (typeof body.dancerPhotoS3Key === "string") {
    await updateFundraiserPhoto(id, body.dancerPhotoS3Key);
  }
  const updated = await getFundraiserById(id);
  return NextResponse.json(updated);
}
