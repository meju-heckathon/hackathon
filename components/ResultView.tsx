"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { AnalyzeResult } from "@/lib/analyze-schema";

const RISK_COLOR = {
  safe: "var(--safe)",
  caution: "var(--caution)",
  danger: "var(--danger)",
} as const;

const RISK_CHIP = {
  safe: { bg: "#DFF7EE", text: "#006B4D", label: "Safe" },
  caution: { bg: "#FFEEDC", text: "#B8540A", label: "Caution" },
  danger: { bg: "#FFE2E2", text: "#B91C1C", label: "Careful" },
} as const;

export function ResultView({
  imageUrl,
  result,
  onScanAnother,
}: {
  imageUrl: string;
  result: AnalyzeResult;
  onScanAnother?: () => void;
}) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const itemRefs = useRef<Record<number, HTMLLIElement | null>>({});
  const pinRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const select = useCallback((id: number) => {
    setActiveId((prev) => (prev === id ? null : id));
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setExpanded(false);
    }
  }, []);

  useEffect(() => {
    if (activeId === null) return;
    itemRefs.current[activeId]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
    pinRefs.current[activeId]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  }, [activeId]);

  // When a goal-target element is present, highlight it on mount.
  useEffect(() => {
    if (result.goalAnswer?.found && result.goalAnswer.elementId != null) {
      setActiveId(result.goalAnswer.elementId);
    }
  }, [result.goalAnswer]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const isMobile = window.innerWidth < 1024;
    if (expanded && isMobile) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [expanded]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="relative mx-auto w-full max-w-md lg:mx-0">
        <div className="relative overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--surface)] shadow-[0_14px_28px_-12px_rgba(15,30,60,0.18)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Uploaded screenshot"
            className="block w-full"
          />
          {result.elements.map((el) => {
            const isActive = activeId === el.id;
            return (
              <button
                key={el.id}
                ref={(node) => {
                  pinRefs.current[el.id] = node;
                }}
                onClick={() => select(el.id)}
                aria-label={el.label}
                style={{
                  left: `${el.bbox.x * 100}%`,
                  top: `${el.bbox.y * 100}%`,
                  width: `${el.bbox.width * 100}%`,
                  height: `${el.bbox.height * 100}%`,
                  borderColor: RISK_COLOR[el.risk],
                }}
                className={`absolute flex items-start justify-start rounded-lg border-2 transition-all duration-200 ${
                  isActive
                    ? "z-20 scale-[1.02] bg-white/25 ring-4 ring-[var(--accent)]/50"
                    : "z-10 bg-white/0 hover:bg-white/10"
                }`}
              >
                <span
                  style={{ backgroundColor: RISK_COLOR[el.risk] }}
                  className={`relative -ml-2.5 -mt-2.5 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-md transition-transform duration-200 ${
                    isActive ? "scale-125" : ""
                  }`}
                >
                  {isActive && (
                    <span
                      style={{ backgroundColor: RISK_COLOR[el.risk] }}
                      className="absolute inset-0 -z-10 animate-ping rounded-full opacity-75"
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative">{el.id}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Backdrop when expanded on mobile */}
      {expanded && (
        <button
          aria-label="Collapse"
          onClick={() => setExpanded(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      {/* Sheet: bottom sheet on mobile, sidebar on desktop */}
      <aside
        aria-modal={expanded || undefined}
        className={`fixed inset-x-0 bottom-0 z-40 flex flex-col rounded-t-[28px] border-t border-[var(--line)] bg-[var(--surface)] shadow-[0_-20px_50px_-12px_rgba(15,30,60,0.25)] transition-[height] duration-300 ease-out lg:static lg:rounded-2xl lg:border lg:!shadow-none lg:!transition-none ${
          expanded ? "h-[88vh]" : "h-[30vh]"
        } lg:!h-auto`}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Collapse" : "Expand"}
          className="flex shrink-0 cursor-pointer items-center justify-center py-3 lg:hidden"
        >
          <span className="h-1 w-12 rounded-full bg-[var(--line)]" />
        </button>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-6 lg:px-0 lg:pb-0">
          {result.goalAnswer && (
            <div
              className={`rounded-[18px] border p-5 ${
                result.goalAnswer.found
                  ? "border-[var(--accent)]/40 bg-[var(--accent-soft)]"
                  : "border-[var(--caution)]/40 bg-[#FFF6EC] dark:bg-[#2a2014]"
              }`}
            >
              <p
                className={`font-display text-[11px] font-bold uppercase tracking-[0.08em] ${
                  result.goalAnswer.found
                    ? "text-[var(--accent-deep)]"
                    : "text-[var(--caution)]"
                }`}
              >
                Your goal · {result.goalAnswer.goal}
              </p>
              {result.goalAnswer.found && result.goalAnswer.elementId != null ? (
                <>
                  <h2 className="font-display mt-2 flex items-center gap-2 text-[17px] font-bold leading-snug tracking-[-0.02em]">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[12px] font-bold text-white"
                      aria-hidden="true"
                    >
                      {result.goalAnswer.elementId}
                    </span>
                    Tap button #{result.goalAnswer.elementId}
                  </h2>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--fg-sub)]">
                    {result.goalAnswer.rationale}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      result.goalAnswer?.elementId != null &&
                      select(result.goalAnswer.elementId)
                    }
                    className="font-display mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-3.5 py-1.5 text-[12px] font-bold text-white hover:bg-[var(--accent-deep)]"
                  >
                    Highlight on screen →
                  </button>
                </>
              ) : (
                <>
                  <h2 className="font-display mt-2 text-[16px] font-bold leading-snug tracking-[-0.02em]">
                    Not on this screen
                  </h2>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-[var(--fg-sub)]">
                    {result.goalAnswer.rationale}
                  </p>
                </>
              )}
            </div>
          )}
          <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-5 lg:bg-[var(--surface)]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--accent-deep)]">
                  Screen · Korean → English
                </p>
                <h2 className="font-display mt-2 text-[17px] font-bold leading-snug tracking-[-0.02em] text-[var(--foreground)]">
                  {result.screen}
                </h2>
                {result.appGuess && (
                  <p className="mt-1.5 text-[12.5px] text-[var(--muted)]">
                    Probably{" "}
                    <span className="font-semibold text-[var(--fg-sub)]">
                      {result.appGuess}
                    </span>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="font-display shrink-0 rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-[11.5px] font-bold tracking-tight text-[var(--accent-deep)] lg:hidden"
              >
                {expanded ? "Collapse ↓" : "Expand ↑"}
              </button>
            </div>
            <div className="mt-3 flex gap-2 text-[11.5px] text-[var(--muted)]">
              <span className="rounded-full bg-[var(--background)] px-2.5 py-1">
                {result.elements.length} buttons
              </span>
              {result.warnings.length > 0 && (
                <span className="rounded-full bg-[var(--background)] px-2.5 py-1">
                  {result.warnings.length} warning
                  {result.warnings.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {result.warnings.length > 0 && (
            <div className="rounded-[18px] border border-[var(--danger)]/35 bg-[#FFF5F5] p-5 dark:bg-[#2a1414]">
              <p className="font-display text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--danger)]">
                ⚠ Watch out
              </p>
              <ul className="mt-2 space-y-1.5 text-[13.5px] leading-relaxed text-[var(--fg-sub)]">
                {result.warnings.map((w, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-[var(--danger)]" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ol className="space-y-2">
            {result.elements.map((el) => {
              const isActive = activeId === el.id;
              const chip = RISK_CHIP[el.risk];
              return (
                <li
                  key={el.id}
                  ref={(node) => {
                    itemRefs.current[el.id] = node;
                  }}
                >
                  <button
                    onClick={() => select(el.id)}
                    className={`flex w-full gap-3 rounded-[14px] border bg-[var(--surface)] p-3.5 text-left transition-all duration-200 ${
                      isActive
                        ? "scale-[1.01] border-[var(--accent)] shadow-[0_10px_24px_-12px_rgba(49,130,246,0.4)]"
                        : "border-[var(--line)] hover:border-[var(--accent)]"
                    }`}
                  >
                    <span
                      style={{ backgroundColor: RISK_COLOR[el.risk] }}
                      className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white transition-transform duration-200 ${
                        isActive ? "scale-110" : ""
                      }`}
                    >
                      {isActive && (
                        <span
                          style={{ backgroundColor: RISK_COLOR[el.risk] }}
                          className="absolute inset-0 -z-10 animate-ping rounded-full opacity-75"
                          aria-hidden="true"
                        />
                      )}
                      <span className="relative">{el.id}</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-display text-[14.5px] font-bold leading-tight tracking-[-0.02em]">
                          {el.label}
                        </h3>
                        <span
                          style={{
                            backgroundColor: chip.bg,
                            color: chip.text,
                          }}
                          className="font-display shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em]"
                        >
                          {chip.label}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[11.5px] text-[var(--muted)]">
                        {el.koreanText}
                      </p>
                      {el.termGloss && (
                        <div className="mt-2 rounded-[10px] bg-[var(--accent-soft)] p-2.5">
                          <p className="font-display text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--accent-deep)]">
                            What is this?
                          </p>
                          <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--fg-sub)]">
                            {el.termGloss}
                          </p>
                        </div>
                      )}
                      <p className="mt-2 text-[13px] leading-relaxed text-[var(--fg-sub)]">
                        {el.explanation}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>

          {onScanAnother && (
            <button
              type="button"
              onClick={onScanAnother}
              className="group relative w-full overflow-hidden rounded-[18px] bg-[var(--foreground)] p-5 text-left text-white transition hover:scale-[1.01]"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-24 h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(49,130,246,0.4),transparent_60%)]"
              />
              <span className="relative z-10 block">
                <span className="font-display text-[11px] font-bold uppercase tracking-[0.08em] text-white/55">
                  Next step
                </span>
                <span className="font-display mt-1.5 block text-[16px] font-bold leading-tight tracking-[-0.02em]">
                  Got a new screen to translate?
                </span>
                <span className="mt-1 block text-[12.5px] text-white/65">
                  Snap another screenshot — same fast pipeline, no setup.
                </span>
                <span className="font-display mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-3.5 py-2 text-[12.5px] font-bold">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M12 8V16M8 12H16"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                  </svg>
                  Scan another screen
                </span>
              </span>
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
