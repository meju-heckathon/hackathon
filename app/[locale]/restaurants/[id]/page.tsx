import { notFound } from "next/navigation";
import { getDictionary, hasLocale, type Locale } from "../../dictionaries";
import { getRestaurant, restaurants } from "@/lib/restaurants";
import { formatKRW, interpolate } from "@/lib/format";
import { WaitForm } from "@/components/WaitForm";

export async function generateStaticParams() {
  return restaurants.map((r) => ({ id: r.id }));
}

export default async function RestaurantDetail({
  params,
}: PageProps<"/[locale]/restaurants/[id]">) {
  const { locale, id } = await params;
  if (!hasLocale(locale)) notFound();
  const r = getRestaurant(id);
  if (!r) notFound();
  const dict = await getDictionary(locale as Locale);

  return (
    <article className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <div className="mb-6 flex aspect-[16/7] items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--accent-soft)] to-amber-50 text-[8rem] dark:to-amber-950/30">
        {r.heroEmoji}
      </div>

      <div className="grid gap-8 sm:grid-cols-[1fr_320px]">
        <div>
          <header>
            <p className="text-sm font-medium text-[var(--accent)]">
              {dict.restaurants.filters[r.category]}
            </p>
            <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
              {r.name[locale as Locale]}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              ★ {r.rating} · {r.area[locale as Locale]}
            </p>
            <p className="mt-4 text-base">{r.blurb[locale as Locale]}</p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-sm font-medium text-[var(--accent)]">
              {interpolate(dict.restaurants.card.waiting, {
                count: r.waitingParties,
              })}
              {" · "}
              {interpolate(dict.restaurants.card.avgWait, {
                minutes: r.avgWaitMinutes,
              })}
            </p>
          </header>

          <section className="mt-8 grid gap-4 sm:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                {dict.restaurants.detail.address}
              </h2>
              <p className="mt-1">{r.address[locale as Locale]}</p>
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
                {dict.restaurants.detail.hours}
              </h2>
              <p className="mt-1">{r.hours}</p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-3 text-xl font-bold">
              {dict.restaurants.detail.menu}
            </h2>
            <ul className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              {r.menu.map((m) => (
                <li
                  key={m.id}
                  className="flex items-start justify-between gap-4 p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{m.name[locale as Locale]}</h3>
                      {m.spicy && <span title="spicy">🌶️</span>}
                      {m.vegetarian && <span title="vegetarian">🌱</span>}
                    </div>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {m.description[locale as Locale]}
                    </p>
                  </div>
                  <span className="shrink-0 font-medium">
                    {formatKRW(m.priceKRW, locale as Locale)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="sm:sticky sm:top-20 sm:self-start">
          <WaitForm restaurant={r} locale={locale as Locale} dict={dict} />
        </aside>
      </div>
    </article>
  );
}
