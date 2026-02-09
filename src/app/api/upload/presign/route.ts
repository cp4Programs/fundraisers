import { auth } from "@/lib/auth";
import { getUploadPresignedUrl, dancerPhotoKey } from "@/lib/s3";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { fundraiserId, contentType } = body as { fundraiserId?: string; contentType?: string };
  if (!fundraiserId || !contentType?.startsWith("image/")) {
    return NextResponse.json(
      { error: "fundraiserId and contentType (image/*) required" },
      { status: 400 }
    );
  }
  const ext = contentType.split("/")[1] === "jpeg" ? "jpg" : contentType.split("/")[1] ?? "jpg";
  const key = dancerPhotoKey(fundraiserId, ext);
  const url = await getUploadPresignedUrl(key, contentType);
  if (!url) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }
  return NextResponse.json({ uploadUrl: url, key });
}
