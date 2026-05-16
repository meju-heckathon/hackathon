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
      <div className="rounded-2xl border border-dashed border-[var(--border)] p-10 text-center">
        <p className="text-[var(--muted)]">
          This entry isn&apos;t on this device. It may have been opened in a
          different browser, or cleared.
        </p>
        <Link
          href="/history"
          className="mt-4 inline-block text-sm text-[var(--accent)] hover:underline"
        >
          ← Back to history
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/history"
          className="text-sm text-[var(--accent)] hover:underline"
        >
          ← All screenshots
        </Link>
        <p className="text-xs text-[var(--muted)]">
          {new Date(entry.createdAt).toLocaleString()}
        </p>
      </div>
      {url && <ResultView imageUrl={url} result={entry.result} />}
    </div>
  );
}
