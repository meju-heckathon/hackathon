"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AnalyzeResult } from "@/lib/analyze-schema";
import {
  saveEntry,
  makeId,
  type HistoryEntry,
} from "@/lib/local-history";
import { ResultView } from "./ResultView";
import { GoalSelector } from "./GoalSelector";

type Phase =
  | { name: "idle" }
  | { name: "ready"; file: File; url: string }
  | { name: "analyzing"; url: string }
  | { name: "done"; url: string; result: AnalyzeResult; entryId: string }
  | { name: "error"; url: string | null; message: string };

async function readImageDimensions(
  url: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = url;
  });
}

export function Analyzer({ initialFile }: { initialFile?: File }) {
  const [phase, setPhase] = useState<Phase>({ name: "idle" });
  const [goal, setGoal] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const setFile = useCallback((file: File) => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setPhase({ name: "ready", file, url });
  }, []);

  useEffect(() => {
    if (initialFile) {
      setFile(initialFile);
      return;
    }
    const dataUrl = sessionStorage.getItem("shared-image");
    const type = sessionStorage.getItem("shared-image-type");
    if (dataUrl && type) {
      sessionStorage.removeItem("shared-image");
      sessionStorage.removeItem("shared-image-type");
      fetch(dataUrl)
        .then((r) => r.blob())
        .then((blob) => {
          const file = new File([blob], `shared.${type.split("/")[1] ?? "png"}`, {
            type,
          });
          setFile(file);
        })
        .catch(() => {});
    }
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, [initialFile, setFile]);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const f = item.getAsFile();
          if (f) {
            setFile(f);
            break;
          }
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [setFile]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) setFile(f);
  };

  const analyze = async () => {
    if (phase.name !== "ready") return;
    const { file, url } = phase;
    setPhase({ name: "analyzing", url });

    try {
      const { width, height } = await readImageDimensions(url);
      const form = new FormData();
      form.append("image", file);
      form.append("width", String(width));
      form.append("height", String(height));
      if (goal) form.append("goal", goal);
      const res = await fetch("/api/analyze", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) {
        setPhase({
          name: "error",
          url,
          message: json.error ?? "Something went wrong.",
        });
        return;
      }
      const result = json as AnalyzeResult;
      const entry: HistoryEntry = {
        id: makeId(),
        createdAt: Date.now(),
        imageBlob: file,
        imageType: file.type,
        imageWidth: width,
        imageHeight: height,
        result,
      };
      try {
        await saveEntry(entry);
      } catch {
        // history is best-effort; ignore quota errors
      }
      setPhase({ name: "done", url, result, entryId: entry.id });
    } catch (err) {
      setPhase({
        name: "error",
        url,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const reset = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPhase({ name: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  };

  if (phase.name === "done") {
    return (
      <div className="space-y-4">
        <div className="sticky top-[57px] z-30 -mx-4 flex items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--background)]/85 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6">
          <button
            onClick={reset}
            className="font-display inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2 text-[13px] font-bold text-white hover:bg-[var(--accent-deep)]"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 8V16M8 12H16"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            </svg>
            Scan another
          </button>
          <Link
            href={`/history/${phase.entryId}`}
            className="font-display text-[13px] font-semibold text-[var(--accent)] hover:underline"
          >
            Open in Saved →
          </Link>
        </div>
        <ResultView imageUrl={phase.url} result={phase.result} onScanAnother={reset} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <GoalSelector value={goal} onChange={setGoal} />
      <label
        htmlFor="image-input"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="relative block cursor-pointer overflow-hidden rounded-[22px] bg-[var(--foreground)] p-6 text-white shadow-[0_24px_48px_-20px_rgba(15,30,60,0.35)] transition hover:scale-[1.005] sm:p-8"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-40 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(49,130,246,0.45),transparent_60%)]"
        />
        <div className="relative z-10">
          {phase.name === "idle" && (
            <div className="grid items-center gap-6 sm:grid-cols-[1fr_140px]">
              <div>
                <p className="font-display mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-white/55">
                  Add a screen
                </p>
                <h2 className="font-display text-[22px] font-bold leading-[1.25] tracking-[-0.025em] sm:text-2xl">
                  Snap or upload a bank screenshot
                </h2>
                <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-white/70">
                  English guidance in ~6 seconds. Drag &amp; drop, paste (⌘V),
                  or pick from your photos.
                </p>
                <span className="font-display mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-2.5 text-[13px] font-bold text-white">
                  <svg
                    width="16"
                    height="16"
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
                  Camera or Photos
                </span>
              </div>
              <div
                aria-hidden="true"
                className="relative mx-auto hidden h-[160px] w-[120px] rotate-6 rounded-2xl bg-white shadow-2xl sm:block"
              >
                <span className="absolute left-3 right-3 top-3 h-1 rounded bg-[var(--line)]" />
                <span className="absolute left-3 right-3 top-7 h-1.5 rounded bg-[var(--line-soft)]" />
                <span className="absolute left-3 right-3 top-11 h-1.5 rounded bg-[var(--line-soft)]" />
                <span className="absolute left-3 right-3 top-16 h-1.5 rounded bg-[var(--line-soft)]" />
                <span className="absolute bottom-3 left-3 right-3 h-5 rounded-md bg-[var(--accent)]" />
              </div>
            </div>
          )}
          {phase.name === "ready" && (
            <div className="grid items-center gap-5 sm:grid-cols-[1fr_180px]">
              <div>
                <p className="font-display mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-white/55">
                  Ready to translate
                </p>
                <h2 className="font-display text-xl font-bold leading-tight tracking-[-0.02em]">
                  {phase.file.name}
                </h2>
                <p className="mt-1 text-[12.5px] text-white/60">
                  {(phase.file.size / 1024).toFixed(0)} KB
                </p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={phase.url}
                alt="Selected screenshot"
                className="mx-auto max-h-44 rounded-xl shadow-2xl"
              />
            </div>
          )}
          {phase.name === "analyzing" && (
            <div className="grid items-center gap-5 sm:grid-cols-[1fr_180px]">
              <div>
                <p className="font-display mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--accent)]">
                  Working on it
                </p>
                <h2 className="font-display text-xl font-bold leading-tight tracking-[-0.02em]">
                  Reading the screen…
                </h2>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)] [animation-delay:0.15s]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)] [animation-delay:0.3s]" />
                </div>
                <p className="mt-3 text-[12.5px] text-white/60">
                  First run takes ~30s while Korean OCR loads. After that, ~6s.
                </p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={phase.url}
                alt="Analyzing"
                className="mx-auto max-h-44 rounded-xl opacity-70 shadow-2xl"
              />
            </div>
          )}
          {phase.name === "error" && (
            <div className="space-y-3">
              <p className="font-display text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--danger)]">
                Something went wrong
              </p>
              <h2 className="font-display text-lg font-bold leading-tight tracking-[-0.02em]">
                {phase.message}
              </h2>
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          id="image-input"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setFile(f);
          }}
        />
      </label>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {phase.name === "ready" && (
          <>
            <button
              onClick={reset}
              className="font-display rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold hover:border-[var(--accent)] hover:text-[var(--accent-deep)]"
            >
              Pick another
            </button>
            <button
              onClick={analyze}
              className="font-display inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-[var(--accent-deep)]"
            >
              Translate this screen
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5 12H19M12 5L19 12L12 19"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}
        {phase.name === "error" && (
          <button
            onClick={reset}
            className="font-display rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--accent-deep)]"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
