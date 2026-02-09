import { auth } from "@/lib/auth";
import { getFundraiserWithSquares } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCellDisplay, getCellDollarAmount } from "@/lib/board";
import { ConfirmPaymentsClient } from "./ConfirmPaymentsClient";

export default async function ConfirmPaymentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");
  const { id } = await params;
  const fundraiser = await getFundraiserWithSquares(id);
  if (!fundraiser || fundraiser.userId !== session.user.id) notFound();

  const pending = fundraiser.squares
    .filter((s) => s.status === "pending")
    .map((s) => ({
      cellIndex: s.cellIndex,
      displayValue: s.displayValue,
      dollarAmount: getCellDollarAmount(s.cellIndex),
      donorName: s.donorName,
    }));

  return (
    <div>
      <Link
        href={`/dashboard/fundraiser/${id}`}
        className="text-sm text-purple-600 hover:underline mb-4 inline-block"
      >
        Back to fundraiser
      </Link>
      <h1 className="text-2xl font-bold text-purple-900 mb-2">Confirm payments</h1>
      <p className="text-purple-700 mb-6">
        When you receive payment, mark the square as claimed. If the donor doesn’t pay, release it so others can claim it.
      </p>
      {pending.length === 0 ? (
        <p className="text-purple-600">No pending claims right now.</p>
      ) : (
        <ConfirmPaymentsClient
          fundraiserId={id}
          pendingSquares={pending}
        />
      )}
    </div>
  );
}
