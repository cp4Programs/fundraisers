/**
 * Fixed 5 rows x 8 columns = 40 cells.
 * 35 numbered squares ($1-$35), 5 star squares (custom amount) on diagonal.
 * Star positions: (0,1), (1,2), (2,3), (3,4), (4,5) in row,col 0-based (diagonal).
 */
export const ROWS = 5;
export const COLS = 8;
export const TOTAL_CELLS = ROWS * COLS; // 40

/** 0-based cell index -> display value: number 1-35 or "star" */
const STAR_INDEXES = new Set([1, 10, 19, 28, 37]); // cell indices that are stars (0-based, diagonal)

export type CellDisplay = number | "star";

export function getCellDisplay(cellIndex: number): CellDisplay {
  if (cellIndex < 0 || cellIndex >= TOTAL_CELLS) throw new Error("Invalid cell index");
  if (STAR_INDEXES.has(cellIndex)) return "star";
  // Numbered: 1..35 in order, skipping star positions
  let n = 0;
  for (let i = 0; i <= cellIndex; i++) {
    if (STAR_INDEXES.has(i)) continue;
    n++;
  }
  return n;
}

/** Dollar amount for a cell: number for numbered squares, null for star (custom). */
export function getCellDollarAmount(cellIndex: number): number | null {
  const d = getCellDisplay(cellIndex);
  return d === "star" ? null : d;
}

/** All cell indices in grid order (0..39). */
export function getAllCellIndices(): number[] {
  return Array.from({ length: TOTAL_CELLS }, (_, i) => i);
}

/** Row and column for a cell index (0-based). */
export function indexToRowCol(cellIndex: number): { row: number; col: number } {
  return {
    row: Math.floor(cellIndex / COLS),
    col: cellIndex % COLS,
  };
}

export function rowColToIndex(row: number, col: number): number {
  return row * COLS + col;
}
