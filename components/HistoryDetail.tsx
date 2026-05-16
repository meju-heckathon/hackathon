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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/history"
          className="font-display text-sm font-semibold text-[var(--accent)] hover:underline"
        >
          ← All saved
        </Link>
        <p className="text-[11.5px] text-[var(--muted)]">
          {new Date(entry.createdAt).toLocaleString()}
        </p>
      </div>
      {url && <ResultView imageUrl={url} result={entry.result} />}
    </div>
  );
}
