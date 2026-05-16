"use client";

import { useState, useRef, useEffect } from "react";
import type { AnalyzeResult } from "@/lib/analyze-schema";

const RISK_COLOR = {
  safe: "var(--safe)",
  caution: "var(--caution)",
  danger: "var(--danger)",
} as const;

const RISK_LABEL = {
  safe: "Safe",
  caution: "Caution",
  danger: "Be careful",
} as const;

export function ResultView({
  imageUrl,
  result,
}: {
  imageUrl: string;
  result: AnalyzeResult;
}) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<number, HTMLLIElement | null>>({});

  useEffect(() => {
    if (activeId !== null && itemRefs.current[activeId]) {
      itemRefs.current[activeId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeId]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="relative mx-auto w-full max-w-lg">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
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
                onClick={() =>
                  setActiveId((prev) => (prev === el.id ? null : el.id))
                }
                aria-label={el.label}
                style={{
                  left: `${el.bbox.x * 100}%`,
                  top: `${el.bbox.y * 100}%`,
                  width: `${el.bbox.width * 100}%`,
                  height: `${el.bbox.height * 100}%`,
                  borderColor: RISK_COLOR[el.risk],
                }}
                className={`absolute flex items-start justify-start border-2 transition ${
                  isActive
                    ? "z-20 bg-white/20 ring-4 ring-[var(--accent)]/40"
                    : "z-10 bg-white/0 hover:bg-white/10"
                }`}
              >
                <span
                  style={{ backgroundColor: RISK_COLOR[el.risk] }}
                  className="-ml-2 -mt-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow"
                >
                  {el.id}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div ref={sidebarRef} className="space-y-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
            Screen
          </h2>
          <p className="mt-1 font-medium">{result.screen}</p>
          {result.appGuess && (
            <p className="mt-1 text-xs text-[var(--muted)]">
              Probably: {result.appGuess}
            </p>
          )}
        </div>

        {result.warnings.length > 0 && (
          <div className="rounded-2xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-4">
            <h2 className="text-sm font-semibold text-[var(--danger)]">
              ⚠ Watch out
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {result.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        <ol className="space-y-2">
          {result.elements.map((el) => {
            const isActive = activeId === el.id;
            return (
              <li
                key={el.id}
                ref={(node) => {
                  itemRefs.current[el.id] = node;
                }}
              >
                <button
                  onClick={() =>
                    setActiveId((prev) => (prev === el.id ? null : el.id))
                  }
                  className={`flex w-full gap-3 rounded-xl border bg-[var(--card)] p-3 text-left transition ${
                    isActive
                      ? "border-[var(--accent)] shadow"
                      : "border-[var(--border)] hover:border-[var(--accent)]"
                  }`}
                >
                  <span
                    style={{ backgroundColor: RISK_COLOR[el.risk] }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  >
                    {el.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-semibold leading-tight">{el.label}</h3>
                      <span
                        style={{ color: RISK_COLOR[el.risk] }}
                        className="shrink-0 text-[10px] font-semibold uppercase tracking-wider"
                      >
                        {RISK_LABEL[el.risk]}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                      {el.koreanText}
                    </p>
                    <p className="mt-1 text-sm">{el.explanation}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
