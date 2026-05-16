import { Analyzer } from "@/components/Analyzer";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <section className="mb-8 text-center">
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
          Korean finance apps,
          <br className="sm:hidden" />{" "}
          <span className="text-[var(--accent)]">explained in English.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[var(--muted)]">
          Upload a screenshot of any Korean banking or fintech screen. We&apos;ll
          number every button and tell you what each one does — so you never tap
          the wrong thing.
        </p>
      </section>
      <Analyzer />
    </div>
  );
}
