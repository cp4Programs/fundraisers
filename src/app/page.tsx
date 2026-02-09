import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-purple-100 to-purple-200">
      <h1 className="text-3xl font-bold text-purple-900 mb-4">
        And Dance Fundraiser
      </h1>
      <p className="text-purple-800 mb-8 text-center max-w-md">
        Support dance competition season. Pick a square, make a donation.
      </p>
      <div className="flex gap-4">
        <Link
          href="/sign-in"
          className="px-6 py-3 rounded-lg bg-white border border-purple-300 text-purple-700 font-medium hover:bg-purple-50"
        >
          Sign in
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700"
        >
          Creator Dashboard
        </Link>
      </div>
    </main>
  );
}
