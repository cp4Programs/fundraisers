import { auth } from "@/lib/auth";
import { getFundraiserWithSquares } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

export default async function ManageFundraiserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  const { id } = await params;
  const fundraiser = await getFundraiserWithSquares(id);
  if (!fundraiser || fundraiser.userId !== session.user.id) notFound();

  const pending = fundraiser.squares.filter((s) => s.status === "pending");
  const claimed = fundraiser.squares.filter((s) => s.status === "claimed");

  return (
    <div>
      <Link href="/dashboard" className="text-sm text-purple-600 hover:underline mb-4 inline-block">
        Back to dashboard
      </Link>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-purple-900">{fundraiser.title}</h1>
          <p className="text-purple-600">{fundraiser.dancerName} · /f/{fundraiser.slug}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/f/${fundraiser.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            View page
          </Link>
          <Link
            href={`/dashboard/fundraiser/${id}/share`}
            className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
          >
            Share
          </Link>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="bg-white rounded-lg border border-purple-200 p-4">
          <h2 className="font-semibold text-purple-900 mb-2">Summary</h2>
          <p className="text-sm text-purple-700">
            {claimed.length} claimed · {pending.length} pending · {fundraiser.squares.length - claimed.length - pending.length} available
          </p>
        </section>
        <section className="bg-white rounded-lg border border-purple-200 p-4">
          <h2 className="font-semibold text-purple-900 mb-2">Pending claims</h2>
          {pending.length === 0 ? (
            <p className="text-sm text-purple-600">No pending claims.</p>
          ) : (
            <p className="text-sm text-purple-700">
              {pending.length} square(s) awaiting your confirmation. Confirm when you receive payment.
            </p>
          )}
        </section>
      </div>
      <div className="mt-6">
        <Link
          href={`/dashboard/fundraiser/${id}/confirm`}
          className="inline-block px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
        >
          Confirm payments
        </Link>
      </div>
    </div>
  );
}
