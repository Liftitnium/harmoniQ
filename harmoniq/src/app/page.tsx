"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Flame,
  Loader2,
  Map,
  Music2,
  Sparkles,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { DailyTask, RoadmapPlan, RoadmapWeek } from "@/lib/roadmap-schema";

const TODAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
  new Date().getDay()
];

const TYPE_ICON: Record<string, typeof Zap> = {
  warmup: Flame,
  technique: Zap,
  song: Music2,
  theory: Sparkles,
  ear: Sparkles,
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState<RoadmapWeek | null>(null);
  const [plan, setPlan] = useState<RoadmapPlan | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [weeklyMinutesDone, setWeeklyMinutesDone] = useState(0);
  const [weeklyMinutesTarget, setWeeklyMinutesTarget] = useState(0);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: rm } = await supabase
      .from("roadmaps")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (rm) {
      const p = rm.plan_json as RoadmapPlan;
      setPlan(p);
      const cw = p.weeks.find((w) => w.week_number === rm.current_week) ?? null;
      setCurrentWeek(cw);

      const totalMin = cw?.daily_tasks.reduce((s, t) => s + t.minutes, 0) ?? 0;
      setWeeklyMinutesTarget(totalMin);

      const { data: prog } = await supabase
        .from("week_progress")
        .select("task_id, completed")
        .eq("user_id", user.id)
        .eq("roadmap_id", rm.id);

      const ids = new Set((prog ?? []).filter((p) => p.completed).map((p) => p.task_id));
      setCompletedIds(ids);
      setTotalCompleted(ids.size);

      if (cw) {
        const done = cw.daily_tasks
          .filter((t) => ids.has(t.id))
          .reduce((s, t) => s + t.minutes, 0);
        setWeeklyMinutesDone(done);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const todayTasks: DailyTask[] = useMemo(
    () => currentWeek?.daily_tasks.filter((t) => t.day === TODAY_SHORT) ?? [],
    [currentWeek]
  );

  const todayDone = todayTasks.filter((t) => completedIds.has(t.id)).length;
  const todayTotal = todayTasks.length;
  const xp = totalCompleted * 10;
  const streakEstimate = Math.min(totalCompleted, 30);
  const weeksCompleted = plan
    ? plan.weeks.filter(
        (w) => w.week_number < (currentWeek?.week_number ?? 1)
      ).length
    : 0;

  const minutesPct =
    weeklyMinutesTarget > 0
      ? Math.min(100, Math.round((weeklyMinutesDone / weeklyMinutesTarget) * 100))
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* === HERO: Today's practice === */}
      <section className="rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-6 shadow-sm dark:border-teal-800 dark:from-teal-950/40 dark:to-slate-900">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-700 dark:text-teal-400">
              Today&apos;s Practice
            </p>
            {todayTasks.length > 0 ? (
              <>
                <h1 className="mt-2 text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
                  {todayDone === todayTotal
                    ? "All done for today!"
                    : `${todayTotal - todayDone} task${todayTotal - todayDone === 1 ? "" : "s"} left today`}
                </h1>
                <div className="mt-4 space-y-2">
                  {todayTasks.map((t) => {
                    const done = completedIds.has(t.id);
                    const Icon = TYPE_ICON[t.type] ?? Zap;
                    return (
                      <div
                        key={t.id}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-2.5 ${
                          done
                            ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/20"
                            : "border-white/80 bg-white dark:border-slate-700 dark:bg-slate-900"
                        }`}
                      >
                        <Icon className={`h-4 w-4 shrink-0 ${done ? "text-emerald-600 dark:text-emerald-400" : "text-teal-600 dark:text-teal-400"}`} />
                        <span
                          className={`flex-1 text-sm font-semibold ${done ? "text-slate-400 line-through dark:text-slate-500" : "text-slate-800 dark:text-slate-200"}`}
                        >
                          {t.title}
                        </span>
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                          {t.minutes}m
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : currentWeek ? (
              <h1 className="mt-2 text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
                No tasks scheduled for today
              </h1>
            ) : (
              <h1 className="mt-2 text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
                Complete onboarding to get your plan
              </h1>
            )}

            <div className="mt-5">
              <Link
                href="/roadmap"
                className="inline-flex h-11 items-center gap-2 rounded-2xl bg-teal-700 px-6 text-sm font-extrabold text-white transition hover:bg-teal-800"
              >
                {todayTasks.length > 0 ? "Start practicing" : "Open roadmap"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {todayTotal > 0 && (
            <div className="flex flex-col items-center gap-1">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <svg width={64} height={64} className="-rotate-90">
                  <circle cx={32} cy={32} r={27} fill="none" stroke="currentColor" strokeWidth={5} className="text-teal-100 dark:text-teal-900" />
                  <circle
                    cx={32} cy={32} r={27} fill="none" stroke="currentColor" strokeWidth={5}
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 27}
                    strokeDashoffset={2 * Math.PI * 27 * (1 - todayDone / todayTotal)}
                    className="text-teal-600 transition-all duration-500 dark:text-teal-400"
                  />
                </svg>
                <span className="absolute text-xs font-extrabold text-slate-900 dark:text-slate-100">
                  {todayDone}/{todayTotal}
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">today</p>
            </div>
          )}
        </div>
      </section>

      {/* === STATS ROW === */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Flame className="h-5 w-5 text-teal-700 dark:text-teal-400" />
          <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Streak
          </p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">
            {streakEstimate} days
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            XP earned
          </p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">
            {xp} <span className="text-sm font-bold text-slate-500">XP</span>
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Clock className="h-5 w-5 text-teal-700 dark:text-teal-400" />
          <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Weekly minutes
          </p>
          <p className="mt-1 text-sm font-extrabold text-slate-700 dark:text-slate-300">
            {weeklyMinutesDone} / {weeklyMinutesTarget} min
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-2 rounded-full bg-teal-600 transition-[width] duration-500 dark:bg-teal-500"
              style={{ width: `${minutesPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* === QUICK LINKS === */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/roadmap"
          className="group flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-teal-200 hover:bg-teal-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-800 dark:hover:bg-teal-950/30"
        >
          <div className="flex items-center gap-3">
            <Map className="h-5 w-5 text-teal-700 dark:text-teal-400" />
            <div>
              <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                Full Roadmap
              </p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Week {currentWeek?.week_number ?? "–"} of {plan?.total_weeks ?? "–"} · {weeksCompleted} completed
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-teal-600" />
        </Link>

        <Link
          href="/sheet-music"
          className="group flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm transition hover:border-teal-200 hover:bg-teal-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-800 dark:hover:bg-teal-950/30"
        >
          <div className="flex items-center gap-3">
            <Music2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                Sheet Music
              </p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Browse extra pieces for self-directed practice
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-teal-600" />
        </Link>
      </div>
    </div>
  );
}
