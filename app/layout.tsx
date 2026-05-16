import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { ChatWidget } from "@/components/ChatWidget";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MEJU — Korean banking, in your language",
  description:
    "Snap a Korean banking screenshot and MEJU walks you to the next tap. English guidance in ~6 seconds.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#f2f4f6",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
        <header className="bg-[var(--background)]">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <a href="/" className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="font-display inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-deep)] to-[var(--accent)] text-[13px] font-extrabold tracking-tighter text-white"
              >
                M
              </span>
              <span className="font-display text-[17px] font-bold tracking-tight">
                MEJU
              </span>
            </a>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/history"
                className="font-display rounded-full px-3.5 py-1.5 font-semibold text-[var(--fg-sub)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-deep)]"
              >
                Saved
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <ChatWidget />
        <footer className="mt-16 border-t border-[var(--line)] py-8 text-center text-xs text-[var(--muted)]">
          <p className="mx-auto max-w-md px-4">
            Screenshots only pass through our server to be analyzed, then
            immediately discarded. Your history is stored only on this device.
          </p>
          <p className="mt-2">© MEJU · Not affiliated with any Korean bank.</p>
        </footer>
      </body>
    </html>
  );
}
