"use client";

import { useState } from "react";

export type GoalPreset = {
  id: string;
  label: string;
  korean: string;
  emoji: string;
  goalText: string;
};

export const GOAL_PRESETS: GoalPreset[] = [
  {
    id: "transfer",
    label: "Send money",
    korean: "계좌이체",
    emoji: "→",
    goalText: "I want to send money to someone",
  },
  {
    id: "open-account",
    label: "Open an account",
    korean: "계좌 만들기",
    emoji: "+",
    goalText: "I want to open a new bank account",
  },
  {
    id: "check-balance",
    label: "Check balance",
    korean: "잔액 조회",
    emoji: "₩",
    goalText: "I want to check my account balance",
  },
  {
    id: "pay-bills",
    label: "Pay bills",
    korean: "공과금 납부",
    emoji: "📃",
    goalText: "I want to pay a bill or utility",
  },
  {
    id: "login",
    label: "Log in",
    korean: "로그인",
    emoji: "🔑",
    goalText: "I want to log in to the app",
  },
  {
    id: "atm",
    label: "Find an ATM",
    korean: "ATM 찾기",
    emoji: "🏧",
    goalText: "I want to find an ATM nearby",
  },
];

export function GoalSelector({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (goal: string | null) => void;
}) {
  const [showCustom, setShowCustom] = useState(false);
  const [customText, setCustomText] = useState("");

  const presetMatch = GOAL_PRESETS.find((p) => p.goalText === value);
  const isCustom = value !== null && !presetMatch;

  return (
    <div className="rounded-[18px] border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--accent-deep)]">
            What do you want to do?
          </p>
          <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">
            Optional — we&apos;ll find the right button for that goal.
          </p>
        </div>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              setShowCustom(false);
              setCustomText("");
            }}
            className="font-display rounded-full px-2.5 py-1 text-[11.5px] font-semibold text-[var(--muted)] hover:text-[var(--danger)]"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {GOAL_PRESETS.map((p) => {
          const active = value === p.goalText;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onChange(active ? null : p.goalText);
                setShowCustom(false);
              }}
              className={`font-display inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition ${
                active
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : "border-[var(--line)] bg-[var(--background)] text-[var(--fg-sub)] hover:border-[var(--accent)] hover:text-[var(--accent-deep)]"
              }`}
            >
              <span aria-hidden="true">{p.emoji}</span>
              <span>{p.label}</span>
              <span
                className={`text-[10.5px] ${
                  active ? "text-white/80" : "text-[var(--muted)]"
                }`}
              >
                {p.korean}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => {
            setShowCustom((v) => !v);
            if (!isCustom) onChange(null);
          }}
          className={`font-display inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition ${
            isCustom || showCustom
              ? "border-[var(--accent)] text-[var(--accent-deep)]"
              : "border-dashed border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent-deep)]"
          }`}
        >
          ✎ Other…
        </button>
      </div>

      {(showCustom || isCustom) && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = customText.trim();
            if (trimmed) onChange(trimmed);
          }}
          className="mt-3 flex gap-2"
        >
          <input
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="e.g. cancel my auto-transfer"
            className="font-display flex-1 rounded-full border border-[var(--line)] bg-[var(--background)] px-3.5 py-2 text-[16px] outline-none focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            className="font-display rounded-full bg-[var(--accent)] px-4 py-2 text-[12.5px] font-bold text-white hover:bg-[var(--accent-deep)]"
          >
            Set
          </button>
        </form>
      )}

      {isCustom && !showCustom && (
        <p className="mt-3 text-[12.5px] text-[var(--fg-sub)]">
          <span className="font-display font-bold">Goal: </span>
          {value}
        </p>
      )}
    </div>
  );
}
