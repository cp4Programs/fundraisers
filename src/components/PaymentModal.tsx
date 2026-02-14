"use client";

import { useState } from "react";
import { venmoPayUrl, venmoProfileUrl } from "@/lib/payments";
import type { CellDisplay } from "@/lib/board";

interface PaymentModalProps {
  cellIndex: number;
  displayValue: CellDisplay;
  dollarAmount: number | null;
  venmoHandle?: string;
  zelleEmail?: string;
  zellePhone?: string;
  fundraiserSlug: string;
  onClose: () => void;
  onClaimed: () => void;
}

export function PaymentModal({
  cellIndex,
  displayValue,
  dollarAmount,
  venmoHandle,
  zelleEmail,
  zellePhone,
  fundraiserSlug,
  onClose,
  onClaimed,
}: PaymentModalProps) {
  const [step, setStep] = useState<"name" | "pay">("name");
  const [donorName, setDonorName] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = dollarAmount ?? (customAmount ? Number(customAmount) : null);
  const isStar = displayValue === "star";

  async function handleClaim() {
    if (!donorName.trim()) {
      setError("Please enter your name");
      return;
    }
    if (isStar && (!customAmount || Number(customAmount) <= 0)) {
      setError("Please enter a valid amount");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fundraiserSlug,
          cellIndex,
          donorName: donorName.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to claim square");
      }
      setStep("pay");
      onClaimed();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const payAmount = amount ?? 0;
  const note = `Fundraisers Square ${isStar ? "⭐" : displayValue}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-purple-900">
            {step === "name" ? (isStar ? "Choose your amount" : `Claim square #${displayValue}`) : "Complete your donation"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-purple-500 hover:text-purple-700 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {step === "name" && (
          <>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-purple-800 mb-1">Your name</label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-3 py-2 border border-purple-200 rounded-lg"
                  placeholder="e.g. Alex"
                />
              </div>
              {isStar && (
                <div>
                  <label className="block text-sm font-medium text-purple-800 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-purple-200 rounded-lg"
                    placeholder="e.g. 50"
                  />
                </div>
              )}
            </div>
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleClaim}
                disabled={loading}
                className="flex-1 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? "Claiming…" : "Continue"}
              </button>
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-purple-200 text-purple-700">
                Cancel
              </button>
            </div>
          </>
        )}

        {step === "pay" && (
          <div className="space-y-4">
            <p className="text-purple-700">
              Send <strong>${payAmount}</strong> to complete your donation.
            </p>
            {venmoHandle && (
              <div>
                <p className="text-sm font-medium text-purple-800 mb-1">Venmo</p>
                <a
                  href={venmoPayUrl(venmoHandle, payAmount, note)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2 rounded-lg bg-[#008CFF] text-white font-medium text-center hover:opacity-90"
                >
                  Open Venmo — ${payAmount}
                </a>
                <a
                  href={venmoProfileUrl(venmoHandle)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-600 mt-1 inline-block hover:underline"
                >
                  Or open Venmo in browser
                </a>
              </div>
            )}
            {(zelleEmail || zellePhone) && (
              <div>
                <p className="text-sm font-medium text-purple-800 mb-1">Zelle</p>
                <p className="text-sm text-purple-700">
                  Send <strong>${payAmount}</strong> to {zelleEmail || zellePhone}.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const text = `Send $${payAmount} via Zelle to ${zelleEmail || zellePhone}. ${note}`;
                    void navigator.clipboard.writeText(text);
                  }}
                  className="mt-1 text-sm text-purple-600 hover:underline"
                >
                  Copy instructions
                </button>
              </div>
            )}
            {!venmoHandle && !zelleEmail && !zellePhone && (
              <p className="text-sm text-purple-600">Payment details are not set for this fundraiser.</p>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 rounded-lg border border-purple-200 text-purple-700 font-medium"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
