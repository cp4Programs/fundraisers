import { auth } from "@/lib/auth";
import { getFundraiserById } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ShareButtons } from "@/components/ShareButtons";

export default async function ShareFundraiserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  const { id } = await params;
  const fundraiser = await getFundraiserById(id);
  if (!fundraiser || fundraiser.userId !== session.user.id) notFound();

  const base = process.env.AUTH_URL ?? "https://anddance.com";
  const url = `${base}/f/${fundraiser.slug}`;
  const title = `${fundraiser.title} — ${fundraiser.dancerName}`;
  const text = `Support ${fundraiser.dancerName}! Pick a square to donate:`;
  const imageDownloadUrl = `/api/og/board?slug=${encodeURIComponent(fundraiser.slug)}`;

  return (
    <div>
      <Link
        href={`/dashboard/fundraiser/${id}`}
        className="text-sm text-purple-600 hover:underline mb-4 inline-block"
      >
        Back to fundraiser
      </Link>
      <h1 className="text-2xl font-bold text-purple-900 mb-4">Share your fundraiser</h1>
      <p className="text-purple-700 mb-4">
        Post the link or image to Instagram, Facebook, TikTok, or send by text or email.
      </p>
      <div className="bg-white rounded-lg border border-purple-200 p-6">
        <ShareButtons
          url={url}
          title={title}
          text={text}
          imageDownloadUrl={imageDownloadUrl}
        />
      </div>
      <p className="text-sm text-purple-600 mt-4">Link: {url}</p>
    </div>
  );
}
