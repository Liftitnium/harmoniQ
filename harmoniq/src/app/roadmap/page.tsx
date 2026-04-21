"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  Ear,
  ExternalLink,
  Flame,
  Guitar,
  Loader2,
  Lock,
  Map as MapIcon,
  Music,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { songsterrSearchUrl } from "@/lib/songsterr";
import { SongsterrPlayer } from "@/components/harmoniq/roadmap/SongsterrPlayer";
import { useToast } from "@/components/harmoniq/toast/ToastProvider";
import type {
  DailyTask,
  RoadmapPlan,
  RoadmapSong,
  RoadmapWeek,
} from "@/lib/roadmap-schema";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

interface RoadmapRow {
  id: string;
  user_id: string;
  current_week: number;
  total_weeks: number;
  plan_json: RoadmapPlan;
}

interface ProgressRow {
  task_id: string;
  completed: boolean;
  difficulty_rating: number | null;
}

type DifficultyChoice = 1 | 3 | 5;

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const TODAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
  new Date().getDay()
];

const TYPE_META: Record<
  DailyTask["type"],
  { Icon: typeof Zap; label: string; color: string }
> = {
  warmup: {
    Icon: Flame,
    label: "Warm-up",
    color:
      "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
  },
  technique: {
    Icon: Zap,
    label: "Technique",
    color:
      "text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800",
  },
  song: {
    Icon: Music,
    label: "Song",
    color:
      "text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800",
  },
  theory: {
    Icon: BookOpen,
    label: "Theory",
    color:
      "text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800",
  },
  ear: {
    Icon: Ear,
    label: "Ear training",
    color:
      "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800",
  },
};

/* ------------------------------------------------------------------ */
/*  Songsterr cache                                                   */
/* ------------------------------------------------------------------ */

const songIdCache = new Map<string, number | null>();

async function resolveSongId(
  title: string,
  artist: string
): Promise<number | null> {
  const key = `${title}||${artist}`;
  if (songIdCache.has(key)) return songIdCache.get(key)!;

  try {
    const url = `https://www.songsterr.com/a/ra/songs.json?pattern=${encodeURIComponent(`${title} ${artist}`)}`;
    const res = await fetch(url);
    if (!res.ok) {
      songIdCache.set(key, null);
      return null;
    }
    const data = await res.json();
    const id = data.length > 0 ? (data[0].id as number) : null;
    songIdCache.set(key, id);
    return id;
  } catch {
    songIdCache.set(key, null);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Small helper components                                           */
/* ------------------------------------------------------------------ */

function ProgressRing({
  completed,
  total,
  size = 56,
}: {
  completed: number;
  total: number;
  size?: number;
}) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = total === 0 ? 0 : completed / total;
  const offset = circ * (1 - pct);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-slate-200 dark:text-slate-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="text-teal-600 transition-[stroke-dashoffset] duration-500 dark:text-teal-400"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-slate-900 dark:text-slate-100">
        {completed}/{total}
      </span>
    </div>
  );
}

function SongCard({ song }: { song: RoadmapSong }) {
  const [songId, setSongId] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    resolveSongId(song.title, song.artist).then(setSongId);
  }, [song.title, song.artist]);

  const query = `${song.title} ${song.artist}`;
  const href =
    songId != null
      ? `https://www.songsterr.com/a/wa/song?id=${songId}`
      : songsterrSearchUrl(query);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-teal-200 hover:bg-teal-50/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-800 dark:hover:bg-teal-950/30"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/40">
        <Guitar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold text-slate-900 dark:text-slate-100">
          {song.title}
        </p>
        <p className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
          {song.artist}
        </p>
      </div>
      <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-400 transition group-hover:text-teal-600 dark:text-slate-500" />
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                         */
/* ------------------------------------------------------------------ */

export default function RoadmapPage() {
  const router = useRouter();
  const { addToast } = useToast();

  /* ---- data ---- */
  const [roadmap, setRoadmap] = useState<RoadmapRow | null>(null);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [adapting, setAdapting] = useState(false);

  /* ---- UI state ---- */
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [ratingTask, setRatingTask] = useState<string | null>(null);
  const [playerSongId, setPlayerSongId] = useState<number | null>(null);
  const [playerTaskId, setPlayerTaskId] = useState<string | null>(null);

  /* ---- load data ---- */
  const fetchData = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: rm } = await supabase
      .from("roadmaps")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (rm) {
      setRoadmap(rm as RoadmapRow);

      const { data: prog } = await supabase
        .from("week_progress")
        .select("task_id, completed, difficulty_rating")
        .eq("user_id", user.id)
        .eq("roadmap_id", rm.id);

      setProgress((prog as ProgressRow[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---- derived ---- */
  const plan = roadmap?.plan_json ?? null;
  const currentWeekNum = roadmap?.current_week ?? 1;

  const currentWeek: RoadmapWeek | null = useMemo(
    () => plan?.weeks.find((w) => w.week_number === currentWeekNum) ?? null,
    [plan, currentWeekNum]
  );

  const completedSet = useMemo(
    () => new Set(progress.filter((p) => p.completed).map((p) => p.task_id)),
    [progress]
  );

  const currentWeekTasks = currentWeek?.daily_tasks ?? [];
  const currentWeekCompleted = currentWeekTasks.filter((t) =>
    completedSet.has(t.id)
  ).length;
  const allCurrentDone =
    currentWeekTasks.length > 0 &&
    currentWeekCompleted === currentWeekTasks.length;

  const tasksByDay = useMemo(() => {
    const map = new Map<string, DailyTask[]>();
    for (const t of currentWeekTasks) {
      const arr = map.get(t.day) ?? [];
      arr.push(t);
      map.set(t.day, arr);
    }
    return map;
  }, [currentWeekTasks]);

  // Auto-expand today
  useEffect(() => {
    if (tasksByDay.has(TODAY_SHORT)) {
      setExpandedDays(new Set([TODAY_SHORT]));
    } else if (tasksByDay.size > 0) {
      setExpandedDays(new Set([tasksByDay.keys().next().value!]));
    }
  }, [tasksByDay]);

  const completedWeeks = useMemo(
    () => plan?.weeks.filter((w) => w.week_number < currentWeekNum) ?? [],
    [plan, currentWeekNum]
  );
  const futureWeeks = useMemo(
    () => plan?.weeks.filter((w) => w.week_number > currentWeekNum) ?? [],
    [plan, currentWeekNum]
  );

  /* ---- actions ---- */
  async function completeTask(taskId: string, rating: DifficultyChoice) {
    if (!roadmap || !currentWeek) return;
    setRatingTask(null);

    // Optimistic update
    setProgress((prev) => [
      ...prev.filter((p) => p.task_id !== taskId),
      { task_id: taskId, completed: true, difficulty_rating: rating },
    ]);

    await fetch("/api/progress/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roadmap_id: roadmap.id,
        week_number: currentWeek.week_number,
        task_id: taskId,
        difficulty_rating: rating,
      }),
    });

    addToast({
      kind: "success",
      title: "Task complete!",
      message: rating === 1 ? "Too easy — noted!" : rating === 5 ? "Tough one — we'll adapt." : "Nice work!",
    });
  }

  async function handleAdapt() {
    if (!roadmap) return;
    setAdapting(true);
    try {
      const res = await fetch("/api/roadmap/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week_number: currentWeekNum }),
      });
      if (res.ok) {
        addToast({
          kind: "success",
          title: "Plan updated",
          message: "Your roadmap has been adapted based on your progress.",
        });
        await fetchData();
      } else {
        const data = await res.json();
        addToast({
          kind: "error",
          title: "Adaptation failed",
          message: data.error || "Try again later.",
        });
      }
    } catch {
      addToast({
        kind: "error",
        title: "Network error",
        message: "Could not reach the server.",
      });
    }
    setAdapting(false);
  }

  async function openSongsterr(title: string, artist: string, taskId: string) {
    const id = await resolveSongId(title, artist);
    if (id) {
      setPlayerSongId(id);
      setPlayerTaskId(taskId);
    } else {
      window.open(
        songsterrSearchUrl(`${title} ${artist}`),
        "_blank",
        "noopener"
      );
    }
  }

  function toggleDay(day: string) {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  }

  function toggleWeek(num: number) {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  }

  /* ---- loading / empty ---- */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!plan || !currentWeek) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/50">
          <MapIcon className="h-8 w-8 text-teal-700 dark:text-teal-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            No roadmap yet
          </h1>
          <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
            Complete the onboarding survey to generate your personalized plan.
          </p>
        </div>
      </div>
    );
  }

  /* ---- render ---- */
  return (
    <div className="space-y-6">
      {/* === CURRENT WEEK BANNER === */}
      <section className="rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-50 to-white p-5 shadow-sm dark:border-teal-800 dark:from-teal-950/40 dark:to-slate-900">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-teal-300 bg-white px-3 py-0.5 text-xs font-extrabold text-teal-800 dark:border-teal-700 dark:bg-teal-950/50 dark:text-teal-200">
                Week {currentWeekNum} of {plan.total_weeks}
              </span>
            </div>
            <h1 className="mt-3 text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
              {currentWeek.theme}
            </h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-400">
              {currentWeek.summary}
            </p>
            {currentWeek.focus_techniques.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {currentWeek.focus_techniques.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <ProgressRing
              completed={currentWeekCompleted}
              total={currentWeekTasks.length}
            />
          </div>
        </div>

        {allCurrentDone && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-extrabold text-emerald-900 dark:text-emerald-200">
                  Week complete!
                </p>
                <p className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Great work. Regenerate your plan to adapt the remaining weeks.
                </p>
              </div>
              <button
                type="button"
                disabled={adapting}
                onClick={handleAdapt}
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl bg-teal-700 px-5 text-sm font-extrabold text-white transition hover:bg-teal-800 disabled:opacity-60"
              >
                {adapting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {adapting ? "Adapting…" : "Finish Week & Adapt Plan"}
              </button>
            </div>
          </div>
        )}
      </section>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* === MAIN COLUMN === */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* -- completed weeks -- */}
          {completedWeeks.length > 0 && (
            <WeekGroup
              title="Completed"
              weeks={completedWeeks}
              expandedWeeks={expandedWeeks}
              toggleWeek={toggleWeek}
              completedSet={completedSet}
              variant="completed"
            />
          )}

          {/* -- current week daily tasks -- */}
          <div className="space-y-2">
            {Array.from(tasksByDay.entries()).map(([day, tasks]) => {
              const isToday = day === TODAY_SHORT;
              const open = expandedDays.has(day);
              const dayDone = tasks.every((t) => completedSet.has(t.id));

              return (
                <div
                  key={day}
                  className={`rounded-3xl border shadow-sm transition ${
                    isToday
                      ? "border-teal-200 bg-white ring-2 ring-teal-100 dark:border-teal-700 dark:bg-slate-900 dark:ring-teal-900/40"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleDay(day)}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      {dayDone ? (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                          <Check className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                        </span>
                      ) : (
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full ${isToday ? "bg-teal-100 dark:bg-teal-900/40" : "bg-slate-100 dark:bg-slate-800"}`}
                        >
                          <span
                            className={`text-xs font-extrabold ${isToday ? "text-teal-700 dark:text-teal-400" : "text-slate-600 dark:text-slate-400"}`}
                          >
                            {day.charAt(0)}
                          </span>
                        </span>
                      )}
                      <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                        {day}
                        {isToday && (
                          <span className="ml-2 text-xs font-bold text-teal-600 dark:text-teal-400">
                            Today
                          </span>
                        )}
                      </span>
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                        {tasks.filter((t) => completedSet.has(t.id)).length}/
                        {tasks.length}
                      </span>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition dark:text-slate-500 ${open ? "rotate-180" : ""}`}
                    />
                  </button>

                  {open && (
                    <div className="space-y-2 px-5 pb-5">
                      {tasks.map((task) => {
                        const done = completedSet.has(task.id);
                        const showRating = ratingTask === task.id;
                        const meta = TYPE_META[task.type] ?? TYPE_META.technique;
                        const Icon = meta.Icon;
                        const showPlayer =
                          playerSongId != null && playerTaskId === task.id;

                        return (
                          <div key={task.id}>
                            <div
                              className={`rounded-2xl border p-4 transition ${
                                done
                                  ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20"
                                  : "border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950/50"
                              }`}
                            >
                              <div className="flex gap-3">
                                {/* checkbox */}
                                <button
                                  type="button"
                                  disabled={done}
                                  onClick={() =>
                                    done ? null : setRatingTask(task.id)
                                  }
                                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                                    done
                                      ? "border-emerald-400 bg-emerald-500 dark:border-emerald-600 dark:bg-emerald-600"
                                      : "border-slate-300 bg-white hover:border-teal-400 dark:border-slate-600 dark:bg-slate-900"
                                  }`}
                                >
                                  {done && (
                                    <Check className="h-3 w-3 text-white" />
                                  )}
                                </button>

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-bold ${meta.color}`}
                                    >
                                      <Icon className="h-3 w-3" />
                                      {meta.label}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                      <Clock className="h-3 w-3" />
                                      {task.minutes}m
                                    </span>
                                  </div>
                                  <p
                                    className={`mt-1.5 text-sm font-extrabold ${done ? "text-slate-500 line-through dark:text-slate-400" : "text-slate-900 dark:text-slate-100"}`}
                                  >
                                    {task.title}
                                  </p>
                                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-400">
                                    {task.description}
                                  </p>

                                  {/* Song: play tab button */}
                                  {task.type === "song" && !done && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const parts = task.title.split(" - ");
                                        const title =
                                          parts.length > 1
                                            ? parts[0].trim()
                                            : task.title;
                                        const artist =
                                          parts.length > 1
                                            ? parts[1].trim()
                                            : "";
                                        openSongsterr(
                                          title,
                                          artist,
                                          task.id
                                        );
                                      }}
                                      className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-extrabold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300 dark:hover:bg-indigo-900/40"
                                    >
                                      <Guitar className="h-3.5 w-3.5" />
                                      Play Tab
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* difficulty rating inline */}
                              {showRating && !done && (
                                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                    Done! How was it?
                                  </p>
                                  <div className="flex gap-1.5">
                                    {(
                                      [
                                        [1, "Too easy"],
                                        [3, "Just right"],
                                        [5, "Too hard"],
                                      ] as const
                                    ).map(([val, label]) => (
                                      <button
                                        key={val}
                                        type="button"
                                        onClick={() =>
                                          completeTask(task.id, val)
                                        }
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-teal-700"
                                      >
                                        {label}
                                      </button>
                                    ))}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setRatingTask(null)}
                                    className="ml-auto text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Songsterr embedded player */}
                            {showPlayer && (
                              <SongsterrPlayer
                                songId={playerSongId!}
                                onClose={() => {
                                  setPlayerSongId(null);
                                  setPlayerTaskId(null);
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* -- future weeks -- */}
          {futureWeeks.length > 0 && (
            <WeekGroup
              title="Upcoming"
              weeks={futureWeeks}
              expandedWeeks={expandedWeeks}
              toggleWeek={toggleWeek}
              completedSet={completedSet}
              variant="locked"
            />
          )}
        </div>

        {/* === RIGHT SIDEBAR (desktop) === */}
        {currentWeek.songs.length > 0 && (
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-20 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  This week&apos;s songs
                </p>
              </div>
              {currentWeek.songs.map((s, i) => (
                <SongCard key={i} song={s} />
              ))}
            </div>
          </aside>
        )}
      </div>

      {/* songs on mobile */}
      {currentWeek.songs.length > 0 && (
        <section className="space-y-3 lg:hidden">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              This week&apos;s songs
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {currentWeek.songs.map((s, i) => (
              <SongCard key={i} song={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Week group (completed / future)                                   */
/* ------------------------------------------------------------------ */

function WeekGroup({
  title,
  weeks,
  expandedWeeks,
  toggleWeek,
  completedSet,
  variant,
}: {
  title: string;
  weeks: RoadmapWeek[];
  expandedWeeks: Set<number>;
  toggleWeek: (n: number) => void;
  completedSet: Set<string>;
  variant: "completed" | "locked";
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {title}
      </p>
      {weeks.map((w) => {
        const open = expandedWeeks.has(w.week_number);
        const done =
          variant === "completed"
            ? w.daily_tasks.every((t) => completedSet.has(t.id))
            : false;

        return (
          <div
            key={w.week_number}
            className={`rounded-2xl border transition ${
              variant === "locked"
                ? "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50"
                : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            }`}
          >
            <button
              type="button"
              onClick={() => toggleWeek(w.week_number)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                {variant === "locked" ? (
                  <Lock className="h-4 w-4 text-slate-400" />
                ) : done ? (
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <span className="h-4 w-4" />
                )}
                <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  Week {w.week_number}
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {w.theme}
                </span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition ${open ? "rotate-180" : ""}`}
              />
            </button>

            {open && (
              <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-800">
                <p className="text-xs font-semibold leading-5 text-slate-600 dark:text-slate-400">
                  {w.summary}
                </p>
                {w.focus_techniques.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {w.focus_techniques.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:border-slate-700 dark:text-slate-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                {variant === "locked" && (
                  <p className="mt-2 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                    Unlocks when you reach this week
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
