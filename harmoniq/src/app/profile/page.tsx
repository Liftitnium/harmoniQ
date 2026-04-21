"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  CalendarDays,
  Clock,
  Flame,
  Loader2,
  Music2,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SHEET_MUSIC, USER_PROFILE } from "@/lib/data";
import { PROFILE_BADGES } from "@/lib/data";

type Tab = "stats" | "library";

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>("stats");
  const [loading, setLoading] = useState(true);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [weeksCompleted, setWeeksCompleted] = useState(0);

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: rm } = await supabase
      .from("roadmaps")
      .select("current_week")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (rm) {
      setWeeksCompleted(Math.max(0, rm.current_week - 1));
    }

    const { count } = await supabase
      .from("week_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("completed", true);

    setTotalCompleted(count ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const xp = totalCompleted * 10;
  const streak = Math.min(totalCompleted, 30);
  const practiceHours = Math.round((totalCompleted * 20) / 60);

  const favorites = useMemo(() => {
    const set = new Set<string>(USER_PROFILE.favoriteSheetMusicIds);
    return SHEET_MUSIC.filter((s) => set.has(s.id));
  }, []);

  const tabs: { id: Tab; label: string }[] = [
    { id: "stats", label: "Stats" },
    { id: "library", label: "My Library" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">Profile</h1>

      {/* profile card */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-teal-600 text-3xl font-black text-white">
            {USER_PROFILE.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xl font-black text-slate-900 dark:text-slate-100">{USER_PROFILE.displayName}</p>
            <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-400">Member since {USER_PROFILE.memberSince}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-extrabold text-teal-900 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-200">{USER_PROFILE.currentInstrument}</span>
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-extrabold text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200">{USER_PROFILE.level}</span>
            </div>
            <p className="mt-4 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300">{USER_PROFILE.bio}</p>
          </div>
        </div>

        {/* XP bar */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">XP</p>
              <p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-slate-100">{xp} XP · {weeksCompleted} weeks completed</p>
            </div>
            <Sparkles className="h-5 w-5 text-teal-700 dark:text-teal-400" />
          </div>
        </div>
      </section>

      {/* tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`shrink-0 rounded-2xl border px-4 py-2.5 text-sm font-extrabold transition ${tab === t.id ? "border-teal-200 bg-teal-50 text-teal-900 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-100" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"}`}>{t.label}</button>
        ))}
      </div>

      {tab === "stats" && (
        <>
          <section className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Flame className="h-5 w-5 text-teal-700 dark:text-teal-400" />
              <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Streak</p>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">{loading ? "–" : `${streak}d`}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Clock className="h-5 w-5 text-teal-700 dark:text-teal-400" />
              <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Hours</p>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">{loading ? "–" : `${practiceHours}h`}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CalendarDays className="h-5 w-5 text-teal-700 dark:text-teal-400" />
              <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Weeks</p>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">{loading ? "–" : weeksCompleted}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">XP</p>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">{loading ? "–" : xp}</p>
            </div>
          </section>

          {/* badges */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-teal-700 dark:text-teal-400" />
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Badges</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PROFILE_BADGES.map((b) => (
                <div key={b.id} className={`rounded-2xl border p-4 ${b.unlocked ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30" : "border-slate-200 bg-slate-50 opacity-80 dark:border-slate-800 dark:bg-slate-800/40"}`}>
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${b.unlocked ? "border-emerald-200 bg-white dark:border-emerald-800 dark:bg-emerald-950/50" : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"}`}>
                      <Award className={`h-5 w-5 ${b.unlocked ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400"}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{b.name}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-400">{b.description}</p>
                      <p className={`mt-2 text-xs font-extrabold ${b.unlocked ? "text-emerald-800 dark:text-emerald-300" : "text-slate-500"}`}>{b.unlocked ? "Unlocked" : "Locked"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {tab === "library" && (
        <section className="grid gap-3 sm:grid-cols-2">
          {favorites.length === 0 ? (
            <p className="col-span-full text-sm font-semibold text-slate-500 dark:text-slate-400">No favorites yet — browse the sheet music library to save pieces.</p>
          ) : (
            favorites.map((s) => (
              <div key={s.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-slate-100">{s.title}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-400">{s.composer}</p>
                  </div>
                  <Music2 className="h-5 w-5 shrink-0 text-teal-700 dark:text-teal-400" />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-extrabold text-slate-700 dark:border-slate-700 dark:text-slate-300">{s.instrument}</span>
                  <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-extrabold text-teal-900 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-200">{s.difficulty}</span>
                </div>
                <Link href="/sheet-music" className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-teal-700 dark:text-teal-400">
                  <BookOpen className="h-4 w-4" />Open library
                </Link>
              </div>
            ))
          )}
        </section>
      )}

      {loading && (
        <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-teal-600" /></div>
      )}
    </div>
  );
}
