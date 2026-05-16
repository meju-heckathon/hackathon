import Link from "next/link";
import type { Restaurant } from "@/lib/restaurants";
import type { Dictionary, Locale } from "@/app/[locale]/dictionaries";
import { interpolate } from "@/lib/format";

export function RestaurantCard({
  restaurant: r,
  locale,
  dict,
}: {
  restaurant: Restaurant;
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <Link
      href={`/${locale}/restaurants/${r.id}`}
      className="group flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-[var(--accent)] hover:shadow-md"
    >
      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-soft)] to-amber-50 text-5xl dark:to-amber-950/30">
        {r.heroEmoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-semibold">{r.name[locale]}</h3>
          <span className="shrink-0 text-sm text-[var(--muted)]">
            ★ {r.rating}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-[var(--muted)]">{r.area[locale]}</p>
        <p className="mt-2 line-clamp-2 text-sm">{r.blurb[locale]}</p>
        <p className="mt-2 text-xs font-medium text-[var(--accent)]">
          {interpolate(dict.restaurants.card.waiting, {
            count: r.waitingParties,
          })}
          {" · "}
          {interpolate(dict.restaurants.card.avgWait, {
            minutes: r.avgWaitMinutes,
          })}
        </p>
      </div>
    </Link>
  );
}
