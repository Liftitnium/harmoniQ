"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PROGRESS_DASHBOARD } from "@/lib/data";
import type { RoadmapPlan } from "@/lib/roadmap-schema";

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function SkillBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{label}</p>
        <p className="text-sm font-extrabold text-teal-800 dark:text-teal-400">{value}%</p>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-2 rounded-full bg-teal-600 dark:bg-teal-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const activity = PROGRESS_DASHBOARD.activity;
  const maxMinutes = Math.max(...activity.map((a) => a.minutes));

  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<RoadmapPlan | null>(null);
  const [currentWeekNum, setCurrentWeekNum] = useState(1);
  const [totalCompleted, setTotalCompleted] = useState(0);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: rm } = await supabase
      .from("roadmaps")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (rm) {
      setPlan(rm.plan_json as RoadmapPlan);
      setCurrentWeekNum(rm.current_week);

      const { count } = await supabase
        .from("week_progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("roadmap_id", rm.id)
        .eq("completed", true);

      setTotalCompleted(count ?? 0);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const weeksCompleted = plan
    ? plan.weeks.filter((w) => w.week_number < currentWeekNum).length
    : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Progress
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
            Your practice stats and roadmap journey.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-teal-700 dark:text-teal-400" />
            <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">This week</p>
          </div>
          <p className="mt-1 text-sm font-extrabold text-slate-700 dark:text-slate-300">
            {activity.reduce((a, b) => a + b.minutes, 0)} minutes practiced
          </p>
        </div>
      </div>

      {/* stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <CheckCircle2 className="h-5 w-5 text-teal-700 dark:text-teal-400" />
          <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Weeks completed</p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">{weeksCompleted}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Clock className="h-5 w-5 text-teal-700 dark:text-teal-400" />
          <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Tasks completed</p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">{loading ? "–" : totalCompleted}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">XP earned</p>
          <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">{loading ? "–" : totalCompleted * 10}</p>
        </div>
      </div>

      {/* weekly chart */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Weekly activity</p>
        <div className="mt-4 flex h-44 items-end gap-3">
          {activity.map((a) => {
            const height = Math.max(10, Math.round((a.minutes / maxMinutes) * 140));
            return (
              <div key={a.day} className="flex flex-1 flex-col items-center gap-3">
                <div className="relative w-full rounded-2xl border border-teal-100 bg-teal-50 group dark:border-teal-900 dark:bg-teal-950/30" style={{ height: 140 }} title={`${a.minutes} min`}>
                  <div className="absolute inset-x-2 bottom-2 rounded-2xl bg-teal-600 transition group-hover:opacity-95 dark:bg-teal-500" style={{ height }} />
                </div>
                <p className="text-xs font-extrabold text-slate-600 dark:text-slate-400">{a.day}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* skills */}
      <section className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Skills</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {PROGRESS_DASHBOARD.skills.map((s) => (
            <SkillBar key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      </section>

      {/* roadmap weeks timeline */}
      {plan && (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Roadmap timeline</p>
          <div className="mt-4 space-y-3">
            {plan.weeks.map((w) => {
              const isDone = w.week_number < currentWeekNum;
              const isCurrent = w.week_number === currentWeekNum;
              return (
                <div key={w.week_number} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cx(
                      "flex h-7 w-7 items-center justify-center rounded-full border",
                      isDone ? "border-emerald-300 bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/40" :
                      isCurrent ? "border-teal-300 bg-teal-100 dark:border-teal-700 dark:bg-teal-900/40" :
                      "border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
                    )}>
                      {isDone ? <Check className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" /> :
                       isCurrent ? <span className="h-2 w-2 rounded-full bg-teal-600 dark:bg-teal-400" /> :
                       <Lock className="h-3 w-3 text-slate-400" />}
                    </div>
                    {w.week_number < plan.weeks.length && (
                      <div className={cx("w-px flex-1 min-h-[16px]", isDone ? "bg-emerald-300 dark:bg-emerald-700" : "bg-slate-200 dark:bg-slate-700")} />
                    )}
                  </div>
                  <div className="min-w-0 pb-3">
                    <p className={cx(
                      "text-sm font-extrabold",
                      isDone ? "text-emerald-800 dark:text-emerald-300" :
                      isCurrent ? "text-teal-800 dark:text-teal-300" :
                      "text-slate-500 dark:text-slate-400"
                    )}>
                      Week {w.week_number}: {w.theme}
                    </p>
                    {(isDone || isCurrent) && (
                      <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">{w.summary}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
        </div>
      )}
    </div>
  );
}
