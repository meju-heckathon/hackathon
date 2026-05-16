"use client";

import { useEffect, useState } from "react";
import type { Restaurant } from "@/lib/restaurants";
import type { Dictionary, Locale } from "@/app/[locale]/dictionaries";
import { interpolate } from "@/lib/format";
import {
  readEntries,
  removeEntry,
  upsertEntry,
  type WaitEntry,
} from "@/lib/wait-store";

export function WaitForm({
  restaurant,
  dict,
}: {
  restaurant: Restaurant;
  locale: Locale;
  dict: Dictionary;
}) {
  const [existing, setExisting] = useState<WaitEntry | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState(2);

  useEffect(() => {
    const entry = readEntries().find((e) => e.restaurantId === restaurant.id);
    setExisting(entry ?? null);
  }, [restaurant.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const position = restaurant.waitingParties + 1;
    const estimatedMinutes = Math.round(
      restaurant.avgWaitMinutes *
        (position / Math.max(restaurant.waitingParties, 1)),
    );
    const entry: WaitEntry = {
      restaurantId: restaurant.id,
      name: name.trim() || "Guest",
      phone: phone.trim(),
      partySize,
      position,
      estimatedMinutes,
      createdAt: Date.now(),
    };
    upsertEntry(entry);
    setExisting(entry);
  };

  const handleLeave = () => {
    removeEntry(restaurant.id);
    setExisting(null);
  };

  if (existing) {
    return (
      <div className="rounded-2xl border border-[var(--accent)] bg-[var(--accent-soft)] p-5">
        <p className="font-medium">
          {interpolate(dict.restaurants.detail.submitted, {
            position: existing.position,
            phone: existing.phone || "—",
          })}
        </p>
        <button
          onClick={handleLeave}
          className="mt-3 rounded-full border border-[var(--accent)] px-4 py-1.5 text-sm font-medium text-[var(--accent)] hover:bg-white/50"
        >
          {dict.restaurants.detail.leave}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
    >
      <h3 className="text-lg font-semibold">
        {dict.restaurants.detail.joinTitle}
      </h3>
      <div>
        <label className="mb-1 block text-sm font-medium">
          {dict.restaurants.detail.name}
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--accent)]"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">
          {dict.restaurants.detail.partySize}
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPartySize((n) => Math.max(1, n - 1))}
            className="h-9 w-9 rounded-full border border-[var(--border)] hover:border-[var(--accent)]"
          >
            −
          </button>
          <span className="w-8 text-center font-medium">{partySize}</span>
          <button
            type="button"
            onClick={() => setPartySize((n) => Math.min(12, n + 1))}
            className="h-9 w-9 rounded-full border border-[var(--border)] hover:border-[var(--accent)]"
          >
            +
          </button>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">
          {dict.restaurants.detail.phone}
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          placeholder="+82 10 1234 5678"
          className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 outline-none focus:border-[var(--accent)]"
        />
        <p className="mt-1 text-xs text-[var(--muted)]">
          {dict.restaurants.detail.phoneHint}
        </p>
      </div>
      <button
        type="submit"
        className="w-full rounded-full bg-[var(--accent)] py-3 font-semibold text-white shadow hover:opacity-90"
      >
        {interpolate(dict.restaurants.detail.submit, {
          count: restaurant.waitingParties,
        })}
      </button>
    </form>
  );
}
