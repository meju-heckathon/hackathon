"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getEntry, type HistoryEntry } from "@/lib/local-history";
import { ResultView } from "./ResultView";

export function HistoryDetail({ id }: { id: string }) {
  const [entry, setEntry] = useState<HistoryEntry | null | undefined>(
    undefined,
  );
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let revoke: string | null = null;
    getEntry(id)
      .then((e) => {
        if (!e) {
          setEntry(null);
          return;
        }
        const objectUrl = URL.createObjectURL(e.imageBlob);
        revoke = objectUrl;
        setUrl(objectUrl);
        setEntry(e);
      })
      .catch(() => setEntry(null));
    return () => {
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [id]);

  if (entry === undefined) {
    return <p className="text-center text-[var(--muted)]">Loading…</p>;
  }

  if (entry === null) {
    return (
      <div className="rounded-[22px] border border-dashed border-[var(--line)] bg-[var(--surface)] p-12 text-center">
        <p className="text-[14.5px] text-[var(--fg-sub)]">
          This entry isn&apos;t on this device. It may have been opened in a
          different browser, or cleared.
        </p>
        <Link
          href="/history"
          className="font-display mt-4 inline-block text-sm font-semibold text-[var(--accent)] hover:underline"
        >
          ← Back to Saved
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-[env(safe-area-inset-top)] z-30 -mx-4 -mt-8 flex items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--background)] px-4 py-2.5 shadow-[0_4px_12px_-8px_rgba(15,30,60,0.15)] sm:-mx-6 sm:px-6">
        <Link
          href="/history"
          className="font-display inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--fg-sub)] hover:text-[var(--accent-deep)]"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M15 6L9 12L15 18"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          All saved
        </Link>
        <a
          href="/"
          className="font-display inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2 text-[13px] font-bold text-white hover:bg-[var(--accent-deep)]"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 8V16M8 12H16"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
          Scan another
        </a>
      </div>
      <p className="text-[11.5px] text-[var(--muted)]">
        Scanned {new Date(entry.createdAt).toLocaleString()}
      </p>
      {url && (
        <ResultView
          imageUrl={url}
          result={entry.result}
          onScanAnother={() => {
            window.location.href = "/";
          }}
        />
      )}
    </div>
  );
}
