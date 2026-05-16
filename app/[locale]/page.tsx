import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, type Locale } from "./dictionaries";
import { restaurants } from "@/lib/restaurants";
import { interpolate } from "@/lib/format";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const top = [...restaurants]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="py-12 sm:py-20">
        <div className="grid gap-8 sm:grid-cols-2 sm:items-center">
          <div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {dict.home.hero.title}
            </h1>
            <p className="mt-4 text-lg text-[var(--muted)]">
              {dict.home.hero.subtitle}
            </p>
            <Link
              href={`/${locale}/restaurants`}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 font-semibold text-white shadow hover:opacity-90"
            >
              {dict.home.hero.cta} →
            </Link>
          </div>
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--accent-soft)] to-amber-100 dark:to-amber-900/30">
            <div className="absolute inset-0 grid grid-cols-2 gap-2 p-6">
              <div className="flex items-center justify-center rounded-2xl bg-white/70 text-6xl shadow-sm backdrop-blur dark:bg-black/30">
                🍜
              </div>
              <div className="flex items-center justify-center rounded-2xl bg-white/70 text-6xl shadow-sm backdrop-blur dark:bg-black/30">
                🥩
              </div>
              <div className="flex items-center justify-center rounded-2xl bg-white/70 text-6xl shadow-sm backdrop-blur dark:bg-black/30">
                🥞
              </div>
              <div className="flex items-center justify-center rounded-2xl bg-white/70 text-6xl shadow-sm backdrop-blur dark:bg-black/30">
                ☕
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <h2 className="mb-6 text-2xl font-bold">{dict.home.features.title}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {dict.home.features.items.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"
            >
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-2xl font-bold">{dict.home.popular}</h2>
          <Link
            href={`/${locale}/restaurants`}
            className="text-sm font-medium text-[var(--accent)] hover:underline"
          >
            {dict.nav.restaurants} →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {top.map((r) => (
            <Link
              key={r.id}
              href={`/${locale}/restaurants/${r.id}`}
              className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition hover:border-[var(--accent)] hover:shadow-md"
            >
              <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-[var(--accent-soft)] to-amber-50 text-7xl dark:to-amber-950/30">
                {r.heroEmoji}
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold leading-tight">
                    {r.name[locale as Locale]}
                  </h3>
                  <span className="shrink-0 text-sm text-[var(--muted)]">
                    ★ {r.rating}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {r.area[locale as Locale]}
                </p>
                <p className="mt-3 text-xs font-medium text-[var(--accent)]">
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
          ))}
        </div>
      </section>
    </div>
  );
}
