"use client";

import React, { useCallback, useState } from "react";
import { Sparkles, Trophy } from "lucide-react";
import {
  DAILY_CHALLENGE,
  XP_SYSTEM,
} from "@/lib/data";
import { useToast } from "./toast/ToastProvider";

function xpProgress(current: number, target: number) {
  return Math.min(100, Math.round((current / target) * 100));
}

export function DashboardGamification() {
  const { addToast } = useToast();
  const [xp, setXp] = useState<number>(XP_SYSTEM.currentXp);
  const [challengeDone, setChallengeDone] = useState(false);
  const [confetti, setConfetti] = useState(false);

  const pct = xpProgress(xp, XP_SYSTEM.xpForNextLevel);

  const onCompleteChallenge = useCallback(() => {
    if (challengeDone) return;
    setChallengeDone(true);
    setXp((x) => x + DAILY_CHALLENGE.xpReward);
    setConfetti(true);
    window.setTimeout(() => setConfetti(false), 1000);
    addToast({
      kind: "success",
      title: `+${DAILY_CHALLENGE.xpReward} XP`,
      message: "Daily challenge complete!",
    });
  }, [addToast, challengeDone]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Experience
            </p>
            <p className="mt-2 text-lg font-black text-slate-900 dark:text-slate-100">
              Level {XP_SYSTEM.currentLevel}{" "}
              <span className="text-teal-700 dark:text-teal-400">
                → {XP_SYSTEM.nextLevel}
              </span>
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-400">
              {xp} / {XP_SYSTEM.xpForNextLevel} XP to Level {XP_SYSTEM.nextLevel}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100 dark:border-teal-900 dark:bg-teal-950/50">
            <Trophy className="h-6 w-6 text-teal-700 dark:text-teal-400" />
          </div>
        </div>
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-3 rounded-full bg-teal-600 transition-[width] duration-500 dark:bg-teal-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </section>

      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {confetti ? (
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            {Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                className="confetti-piece"
                style={{
                  left: `${8 + (i % 6) * 14}%`,
                  top: "40%",
                  backgroundColor:
                    i % 3 === 0 ? "#0d9488" : i % 3 === 1 ? "#6366f1" : "#fbbf24",
                  animationDelay: `${i * 40}ms`,
                  ["--tx" as string]: `${(i - 9) * 12}px`,
                  ["--ty" as string]: `${-30 - (i % 5) * 8}px`,
                }}
              />
            ))}
          </div>
        ) : null}
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {DAILY_CHALLENGE.title}
            </p>
            <p className="mt-2 text-base font-extrabold text-slate-900 dark:text-slate-100">
              {DAILY_CHALLENGE.description}
            </p>
            <p className="mt-2 text-sm font-semibold text-teal-800 dark:text-teal-300">
              Reward: +{DAILY_CHALLENGE.xpReward} XP
            </p>
          </div>
          <Sparkles className="h-6 w-6 shrink-0 text-teal-700 dark:text-teal-400" />
        </div>
        <button
          type="button"
          disabled={challengeDone}
          onClick={onCompleteChallenge}
          className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-teal-700 text-sm font-extrabold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
        >
          {challengeDone ? "Completed today" : "Mark Complete"}
        </button>
      </section>
    </div>
  );
}
