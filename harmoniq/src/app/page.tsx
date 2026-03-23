import Link from "next/link";
import { Bolt, CalendarDays, Music2, Star } from "lucide-react";
import { STUDENT } from "@/lib/data";
import { DashboardGamification } from "@/components/harmoniq/DashboardGamification";

export default function Home() {
  return (
    <div className="space-y-6">
      <DashboardGamification />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Hi {STUDENT.name}!{" "}
            <span className="text-teal-700 dark:text-teal-400">Ready to play?</span>
          </h1>
          <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
            Your next practice plan is waiting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100">
            <Star className="h-4 w-4 text-teal-700" />
            Streak: {STUDENT.streakDays} days
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Progress summary
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 dark:border-teal-900 dark:bg-teal-950/40">
                  <p className="text-xs font-bold text-teal-800 dark:text-teal-300">Instrument</p>
                  <p className="mt-1 text-lg font-black text-slate-900 dark:text-slate-100">
                    {STUDENT.currentInstrument}
                  </p>
                </div>
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 dark:border-indigo-900 dark:bg-indigo-950/40">
                  <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300">Level</p>
                  <p className="mt-1 text-lg font-black text-slate-900 dark:text-slate-100">
                    {STUDENT.currentLevel}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950/30">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Streak</p>
                  <div className="mt-1 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-teal-700" />
                    <p className="text-lg font-black text-slate-900 dark:text-slate-100">
                      {STUDENT.streakDays} days
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sm:pt-1">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-950/30">
                <Music2 className="h-5 w-5 text-teal-700 dark:text-teal-400" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Today&apos;s focus</p>
                  <p className="truncate text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    Chords + rhythm drills
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
              Keep the momentum.
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-400">
              Small daily tasks move you faster than random practice.
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/practice-plan"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-700 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-teal-800"
              >
                <Bolt className="h-4 w-4" />
                Continue Learning
              </Link>
              <Link
                href="/progress"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-900 transition hover:border-teal-200 hover:bg-teal-50"
              >
                View Progress
              </Link>
            </div>
          </div>
        </section>

        <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Quick links
          </p>
          <div className="mt-4 grid gap-2">
            <Link
              href="/tutors"
              className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-teal-200 hover:bg-teal-50 dark:border-slate-700 dark:bg-slate-950/30 dark:hover:border-teal-800 dark:hover:bg-teal-950/30"
            >
              <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                Find a Tutor
              </span>
              <span className="text-xs font-bold text-teal-700 transition group-hover:translate-x-0.5">
                →
              </span>
            </Link>
            <Link
              href="/sheet-music"
              className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-teal-200 hover:bg-teal-50 dark:border-slate-700 dark:bg-slate-950/30 dark:hover:border-teal-800 dark:hover:bg-teal-950/30"
            >
              <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                Sheet Music Library
              </span>
              <span className="text-xs font-bold text-teal-700 transition group-hover:translate-x-0.5">
                →
              </span>
            </Link>
            <Link
              href="/practice-plan"
              className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-teal-200 hover:bg-teal-50 dark:border-slate-700 dark:bg-slate-950/30 dark:hover:border-teal-800 dark:hover:bg-teal-950/30"
            >
              <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                Practice Plan
              </span>
              <span className="text-xs font-bold text-teal-700 transition group-hover:translate-x-0.5">
                →
              </span>
            </Link>
            <Link
              href="/progress"
              className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-teal-200 hover:bg-teal-50 dark:border-slate-700 dark:bg-slate-950/30 dark:hover:border-teal-800 dark:hover:bg-teal-950/30"
            >
              <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                Progress Tracking
              </span>
              <span className="text-xs font-bold text-teal-700 transition group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
