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
      const form = new FormData();
      form.append("image", file);
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
      const { width, height } = await readImageDimensions(url);
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
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[var(--muted)]">
            Saved to your device only.{" "}
            <Link
              href={`/history/${phase.entryId}`}
              className="text-[var(--accent)] hover:underline"
            >
              Open in history →
            </Link>
          </p>
          <button
            onClick={reset}
            className="rounded-full border border-[var(--border)] px-4 py-1.5 text-sm hover:border-[var(--accent)]"
          >
            New screenshot
          </button>
        </div>
        <ResultView imageUrl={phase.url} result={phase.result} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <label
        htmlFor="image-input"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="block cursor-pointer rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-10 text-center transition hover:border-[var(--accent)]"
      >
        {phase.name === "idle" && (
          <>
            <div className="text-5xl">📸</div>
            <p className="mt-3 font-medium">
              Tap to pick a screenshot
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              or drag &amp; drop · or paste from clipboard (⌘V / Ctrl+V)
            </p>
          </>
        )}
        {phase.name === "ready" && (
          <div className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={phase.url}
              alt="Selected screenshot"
              className="mx-auto max-h-80 rounded-xl shadow"
            />
            <p className="text-sm text-[var(--muted)]">
              {phase.file.name} · {(phase.file.size / 1024).toFixed(0)} KB
            </p>
          </div>
        )}
        {phase.name === "analyzing" && (
          <div className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={phase.url}
              alt="Analyzing"
              className="mx-auto max-h-80 rounded-xl opacity-60 shadow"
            />
            <p className="font-medium">Reading the screen…</p>
            <p className="text-xs text-[var(--muted)]">
              Usually 5–10 seconds.
            </p>
          </div>
        )}
        {phase.name === "error" && (
          <div className="space-y-3">
            {phase.url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={phase.url}
                alt="Errored"
                className="mx-auto max-h-60 rounded-xl shadow"
              />
            )}
            <p className="font-medium text-[var(--danger)]">{phase.message}</p>
          </div>
        )}
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

      <div className="flex flex-wrap items-center justify-center gap-3">
        {phase.name === "ready" && (
          <>
            <button
              onClick={analyze}
              className="rounded-full bg-[var(--accent)] px-6 py-3 font-semibold text-white shadow hover:opacity-90"
            >
              Translate this screen →
            </button>
            <button
              onClick={reset}
              className="rounded-full border border-[var(--border)] px-4 py-2 text-sm hover:border-[var(--accent)]"
            >
              Pick another
            </button>
          </>
        )}
        {phase.name === "error" && (
          <button
            onClick={reset}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm hover:border-[var(--accent)]"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
