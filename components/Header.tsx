import Link from "next/link";
import type { Dictionary, Locale } from "@/app/[locale]/dictionaries";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const base = `/${locale}`;
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link
          href={base}
          className="flex items-center gap-2 text-lg font-bold tracking-tight"
        >
          <span className="text-2xl">🥢</span>
          <span>Korea Wait</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href={`${base}/restaurants`}
            className="rounded-full px-3 py-1.5 hover:bg-[var(--accent-soft)]"
          >
            {dict.nav.restaurants}
          </Link>
          <Link
            href={`${base}/my-wait`}
            className="rounded-full px-3 py-1.5 hover:bg-[var(--accent-soft)]"
          >
            {dict.nav.myWait}
          </Link>
          <LanguageSwitcher current={locale} />
        </nav>
      </div>
    </header>
  );
}
