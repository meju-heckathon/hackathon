import { notFound } from "next/navigation";
import { getDictionary, hasLocale, type Locale } from "../dictionaries";
import { restaurants } from "@/lib/restaurants";
import { CategoryFilter } from "@/components/CategoryFilter";

export default async function RestaurantsPage({
  params,
}: PageProps<"/[locale]/restaurants">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">{dict.restaurants.title}</h1>
      <CategoryFilter
        restaurants={restaurants}
        locale={locale as Locale}
        dict={dict}
      />
    </div>
  );
}
