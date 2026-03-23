"use client";

import React, { useMemo, useState } from "react";
import { Flame, Medal } from "lucide-react";
import { LEADERBOARD_ALL_TIME, LEADERBOARD_WEEKLY, type LeaderboardEntry } from "@/lib/data";

type Mode = "weekly" | "alltime";

function MedalIcon({ rank }: { rank: number }) {
  if (rank === 1) {
    return <Medal className="h-6 w-6 text-amber-500" strokeWidth={2} />;
  }
  if (rank === 2) {
    return <Medal className="h-6 w-6 text-slate-400" strokeWidth={2} />;
  }
  if (rank === 3) {
    return <Medal className="h-6 w-6 text-amber-700" strokeWidth={2} />;
  }
  return <span className="inline-flex w-6 justify-center text-sm font-black text-slate-500 dark:text-slate-400">{rank}</span>;
}

function Row({ e, mode }: { e: LeaderboardEntry; mode: Mode }) {
  const highlight = e.isRaji;
  const minutesLabel = mode === "weekly" ? "This week" : "All-time";
  const minutesDisplay =
    mode === "alltime" && e.minutes >= 1000
      ? `${Math.round(e.minutes / 60)}h`
      : `${e.minutes}m`;

  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 sm:flex-nowrap ${
        highlight
          ? "border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/40"
          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      <div className="flex w-8 shrink-0 justify-center">
        {e.rank <= 3 ? (
          <MedalIcon rank={e.rank} />
        ) : (
          <span className="text-sm font-black text-slate-600 dark:text-slate-300">{e.rank}</span>
        )}
      </div>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-extrabold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
        {e.initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-extrabold text-slate-900 dark:text-slate-100">{e.name}</p>
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{e.instrument}</p>
      </div>
      <div className="ml-auto text-right sm:ml-0">
        <p className="text-sm font-black text-slate-900 dark:text-slate-100">{minutesDisplay}</p>
        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{minutesLabel}</p>
      </div>
      <div className="flex w-full shrink-0 items-center justify-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-1 text-xs font-extrabold text-orange-800 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-200 sm:w-auto sm:justify-end">
        <Flame className="h-3.5 w-3.5" />
        {e.streak}d streak
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [mode, setMode] = useState<Mode>("weekly");
  const data = useMemo(
    () => (mode === "weekly" ? LEADERBOARD_WEEKLY : LEADERBOARD_ALL_TIME),
    [mode]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Leaderboard
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
            Practice minutes and streaks — friendly competition.
          </p>
        </div>
        <div className="inline-flex rounded-2xl border border-slate-200 p-1 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setMode("weekly")}
            className={`rounded-xl px-4 py-2 text-sm font-extrabold ${
              mode === "weekly"
                ? "bg-teal-700 text-white"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            Weekly
          </button>
          <button
            type="button"
            onClick={() => setMode("alltime")}
            className={`rounded-xl px-4 py-2 text-sm font-extrabold ${
              mode === "alltime"
                ? "bg-teal-700 text-white"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      <section className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Rankings
        </p>
        {data.map((e) => (
          <Row key={`${mode}-${e.id}`} e={e} mode={mode} />
        ))}
      </section>
    </div>
  );
}
