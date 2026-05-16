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
      <div className="rounded-[22px] border border-dashed border-[var(--line)] bg-[var(--surface)] p-12 text-center">
        <p className="font-display text-[15px] font-semibold text-[var(--fg-sub)]">
          Nothing saved yet.
        </p>
        <p className="mt-1 text-[13px] text-[var(--muted)]">
          Translated screens you analyze will show up here.
        </p>
        <Link
          href="/"
          className="font-display mt-5 inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--accent-deep)]"
        >
          Snap a screenshot
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 12H19M12 5L19 12L12 19"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          onClick={wipe}
          className="font-display text-[11.5px] font-bold uppercase tracking-[0.06em] text-[var(--danger)] hover:underline"
        >
          Clear all
        </button>
      </div>
      <ul className="space-y-2.5">
        {entries.map((e) => (
          <li
            key={e.id}
            className="grid grid-cols-[68px_1fr_auto] items-center gap-4 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-3 transition hover:border-[var(--accent)] hover:shadow-[0_10px_24px_-12px_rgba(49,130,246,0.35)]"
          >
            <Link
              href={`/history/${e.id}`}
              className="block h-[88px] w-[68px] shrink-0 overflow-hidden rounded-[10px] border border-[var(--line)] bg-gradient-to-b from-[#f8f9fa] to-[#eef1f4]"
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
            <div className="min-w-0">
              {e.result.appGuess && (
                <span className="font-display inline-flex items-center rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10.5px] font-bold tracking-tight text-[var(--accent-deep)]">
                  {e.result.appGuess}
                </span>
              )}
              <Link
                href={`/history/${e.id}`}
                className="font-display mt-1.5 block truncate text-[14.5px] font-bold leading-tight tracking-[-0.02em] hover:underline"
              >
                {e.result.screen}
              </Link>
              <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                {e.result.elements.length} buttons
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-[11px] text-[var(--muted)]">
                {relativeTime(e.createdAt)}
              </span>
              <button
                onClick={() => remove(e.id)}
                className="text-[13px] text-[var(--muted)] hover:text-[var(--danger)]"
                aria-label="Delete"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function relativeTime(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(ts).toLocaleDateString();
}
