"use client";

import { useState } from "react";
import type { Category, Restaurant } from "@/lib/restaurants";
import type { Dictionary, Locale } from "@/app/[locale]/dictionaries";
import { RestaurantCard } from "./RestaurantCard";

const CATEGORIES: (Category | "all")[] = [
  "all",
  "korean",
  "noodle",
  "street",
  "cafe",
];

export function CategoryFilter({
  restaurants,
  locale,
  dict,
}: {
  restaurants: Restaurant[];
  locale: Locale;
  dict: Dictionary;
}) {
  const [active, setActive] = useState<Category | "all">("all");
  const list =
    active === "all"
      ? restaurants
      : restaurants.filter((r) => r.category === active);

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              active === c
                ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                : "border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)]"
            }`}
          >
            {dict.restaurants.filters[c]}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((r) => (
          <RestaurantCard
            key={r.id}
            restaurant={r}
            locale={locale}
            dict={dict}
          />
        ))}
      </div>
    </div>
  );
}
