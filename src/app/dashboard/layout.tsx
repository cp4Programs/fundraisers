import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }
  return (
    <div className="min-h-screen bg-purple-50">
      <header className="border-b border-purple-200 bg-white px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold text-purple-900">
          And Dance Fundraiser
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-purple-700">{session.user.email ?? session.user.name}</span>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="text-sm text-purple-600 hover:text-purple-800"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
