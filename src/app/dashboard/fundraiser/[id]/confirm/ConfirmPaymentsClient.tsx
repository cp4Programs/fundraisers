"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PendingSquare {
  cellIndex: number;
  displayValue: number | "star";
  dollarAmount: number | null;
  donorName?: string;
}

interface ConfirmPaymentsClientProps {
  fundraiserId: string;
  pendingSquares: PendingSquare[];
}

export function ConfirmPaymentsClient({ fundraiserId, pendingSquares }: ConfirmPaymentsClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<number | null>(null);

  async function confirm(cellIndex: number) {
    setLoading(cellIndex);
    try {
      const res = await fetch(`/api/fundraisers/${fundraiserId}/squares/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cellIndex }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function release(cellIndex: number) {
    setLoading(cellIndex);
    try {
      const res = await fetch(`/api/fundraisers/${fundraiserId}/squares/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cellIndex }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <ul className="space-y-3">
      {pendingSquares.map((s) => (
        <li
          key={s.cellIndex}
          className="flex items-center justify-between gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg"
        >
          <div>
            <span className="font-medium text-purple-900">
              Square {s.displayValue === "star" ? "★" : s.displayValue}
              {s.dollarAmount != null && ` ($${s.dollarAmount})`}
            </span>
            {s.donorName && (
              <p className="text-sm text-purple-600">Donor: {s.donorName}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => confirm(s.cellIndex)}
              disabled={loading !== null}
              className="px-3 py-1.5 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {loading === s.cellIndex ? "…" : "Confirm paid"}
            </button>
            <button
              type="button"
              onClick={() => release(s.cellIndex)}
              disabled={loading !== null}
              className="px-3 py-1.5 rounded border border-purple-300 text-purple-700 text-sm hover:bg-purple-50 disabled:opacity-50"
            >
              Release
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
