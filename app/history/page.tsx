import { HistoryList } from "@/components/HistoryList";

export const dynamic = "force-static";

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <span className="font-display mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-bold tracking-tight text-[var(--accent-deep)]">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
          />
          Saved
        </span>
        <h1 className="font-display text-[clamp(28px,4vw,40px)] font-bold leading-[1.1] tracking-[-0.035em]">
          Your translated screens
        </h1>
        <p className="mt-2 text-[14.5px] text-[var(--fg-sub)]">
          Stored only on this device. Clearing your browser data removes them.
        </p>
      </header>
      <HistoryList />
    </div>
  );
}
