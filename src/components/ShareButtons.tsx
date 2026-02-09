"use client";

import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  title: string;
  text: string;
  imageDownloadUrl?: string;
}

export function ShareButtons({ url, title, text, imageDownloadUrl }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") handleCopy();
      }
    } else {
      handleCopy();
    }
  }

  const base = typeof window !== "undefined" ? window.location.origin : "";
  const smsUrl = `sms:?body=${encodeURIComponent(`${text}\n${url}`)}`;
  const mailUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-purple-800">Share your fundraiser</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="px-4 py-2 rounded-lg border border-purple-300 text-purple-700 text-sm font-medium hover:bg-purple-50"
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
        >
          Share
        </button>
        {imageDownloadUrl && (
          <a
            href={imageDownloadUrl}
            download="fundraiser-board.png"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg border border-purple-300 text-purple-700 text-sm font-medium hover:bg-purple-50 inline-block"
          >
            Download image
          </a>
        )}
        <a
          href={smsUrl}
          className="px-4 py-2 rounded-lg border border-purple-300 text-purple-700 text-sm font-medium hover:bg-purple-50 inline-block"
        >
          Text link
        </a>
        <a
          href={mailUrl}
          className="px-4 py-2 rounded-lg border border-purple-300 text-purple-700 text-sm font-medium hover:bg-purple-50 inline-block"
        >
          Email link
        </a>
      </div>
    </div>
  );
}
