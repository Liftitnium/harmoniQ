"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  CalendarDays,
  Clock,
  Flame,
  Heart,
  Loader2,
  Music2,
  Shield,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { xpProgress, BADGES } from "@/lib/xp";

interface FavoriteSong {
  songsterrId: number;
  title: string;
  artist: string;
}

type Tab = "stats" | "library";

interface ProfileRow {
  xp: number;
  streak_days: number;
  current_level: number;
  max_streak: number;
  freeze_count: number;
  total_tasks_completed: number;
}

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>("stats");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [weeksCompleted, setWeeksCompleted] = useState(0);
  const [practiceMinutes, setPracticeMinutes] = useState(0);
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<Set<string>>(new Set());
  const [displayName, setDisplayName] = useState("Guitarist");
  const [memberSince, setMemberSince] = useState("");

  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    // Get display name from profile
    const { data: profileInfo } = await supabase
      .from("profiles")
      .select("display_name, created_at")
      .eq("id", user.id)
      .single();

    if (profileInfo) {
      setDisplayName(profileInfo.display_name || user.email?.split("@")[0] || "Guitarist");
      if (profileInfo.created_at) {
        setMemberSince(new Date(profileInfo.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }));
      }
    }

    const { data: prof } = await supabase
      .from("profiles")
      .select("xp, streak_days, current_level, max_streak, freeze_count, total_tasks_completed")
      .eq("id", user.id)
      .single();

    if (prof) setProfile(prof as ProfileRow);

    const { data: rm } = await supabase
      .from("roadmaps")
      .select("current_week")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (rm) setWeeksCompleted(Math.max(0, rm.current_week - 1));

    // Sum practice_minutes from week_progress
    const { data: progressRows } = await supabase
      .from("week_progress")
      .select("practice_minutes")
      .eq("user_id", user.id)
      .eq("completed", true);

    const totalMin = (progressRows ?? []).reduce(
      (sum, r) => sum + ((r as { practice_minutes?: number }).practice_minutes ?? 0),
      0,
    );
    setPracticeMinutes(totalMin);

    // Fetch badge unlocks
    const { data: badges } = await supabase
      .from("badge_unlocks")
      .select("badge_id")
      .eq("user_id", user.id);

    setUnlockedBadgeIds(new Set((badges ?? []).map((b) => b.badge_id)));

    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const xp = profile?.xp ?? 0;
  const streakDays = profile?.streak_days ?? 0;
  const maxStreak = profile?.max_streak ?? 0;
  const freezes = profile?.freeze_count ?? 0;
  const totalTasks = profile?.total_tasks_completed ?? 0;
  const practiceHours = Math.round(practiceMinutes / 60);
  const prog = xpProgress(xp);

  const [songFavorites, setSongFavorites] = useState<FavoriteSong[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("harmoniq:favorites");
      if (raw) setSongFavorites(JSON.parse(raw));
    } catch { /* noop */ }
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
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xl font-black text-slate-900 dark:text-slate-100">{displayName}</p>
            <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-400">{memberSince && <>Member since {memberSince}</>}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-extrabold text-teal-900 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-200">Guitar</span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">Level {prog.level}</span>
              {streakDays >= 7 && (
                <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-extrabold text-orange-900 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-200">
                  🔥 {streakDays >= 30 ? "2x" : "1.5x"} XP
                </span>
              )}
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-xs font-black text-white shadow">
                {prog.level}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Level {prog.level}</p>
                <p className="mt-0.5 text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  {xp.toLocaleString()}{prog.nextThreshold ? ` / ${prog.nextThreshold.toLocaleString()}` : ""} XP
                </p>
              </div>
            </div>
            <Sparkles className="h-5 w-5 text-amber-500" />
          </div>
          {prog.nextThreshold && (
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-[width] duration-700"
                style={{ width: `${Math.round(prog.progressFraction * 100)}%` }}
              />
            </div>
          )}
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
          {/* stats grid */}
          <section className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Flame className="h-5 w-5 text-orange-500" />
              <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Streak</p>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">
                {loading ? "–" : `${streakDays}d`}
              </p>
              {freezes > 0 && (
                <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400">
                  <Shield className="h-3 w-3" /> {freezes} freeze{freezes !== 1 ? "s" : ""}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Trophy className="h-5 w-5 text-amber-500" />
              <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Best Streak</p>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">
                {loading ? "–" : `${maxStreak}d`}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Zap className="h-5 w-5 text-teal-700 dark:text-teal-400" />
              <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Tasks Done</p>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">
                {loading ? "–" : totalTasks}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Clock className="h-5 w-5 text-teal-700 dark:text-teal-400" />
              <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Practice</p>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">
                {loading ? "–" : `${practiceHours}h`}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CalendarDays className="h-5 w-5 text-teal-700 dark:text-teal-400" />
              <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Weeks</p>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">
                {loading ? "–" : weeksCompleted}
              </p>
            </div>
          </section>

          {/* badges */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-teal-700 dark:text-teal-400" />
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Badges</h2>
              <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {unlockedBadgeIds.size} / {BADGES.length}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {BADGES.map((b) => {
                const unlocked = unlockedBadgeIds.has(b.id);
                return (
                  <div
                    key={b.id}
                    className={`rounded-2xl border p-4 transition ${
                      unlocked
                        ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                        : "border-slate-200 bg-slate-50 opacity-60 dark:border-slate-800 dark:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-lg ${
                          unlocked
                            ? "border-emerald-200 bg-white dark:border-emerald-800 dark:bg-emerald-950/50"
                            : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                        }`}
                      >
                        {unlocked ? b.emoji : "🔒"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{b.name}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-400">{b.description}</p>
                        <p
                          className={`mt-2 text-xs font-extrabold ${
                            unlocked
                              ? "text-emerald-800 dark:text-emerald-300"
                              : "text-slate-500"
                          }`}
                        >
                          {unlocked ? "Unlocked" : "Locked"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {tab === "library" && (
        <section className="grid gap-3 sm:grid-cols-2">
          {songFavorites.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
              <Heart className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
              <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                No favorites yet — browse the sheet music library to save songs.
              </p>
              <Link href="/sheet-music" className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-teal-700 dark:text-teal-400">
                <Music2 className="h-4 w-4" />Open sheet music
              </Link>
            </div>
          ) : (
            songFavorites.map((s) => (
              <div key={s.songsterrId} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-extrabold text-slate-900 dark:text-slate-100">{s.title}</p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-600 dark:text-slate-400">{s.artist}</p>
                  </div>
                  <Music2 className="h-5 w-5 shrink-0 text-teal-700 dark:text-teal-400" />
                </div>
                <Link href="/sheet-music" className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-teal-700 dark:text-teal-400">
                  <Music2 className="h-4 w-4" />Play in sheet music
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
