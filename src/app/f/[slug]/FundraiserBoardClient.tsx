"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Board } from "@/components/Board";
import { PaymentModal } from "@/components/PaymentModal";
import { getCellDollarAmount } from "@/lib/board";
import type { SquareRecord } from "@/lib/db";

interface FundraiserBoardClientProps {
  fundraiserSlug: string;
  squares: SquareRecord[];
  venmoHandle?: string;
  zelleEmail?: string;
  zellePhone?: string;
}

export function FundraiserBoardClient({
  fundraiserSlug,
  squares: initialSquares,
  venmoHandle,
  zelleEmail,
  zellePhone,
}: FundraiserBoardClientProps) {
  const router = useRouter();
  const [squares, setSquares] = useState(initialSquares);
  const [selectedCell, setSelectedCell] = useState<number | null>(null);

  const selectedSquare = selectedCell != null ? squares.find((s) => s.cellIndex === selectedCell) : null;

  function handleSquareClick(cellIndex: number) {
    setSelectedCell(cellIndex);
  }

  function handleCloseModal() {
    setSelectedCell(null);
  }

  function handleClaimed() {
    if (selectedCell == null) return;
    setSquares((prev) =>
      prev.map((s) =>
        s.cellIndex === selectedCell ? { ...s, status: "pending" as const } : s
      )
    );
    router.refresh();
  }

  return (
    <>
      <Board squares={squares} onSquareClick={handleSquareClick} />
      {selectedSquare && (
        <PaymentModal
          cellIndex={selectedSquare.cellIndex}
          displayValue={selectedSquare.displayValue}
          dollarAmount={getCellDollarAmount(selectedSquare.cellIndex)}
          venmoHandle={venmoHandle}
          zelleEmail={zelleEmail}
          zellePhone={zellePhone}
          fundraiserSlug={fundraiserSlug}
          onClose={handleCloseModal}
          onClaimed={handleClaimed}
        />
      )}
    </>
  );
}
