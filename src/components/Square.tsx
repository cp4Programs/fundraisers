"use client";

import type { SquareStatus } from "@/lib/db";
import type { CellDisplay } from "@/lib/board";

interface SquareProps {
  cellIndex: number;
  displayValue: CellDisplay;
  status: SquareStatus;
  onClick?: () => void;
}

export function Square({ cellIndex, displayValue, status, onClick }: SquareProps) {
  const isAvailable = status === "available";
  const isPending = status === "pending";
  const isClaimed = status === "claimed";

  const base =
    "w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded border-2 font-semibold text-sm transition-colors";
  const available =
    "border-purple-300 bg-purple-50 text-purple-800 hover:border-purple-500 hover:bg-purple-100 cursor-pointer";
  const pending = "border-amber-400 bg-amber-50 text-amber-800 cursor-wait";
  const claimed = "border-purple-200 bg-purple-100 text-purple-500 line-through";

  let style = base + " ";
  if (isAvailable) style += available;
  else if (isPending) style += pending;
  else style += claimed;

  return (
    <button
      type="button"
      className={style}
      onClick={isAvailable ? onClick : undefined}
      disabled={!isAvailable}
      aria-label={
        isAvailable
          ? `Claim square ${displayValue === "star" ? "custom amount" : `$${displayValue}`}`
          : isClaimed
            ? "Claimed"
            : "Pending"
      }
    >
      {displayValue === "star" ? (
        <span className="text-amber-500" aria-hidden>★</span>
      ) : (
        displayValue
      )}
    </button>
  );
}
