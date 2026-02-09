import { cookies } from "next/headers";
import Link from "next/link";

async function getFundraisers() {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.AUTH_URL ?? "http://localhost:3000";
  const cookieStore = await cookies();
  const res = await fetch(`${base}/api/fundraisers`, {
    cache: "no-store",
    headers: { cookie: cookieStore.toString() },
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function DashboardPage() {
  const fundraisers = await getFundraisers();
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-purple-900">My fundraisers</h1>
        <Link
          href="/dashboard/fundraiser/new"
          className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700"
        >
          New fundraiser
        </Link>
      </div>
      {fundraisers.length === 0 ? (
        <p className="text-purple-700">You haven’t created any fundraisers yet. Create one to get started.</p>
      ) : (
        <ul className="space-y-4">
          {fundraisers.map((f: { PK: string; slug: string; title: string; dancerName: string }) => {
            const id = f.PK.replace("FUNDRAISER#", "");
            return (
              <li key={id} className="bg-white rounded-lg border border-purple-200 p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-purple-900">{f.title}</p>
                  <p className="text-sm text-purple-600">{f.dancerName} · /f/{f.slug}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/f/${f.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:underline"
                  >
                    View
                  </Link>
                  <Link
                    href={`/dashboard/fundraiser/${id}`}
                    className="text-sm text-purple-600 hover:underline"
                  >
                    Manage
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
