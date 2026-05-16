import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hangul Finance Lens — Read Korean banking apps in English",
  description:
    "Upload a screenshot of any Korean finance app and instantly see what every button does, in English.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <span className="text-2xl">🔍</span>
              <span>Hangul Finance Lens</span>
            </Link>
            <Link
              href="/history"
              className="rounded-full px-3 py-1.5 text-sm hover:bg-[var(--accent-soft)]"
            >
              History
            </Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="mt-12 border-t border-[var(--border)] py-6 text-center text-xs text-[var(--muted)]">
          <p>
            Your screenshots never leave your device&apos;s storage — they pass
            through our server only to be analyzed, then immediately discarded.
          </p>
          <p className="mt-1">
            Not affiliated with any Korean bank or fintech.
          </p>
        </footer>
      </body>
    </html>
  );
}
