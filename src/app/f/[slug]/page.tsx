import { getFundraiserWithSquaresBySlug } from "@/lib/db";
import { getReadPresignedUrl } from "@/lib/s3";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DancerProfile } from "@/components/DancerProfile";
import { FundraiserBoardClient } from "./FundraiserBoardClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const fundraiser = await getFundraiserWithSquaresBySlug(slug);
  if (!fundraiser) return {};
  const claimed = fundraiser.squares.filter((s) => s.status === "claimed").length;
  const total = fundraiser.squares.length;
  return {
    title: `${fundraiser.title} — ${fundraiser.dancerName}`,
    description: `Support ${fundraiser.dancerName}. Pick a square to donate. ${claimed}/${total} squares claimed.`,
    openGraph: {
      title: `${fundraiser.title} — ${fundraiser.dancerName}`,
      description: `Pick a square to donate. ${claimed}/${total} claimed.`,
    },
  };
}

export default async function PublicFundraiserPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fundraiser = await getFundraiserWithSquaresBySlug(slug);
  if (!fundraiser) notFound();

  let photoUrl: string | null = null;
  if (fundraiser.dancerPhotoS3Key) {
    photoUrl = await getReadPresignedUrl(fundraiser.dancerPhotoS3Key);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-100 to-purple-200 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <DancerProfile
          dancerName={fundraiser.dancerName}
          title={fundraiser.title}
          photoUrl={photoUrl}
        />
        <p className="text-purple-800 text-center mb-4">
          Pick a square to donate. The number is the amount in dollars; stars let you choose your amount.
        </p>
        <FundraiserBoardClient
          fundraiserSlug={fundraiser.slug}
          squares={fundraiser.squares}
          venmoHandle={fundraiser.venmoHandle}
          zelleEmail={fundraiser.zelleEmail}
          zellePhone={fundraiser.zellePhone}
        />
        <p className="text-center text-sm text-purple-600 mt-6">
          Thank you for supporting dance!
        </p>
      </div>
    </main>
  );
}
