"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readEntries, removeEntry, type WaitEntry } from "@/lib/wait-store";
import { restaurants } from "@/lib/restaurants";
import type { Dictionary, Locale } from "@/app/[locale]/dictionaries";

export function MyWaitList({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const [entries, setEntries] = useState<WaitEntry[] | null>(null);

  useEffect(() => {
    setEntries(readEntries());
  }, []);

  const leave = (id: string) => {
    removeEntry(id);
    setEntries(readEntries());
  };

  if (entries === null) {
    return <div className="py-8 text-center text-[var(--muted)]">…</div>;
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] p-10 text-center">
        <p className="text-[var(--muted)]">{dict.myWait.empty}</p>
        <Link
          href={`/${locale}/restaurants`}
          className="mt-4 inline-block rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          {dict.myWait.browse}
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {entries.map((e) => {
        const r = restaurants.find((x) => x.id === e.restaurantId);
        if (!r) return null;
        return (
          <li
            key={e.restaurantId}
            className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
          >
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-4xl">
              {r.heroEmoji}
            </div>
            <div className="min-w-0 flex-1">
              <Link
                href={`/${locale}/restaurants/${r.id}`}
                className="font-semibold hover:underline"
              >
                {r.name[locale]}
              </Link>
              <p className="mt-0.5 text-sm text-[var(--muted)]">
                {r.area[locale]}
              </p>
              <div className="mt-2 flex gap-4 text-sm">
                <span>
                  <span className="text-[var(--muted)]">
                    {dict.myWait.position}
                  </span>{" "}
                  <strong className="text-[var(--accent)]">#{e.position}</strong>
                </span>
                <span>
                  <span className="text-[var(--muted)]">
                    {dict.myWait.estimated}
                  </span>{" "}
                  <strong>~{e.estimatedMinutes} min</strong>
                </span>
              </div>
            </div>
            <button
              onClick={() => leave(e.restaurantId)}
              className="self-start rounded-full border border-[var(--border)] px-3 py-1 text-xs hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {dict.restaurants.detail.leave}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
