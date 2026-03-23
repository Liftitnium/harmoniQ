"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Award, BookOpen, CalendarDays, Flame, Music2, Trophy } from "lucide-react";
import {
  MY_BOOKED_TUTORS,
  PROFILE_BADGES,
  PROGRESS_DASHBOARD,
  SHEET_MUSIC,
  STUDENT,
  TOTAL_PRACTICE_HOURS,
  USER_PROFILE,
  XP_SYSTEM,
} from "@/lib/data";

type Tab = "stats" | "tutors" | "sheets";

function xpPct(current: number, target: number) {
  return Math.min(100, Math.round((current / target) * 100));
}

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>("stats");
  const [xp] = useState<number>(XP_SYSTEM.currentXp);

  const favorites = useMemo(() => {
    const set = new Set<string>(USER_PROFILE.favoriteSheetMusicIds);
    return SHEET_MUSIC.filter((s) => set.has(s.id));
  }, []);

  const tabs: { id: Tab; label: string }[] = [
    { id: "stats", label: "My Stats" },
    { id: "tutors", label: "My Tutors" },
    { id: "sheets", label: "My Sheet Music" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
        Profile
      </h1>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-teal-600 text-3xl font-black text-white">
            {USER_PROFILE.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xl font-black text-slate-900 dark:text-slate-100">
              {USER_PROFILE.displayName}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-400">
              Member since {USER_PROFILE.memberSince}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-extrabold text-teal-900 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-200">
                {USER_PROFILE.currentInstrument}
              </span>
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-extrabold text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200">
                {USER_PROFILE.level}
              </span>
            </div>
            <p className="mt-4 text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300">
              {USER_PROFILE.bio}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                XP progress
              </p>
              <p className="mt-1 text-sm font-extrabold text-slate-900 dark:text-slate-100">
                {xp} / {XP_SYSTEM.xpForNextLevel} XP to Level {XP_SYSTEM.nextLevel}
              </p>
            </div>
            <Trophy className="h-6 w-6 text-teal-700 dark:text-teal-400" />
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white dark:bg-slate-900">
            <div
              className="h-2.5 rounded-full bg-teal-600 dark:bg-teal-500"
              style={{ width: `${xpPct(xp, XP_SYSTEM.xpForNextLevel)}%` }}
            />
          </div>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-2xl border px-4 py-2.5 text-sm font-extrabold transition ${
              tab === t.id
                ? "border-teal-200 bg-teal-50 text-teal-900 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-100"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "stats" ? (
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Flame className="h-5 w-5 text-teal-700 dark:text-teal-400" />
            <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Streak
            </p>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
              {STUDENT.streakDays} days
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <CalendarDays className="h-5 w-5 text-teal-700 dark:text-teal-400" />
            <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Practice hours
            </p>
            <p className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
              {TOTAL_PRACTICE_HOURS}h
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:col-span-3 lg:col-span-1">
            <Award className="h-5 w-5 text-teal-700 dark:text-teal-400" />
            <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Milestones
            </p>
            <ul className="mt-2 space-y-2">
              {PROGRESS_DASHBOARD.milestones.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  <span>{m.label}</span>
                  <span
                    className={
                      m.unlocked
                        ? "text-xs font-extrabold text-emerald-700 dark:text-emerald-400"
                        : "text-xs font-extrabold text-slate-400"
                    }
                  >
                    {m.unlocked ? "Unlocked" : "Locked"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {tab === "tutors" ? (
        <section className="space-y-3">
          {MY_BOOKED_TUTORS.map((t) => (
            <div
              key={t.id}
              className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-sm font-extrabold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {t.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </div>
                <div>
                  <p className="font-extrabold text-slate-900 dark:text-slate-100">{t.name}</p>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    Last session: {t.lastSession} · {t.instrument}
                  </p>
                </div>
              </div>
              <Link
                href="/tutors"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-teal-700 px-5 text-sm font-extrabold text-white transition hover:bg-teal-800"
              >
                Book Again
              </Link>
            </div>
          ))}
        </section>
      ) : null}

      {tab === "sheets" ? (
        <section className="grid gap-3 sm:grid-cols-2">
          {favorites.map((s) => (
            <div
              key={s.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-extrabold text-slate-900 dark:text-slate-100">{s.title}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    {s.composer}
                  </p>
                </div>
                <Music2 className="h-5 w-5 shrink-0 text-teal-700 dark:text-teal-400" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-extrabold text-slate-700 dark:border-slate-700 dark:text-slate-300">
                  {s.instrument}
                </span>
                <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-extrabold text-teal-900 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-200">
                  {s.difficulty}
                </span>
              </div>
              <Link
                href="/sheet-music"
                className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-teal-700 dark:text-teal-400"
              >
                <BookOpen className="h-4 w-4" />
                Open library
              </Link>
            </div>
          ))}
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-teal-700 dark:text-teal-400" />
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Badges</h2>
        </div>
        <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-400">
          Collect badges as you learn and engage.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PROFILE_BADGES.map((b) => (
            <div
              key={b.id}
              className={`rounded-2xl border p-4 ${
                b.unlocked
                  ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30"
                  : "border-slate-200 bg-slate-50 opacity-80 dark:border-slate-800 dark:bg-slate-800/40"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                    b.unlocked
                      ? "border-emerald-200 bg-white dark:border-emerald-800 dark:bg-emerald-950/50"
                      : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
                  }`}
                >
                  <Award
                    className={`h-5 w-5 ${b.unlocked ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400"}`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{b.name}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {b.description}
                  </p>
                  <p
                    className={`mt-2 text-xs font-extrabold ${b.unlocked ? "text-emerald-800 dark:text-emerald-300" : "text-slate-500"}`}
                  >
                    {b.unlocked ? "Unlocked" : "Locked"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
