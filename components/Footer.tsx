import type { Dictionary } from "@/app/[locale]/dictionaries";

export function Footer({ dict }: { dict: Dictionary }) {
  return (
    <footer className="mt-16 border-t border-[var(--border)] py-8 text-center text-sm text-[var(--muted)]">
      <p>{dict.footer.tagline}</p>
      <p className="mt-1">© {new Date().getFullYear()} Korea Wait</p>
    </footer>
  );
}
