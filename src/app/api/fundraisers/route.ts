import { auth } from "@/lib/auth";
import { createFundraiser, listFundraisersByUser, type CreateFundraiserInput } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const list = await listFundraisersByUser(session.user.id);
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as Partial<CreateFundraiserInput>;
  const { slug, title, dancerName, dancerPhotoS3Key, venmoHandle, zelleEmail, zellePhone } = body;
  if (!slug?.trim() || !title?.trim() || !dancerName?.trim()) {
    return NextResponse.json(
      { error: "slug, title, and dancerName are required" },
      { status: 400 }
    );
  }
  const slugNorm = slug.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  if (!slugNorm) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }
  try {
    const meta = await createFundraiser({
      userId: session.user.id,
      slug: slugNorm,
      title: title.trim(),
      dancerName: dancerName.trim(),
      dancerPhotoS3Key: dancerPhotoS3Key?.trim() || undefined,
      venmoHandle: venmoHandle?.trim() || undefined,
      zelleEmail: zelleEmail?.trim() || undefined,
      zellePhone: zellePhone?.trim() || undefined,
    });
    const id = meta.PK.replace("FUNDRAISER#", "");
    return NextResponse.json({ id, ...meta });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create fundraiser" }, { status: 500 });
  }
}
