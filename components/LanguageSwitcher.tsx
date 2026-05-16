"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { locales, type Locale } from "@/app/[locale]/dictionaries";

const LABELS: Record<Locale, string> = {
  en: "English",
  ko: "한국어",
  ja: "日本語",
  zh: "中文",
};

const FLAGS: Record<Locale, string> = {
  en: "🇺🇸",
  ko: "🇰🇷",
  ja: "🇯🇵",
  zh: "🇨🇳",
};

export function LanguageSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const swap = (l: Locale) => {
    const segments = pathname.split("/");
    segments[1] = l;
    return segments.join("/") || `/${l}`;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm hover:border-[var(--accent)]"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{FLAGS[current]}</span>
        <span className="hidden sm:inline">{LABELS[current]}</span>
        <span className="text-xs text-[var(--muted)]">▾</span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-lg"
        >
          {locales.map((l) => (
            <li key={l}>
              <Link
                href={swap(l)}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--accent-soft)] ${
                  l === current ? "font-semibold" : ""
                }`}
              >
                <span>{FLAGS[l]}</span>
                <span>{LABELS[l]}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
