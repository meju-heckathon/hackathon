"use client";

import { useState, useRef, useEffect } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What is 신탁?",
  "How do I open a KakaoBank account as a foreigner?",
  "What's the difference between 적금 and 예금?",
  "Is 자동이체 safe to set up?",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, messages, pending]);

  // Lock the page underneath while the chat is open so it doesn't
  // shift when the keyboard appears or when scrolling inside the panel.
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const { position, top, width, overflow } = document.body.style;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.position = position;
      document.body.style.top = top;
      document.body.style.width = width;
      document.body.style.overflow = overflow;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setPending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Chat failed.");
      setMessages([
        ...next,
        { role: "assistant", content: json.message as string },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setMessages([
        ...next,
        { role: "assistant", content: `⚠ ${msg}` },
      ]);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Ask MEJU"}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-deep)] to-[var(--accent)] text-white shadow-[0_18px_36px_-12px_rgba(49,130,246,0.55)] transition hover:scale-110 hover:shadow-[0_22px_44px_-12px_rgba(49,130,246,0.7)]"
      >
        {open ? (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 6L18 18M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M21 12c0 4.4-4 8-9 8-1.1 0-2.2-.2-3.2-.5L4 21l1.4-4C4.5 15.6 4 13.9 4 12c0-4.4 4-8 9-8s8 3.6 8 8z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="MEJU chat"
          className="fixed bottom-24 right-3 z-50 flex h-[min(560px,calc(100dvh-120px))] w-[calc(100vw-24px)] flex-col overflow-hidden rounded-[20px] border border-[var(--line)] bg-[var(--surface)] shadow-[0_24px_60px_-12px_rgba(15,30,60,0.4)] sm:right-5 sm:w-[380px]"
        >
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--background)] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="font-display flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent-deep)] to-[var(--accent)] text-[12px] font-extrabold tracking-tighter text-white"
              >
                M
              </span>
              <div>
                <p className="font-display text-[13.5px] font-bold leading-tight tracking-[-0.02em]">
                  Ask MEJU
                </p>
                <p className="text-[10.5px] text-[var(--muted)]">
                  Korean finance assistant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMessages([])}
                  className="font-display rounded-full px-2.5 py-1 text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--danger)]"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 6L18 18M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </header>

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {messages.length === 0 && (
              <div>
                <p className="text-[13px] leading-relaxed text-[var(--fg-sub)]">
                  Hi 👋 Ask me anything about Korean banking apps, financial
                  terms, or how to do things as a foreigner in Korea.
                </p>
                <p className="font-display mt-4 text-[10.5px] font-bold uppercase tracking-[0.06em] text-[var(--muted)]">
                  Try
                </p>
                <div className="mt-2 space-y-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => send(s)}
                      className="block w-full rounded-[10px] border border-[var(--line)] bg-[var(--background)] px-3 py-2 text-left text-[12.5px] text-[var(--fg-sub)] transition hover:border-[var(--accent)] hover:text-[var(--accent-deep)]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-[14px] px-3.5 py-2 text-[13px] leading-relaxed ${
                    m.role === "user"
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--background)] text-[var(--fg-sub)]"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {pending && (
              <div className="flex justify-start">
                <div className="rounded-[14px] bg-[var(--background)] px-4 py-2.5">
                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--muted)]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--muted)] [animation-delay:0.15s]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--muted)] [animation-delay:0.3s]" />
                  </span>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex shrink-0 gap-2 border-t border-[var(--line)] bg-[var(--surface)] p-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything…"
              disabled={pending}
              maxLength={MAX_INPUT}
              className="flex-1 rounded-full border border-[var(--line)] bg-[var(--background)] px-3.5 py-2 text-[16px] outline-none focus:border-[var(--accent)] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              aria-label="Send"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white transition hover:bg-[var(--accent-deep)] disabled:opacity-40"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 12L20 4L15 20L11 13L4 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}

const MAX_INPUT = 1000;
