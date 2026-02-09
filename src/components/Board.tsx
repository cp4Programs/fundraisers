"use client";

import { COLS, ROWS } from "@/lib/board";
import type { SquareRecord } from "@/lib/db";
import { Square } from "./Square";

interface BoardProps {
  squares: SquareRecord[];
  onSquareClick?: (cellIndex: number) => void;
}

export function Board({ squares, onSquareClick }: BoardProps) {
  const byIndex = new Map(squares.map((s) => [s.cellIndex, s]));

  return (
    <div
      className="inline-grid gap-1 sm:gap-2 p-2 bg-white/80 rounded-xl border-2 border-purple-200"
      style={{
        gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: ROWS * COLS }, (_, cellIndex) => {
        const record = byIndex.get(cellIndex);
        if (!record) return null;
        return (
          <Square
            key={cellIndex}
            cellIndex={cellIndex}
            displayValue={record.displayValue}
            status={record.status}
            onClick={onSquareClick ? () => onSquareClick(cellIndex) : undefined}
          />
        );
      })}
    </div>
  );
}
