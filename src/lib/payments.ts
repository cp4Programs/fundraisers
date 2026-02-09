/**
 * Venmo deep link (undocumented, may change).
 * Mobile: opens app with pre-filled pay. Desktop: fallback to profile URL.
 */
export function venmoPayUrl(handle: string, amount: number, note: string): string {
  const cleanHandle = handle.replace(/^@/, "").trim();
  const params = new URLSearchParams({
    txn: "pay",
    recipients: cleanHandle,
    amount: String(amount),
    note: note.slice(0, 200),
  });
  return `venmo://paycharge?${params.toString()}`;
}

export function venmoProfileUrl(handle: string): string {
  const cleanHandle = handle.replace(/^@/, "").trim();
  return `https://venmo.com/${cleanHandle}`;
}
