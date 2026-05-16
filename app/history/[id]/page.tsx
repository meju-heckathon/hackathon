import { HistoryDetail } from "@/components/HistoryDetail";

export default async function HistoryEntryPage({
  params,
}: PageProps<"/history/[id]">) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <HistoryDetail id={id} />
    </div>
  );
}
