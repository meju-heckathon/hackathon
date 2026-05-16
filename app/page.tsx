import { Analyzer } from "@/components/Analyzer";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 sm:pt-16">
      <section className="mb-10 sm:mb-12">
        <span className="font-display mb-5 inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-bold tracking-tight text-[var(--accent-deep)]">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
          />
          For foreigners using Korean banks
        </span>
        <h1 className="font-display text-[clamp(32px,5vw,56px)] font-bold leading-[1.06] tracking-[-0.04em]">
          Snap a Korean banking screen,
          <br className="hidden sm:block" />{" "}
          <span className="text-[var(--accent)]">
            get answers in English.
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--fg-sub)] sm:text-[17px]">
          No more guessing which button is which. Upload a screenshot from KB,
          신한, 하나, 우리, 카카오뱅크, or 토스 and Bankly walks you through —
          step by step, in ~6 seconds.
        </p>
      </section>
      <Analyzer />
    </div>
  );
}
