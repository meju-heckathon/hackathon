"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  clearAll,
  deleteEntry,
  listEntries,
  type HistoryEntry,
} from "@/lib/local-history";

export function HistoryList() {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    listEntries()
      .then((list) => {
        if (cancelled) return;
        setEntries(list);
        const map: Record<string, string> = {};
        for (const e of list) {
          map[e.id] = URL.createObjectURL(e.imageBlob);
        }
        setUrls(map);
      })
      .catch(() => setEntries([]));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(
    () => () => {
      for (const u of Object.values(urls)) URL.revokeObjectURL(u);
    },
    [urls],
  );

  const remove = async (id: string) => {
    await deleteEntry(id);
    setEntries((prev) => (prev ? prev.filter((e) => e.id !== id) : prev));
  };

  const wipe = async () => {
    if (!confirm("Delete all saved screenshots from this device?")) return;
    await clearAll();
    setEntries([]);
  };

  if (entries === null) {
    return <p className="text-center text-[var(--muted)]">…</p>;
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] p-10 text-center">
        <p className="text-[var(--muted)]">Nothing here yet.</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Upload a screenshot
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={wipe}
          className="text-xs text-[var(--danger)] hover:underline"
        >
          Clear all
        </button>
      </div>
      <ul className="space-y-3">
        {entries.map((e) => (
          <li
            key={e.id}
            className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3"
          >
            <Link
              href={`/history/${e.id}`}
              className="block h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[var(--accent-soft)]"
            >
              {urls[e.id] && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={urls[e.id]}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/history/${e.id}`}
                className="block font-semibold hover:underline"
              >
                {e.result.screen}
              </Link>
              {e.result.appGuess && (
                <p className="text-xs text-[var(--muted)]">
                  {e.result.appGuess}
                </p>
              )}
              <p className="mt-1 text-xs text-[var(--muted)]">
                {new Date(e.createdAt).toLocaleString()} ·{" "}
                {e.result.elements.length} elements
              </p>
            </div>
            <button
              onClick={() => remove(e.id)}
              className="self-start text-xs text-[var(--muted)] hover:text-[var(--danger)]"
              aria-label="Delete"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
