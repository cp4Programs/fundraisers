"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewFundraiserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [dancerName, setDancerName] = useState("");
  const [venmoHandle, setVenmoHandle] = useState("");
  const [zelleEmail, setZelleEmail] = useState("");
  const [zellePhone, setZellePhone] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const slugNorm = slug.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "fundraiser";
      const res = await fetch("/api/fundraisers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slugNorm,
          title: title.trim() || "Dance Fundraiser",
          dancerName: dancerName.trim(),
          venmoHandle: venmoHandle.trim() || undefined,
          zelleEmail: zelleEmail.trim() || undefined,
          zellePhone: zellePhone.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to create fundraiser");
      }
      const data = await res.json();
      const fundraiserId = data.id as string;

      if (photoFile && photoFile.type.startsWith("image/")) {
        const presignRes = await fetch("/api/upload/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fundraiserId,
            contentType: photoFile.type,
          }),
        });
        if (presignRes.ok) {
          const { uploadUrl, key } = await presignRes.json();
          await fetch(uploadUrl, {
            method: "PUT",
            body: photoFile,
            headers: { "Content-Type": photoFile.type },
          });
          await fetch(`/api/fundraisers/${fundraiserId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dancerPhotoS3Key: key }),
          });
        }
      }

      router.push(`/dashboard/fundraiser/${fundraiserId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl">
      <Link href="/dashboard" className="text-sm text-purple-600 hover:underline mb-4 inline-block">
        Back to dashboard
      </Link>
      <h1 className="text-2xl font-bold text-purple-900 mb-6">New fundraiser</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg border border-purple-200 p-6">
        {error && (
          <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>
        )}
        <div>
          <label className="block text-sm font-medium text-purple-800 mb-1">Dancer name</label>
          <input
            type="text"
            value={dancerName}
            onChange={(e) => setDancerName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-purple-200 rounded-lg"
            placeholder="e.g. Maya"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-purple-800 mb-1">Fundraiser title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-purple-200 rounded-lg"
            placeholder="e.g. AND DANCE 2025-2026 SYNERGY ASPIRE"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-purple-800 mb-1">URL slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full px-3 py-2 border border-purple-200 rounded-lg"
            placeholder="e.g. maya-2026"
          />
          <p className="text-xs text-purple-600 mt-1">Your page will be /f/{slug.trim() || "fundraiser"}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-purple-800 mb-1">Dancer photo (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-purple-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-purple-800 mb-1">Venmo handle (optional)</label>
          <input
            type="text"
            value={venmoHandle}
            onChange={(e) => setVenmoHandle(e.target.value)}
            className="w-full px-3 py-2 border border-purple-200 rounded-lg"
            placeholder="e.g. @username"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-purple-800 mb-1">Zelle email (optional)</label>
          <input
            type="email"
            value={zelleEmail}
            onChange={(e) => setZelleEmail(e.target.value)}
            className="w-full px-3 py-2 border border-purple-200 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-purple-800 mb-1">Zelle phone (optional)</label>
          <input
            type="tel"
            value={zellePhone}
            onChange={(e) => setZellePhone(e.target.value)}
            className="w-full px-3 py-2 border border-purple-200 rounded-lg"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create fundraiser"}
        </button>
      </form>
    </div>
  );
}
