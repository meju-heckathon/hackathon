"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listEntries, type HistoryEntry } from "@/lib/local-history";

export function RecentScreens() {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    listEntries()
      .then((list) => {
        if (cancelled) return;
        const top = list.slice(0, 3);
        setEntries(top);
        const map: Record<string, string> = {};
        for (const e of top) {
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

  if (!entries || entries.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-[17px] font-bold tracking-[-0.02em]">
          Recent screens
        </h2>
        <Link
          href="/history"
          className="font-display text-[12.5px] font-semibold text-[var(--accent)] hover:underline"
        >
          See all →
        </Link>
      </div>
      <ul className="space-y-2.5">
        {entries.map((e) => (
          <li key={e.id}>
            <Link
              href={`/history/${e.id}`}
              className="grid grid-cols-[68px_1fr_auto] items-center gap-4 rounded-[14px] border border-[var(--line)] bg-[var(--surface)] p-3 transition hover:border-[var(--accent)] hover:shadow-[0_10px_24px_-12px_rgba(49,130,246,0.35)]"
            >
              <span className="block h-[88px] w-[68px] shrink-0 overflow-hidden rounded-[10px] border border-[var(--line)] bg-gradient-to-b from-[#f8f9fa] to-[#eef1f4]">
                {urls[e.id] && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={urls[e.id]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </span>
              <div className="min-w-0">
                {e.result.appGuess && (
                  <span className="font-display inline-flex items-center rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10.5px] font-bold tracking-tight text-[var(--accent-deep)]">
                    {e.result.appGuess}
                  </span>
                )}
                <p className="font-display mt-1.5 truncate text-[14.5px] font-bold leading-tight tracking-[-0.02em]">
                  {e.result.screen}
                </p>
                <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                  {e.result.elements.length} buttons
                </p>
              </div>
              <span className="text-[11px] text-[var(--muted)]">
                {relativeTime(e.createdAt)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
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
