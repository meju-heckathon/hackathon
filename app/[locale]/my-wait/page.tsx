import { notFound } from "next/navigation";
import { getDictionary, hasLocale, type Locale } from "../dictionaries";
import { MyWaitList } from "@/components/MyWaitList";

export default async function MyWaitPage({
  params,
}: PageProps<"/[locale]/my-wait">) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">{dict.myWait.title}</h1>
      <MyWaitList locale={locale as Locale} dict={dict} />
    </div>
  );
}
