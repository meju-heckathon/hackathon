import { HistoryList } from "@/components/HistoryList";

export const dynamic = "force-static";

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Your screenshots</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Stored only in this browser. Clearing your browser data removes them.
        </p>
      </header>
      <HistoryList />
    </div>
  );
}
