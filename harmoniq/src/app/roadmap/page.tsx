"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  PartyPopper,
  RefreshCw,
  Sparkles,
  Star,
  Timer,
  X,
  Zap,
} from "lucide-react";
import {
  searchSongByTitleAndArtist,
  getSongsterrEmbedUrl,
  getSongsterrSearchUrl,
} from "@/lib/songsterr";
import { SongsterrSearch } from "@/components/harmoniq/roadmap/SongsterrSearch";
import { PracticeTimer } from "@/components/harmoniq/PracticeTimer";
import { useToast } from "@/components/harmoniq/toast/ToastProvider";
import { BADGE_MAP } from "@/lib/xp";
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

type DifficultyChoice = 1 | 2 | 3;

const DIFFICULTY_META: Record<DifficultyChoice, { label: string; emoji: string }> = {
  1: { label: "Too easy", emoji: "😎" },
  2: { label: "Just right", emoji: "👍" },
  3: { label: "Too hard", emoji: "😤" },
};

/* ------------------------------------------------------------------ */
/*  Date helpers                                                      */
/* ------------------------------------------------------------------ */

import {
  getTodayShort,
  getLocalDateStr,
  normalizeDay,
  isDayPast,
  isDayFuture,
} from "@/lib/date-utils";

const TYPE_META: Record<
  DailyTask["type"],
  { Icon: typeof Zap; label: string; emoji: string; color: string }
> = {
  warmup: {
    Icon: Flame,
    label: "Warm-up",
    emoji: "🎸",
    color:
      "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
  },
  technique: {
    Icon: Zap,
    label: "Technique",
    emoji: "🎯",
    color:
      "text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800",
  },
  song: {
    Icon: Music,
    label: "Song",
    emoji: "🎵",
    color:
      "text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800",
  },
  theory: {
    Icon: BookOpen,
    label: "Theory",
    emoji: "📖",
    color:
      "text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800",
  },
  ear_training: {
    Icon: Ear,
    label: "Ear training",
    emoji: "👂",
    color:
      "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800",
  },
};

/* ------------------------------------------------------------------ */
/*  Helper components                                                 */
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

function XpFlash({ show, xp, streakMultiplier }: { show: boolean; xp?: number; streakMultiplier?: number }) {
  if (!show) return null;
  return (
    <div className="pointer-events-none absolute -right-2 -top-3 flex flex-col items-end gap-0.5">
      <span className="animate-bounce rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-amber-950 shadow-lg">
        +{xp ?? 10} XP
      </span>
      {(streakMultiplier ?? 1) > 1 && (
        <span className="animate-pulse rounded-full bg-orange-500 px-1.5 py-0.5 text-[9px] font-black text-white shadow">
          🔥 {streakMultiplier}x streak
        </span>
      )}
    </div>
  );
}

function DifficultyBadge({ rating }: { rating: number }) {
  const meta = DIFFICULTY_META[rating as DifficultyChoice];
  if (!meta) return null;
  return (
    <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
      {meta.emoji} {meta.label}
    </span>
  );
}

function SongCard({
  song,
  onPlay,
}: {
  song: RoadmapSong;
  onPlay?: () => void;
}) {
  const [href, setHref] = useState(() =>
    getSongsterrSearchUrl(`${song.title} ${song.artist}`),
  );

  useEffect(() => {
    searchSongByTitleAndArtist(song.title, song.artist).then((result) => {
      if (result) setHref(getSongsterrEmbedUrl(result.id));
    });
  }, [song.title, song.artist]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 transition dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3">
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
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 text-slate-400 transition hover:text-teal-600 dark:text-slate-500"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      {song.why && (
        <p className="mt-2 text-[11px] font-semibold leading-4 text-slate-500 dark:text-slate-400">
          {song.why}
        </p>
      )}
      {onPlay && (
        <button
          type="button"
          onClick={onPlay}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-extrabold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300 dark:hover:bg-indigo-900/40"
        >
          <Music className="h-3.5 w-3.5" />
          Play Tab
        </button>
      )}
    </div>
  );
}

function ConfirmModal({
  open,
  loading,
  weekNum,
  isFinalWeek,
  incompleteTasks,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  loading: boolean;
  weekNum: number;
  isFinalWeek: boolean;
  incompleteTasks: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
            <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
              Your AI coach is adjusting your plan…
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              This takes a few seconds
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 dark:bg-teal-950/40">
                <RefreshCw className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <h2 className="mt-4 text-lg font-black text-slate-900 dark:text-slate-100">
              {isFinalWeek
                ? "Complete your roadmap?"
                : `Ready to move to Week ${weekNum + 1}?`}
            </h2>
            {incompleteTasks > 0 && (
              <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                You have {incompleteTasks} incomplete task{incompleteTasks === 1 ? "" : "s"}. Complete week anyway?
              </p>
            )}
            <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
              {isFinalWeek
                ? "You've finished every week! We'll wrap up your roadmap."
                : "We'll update your plan based on how this week went. Your completed tasks are saved."}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 rounded-2xl bg-teal-700 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-teal-800"
              >
                {isFinalWeek ? "Finish Roadmap" : "Adapt & Continue"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CelebrationBanner({ onNewRoadmap }: { onNewRoadmap: () => void }) {
  return (
    <section className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-teal-50 p-8 text-center shadow-sm dark:border-amber-800 dark:from-amber-950/30 dark:via-slate-900 dark:to-teal-950/30">
      <PartyPopper className="mx-auto h-12 w-12 text-amber-500" />
      <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
        You completed your roadmap! 🎉
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm font-semibold text-slate-600 dark:text-slate-400">
        Amazing work. You&apos;ve made it through every week of your personalized plan.
        Ready for the next challenge?
      </p>
      <button
        type="button"
        onClick={onNewRoadmap}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-teal-700 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-teal-800"
      >
        <Sparkles className="h-4 w-4" />
        Generate a New Roadmap
      </button>
    </section>
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
  const [showConfirm, setShowConfirm] = useState(false);
  const [completed, setCompleted] = useState(false);

  /* ---- UI state ---- */
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [ratingTask, setRatingTask] = useState<string | null>(null);
  const [playerTaskId, setPlayerTaskId] = useState<string | null>(null);
  const [xpFlashId, setXpFlashId] = useState<string | null>(null);
  const [timerTask, setTimerTask] = useState<DailyTask | null>(null);
  const [timerCompletedMinutes, setTimerCompletedMinutes] = useState<number | null>(null);
  const [levelUpModal, setLevelUpModal] = useState<number | null>(null);
  const [lastXpResult, setLastXpResult] = useState<{ xp: number; multiplier: number } | null>(null);

  const todayShort = useMemo(() => getTodayShort(), []);

  /* ---- refs for scrolling ---- */
  const taskRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  /* ---- load data via API ---- */
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/roadmap/current");
      if (res.status === 404) {
        router.replace("/onboarding");
        return;
      }
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const { roadmap: rm } = await res.json();
      setRoadmap(rm as RoadmapRow);

      const progRes = await fetch(
        `/api/progress/list?roadmap_id=${rm.id}`,
      ).catch(() => null);

      if (progRes?.ok) {
        const { progress: prog } = await progRes.json();
        setProgress((prog as ProgressRow[]) ?? []);
      } else {
        // Fallback: fetch via supabase client
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: prog } = await supabase
            .from("week_progress")
            .select("task_id, completed, difficulty_rating")
            .eq("user_id", user.id)
            .eq("roadmap_id", rm.id);
          setProgress((prog as ProgressRow[]) ?? []);
        }
      }
    } catch {
      // network error
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---- derived ---- */
  const plan = roadmap?.plan_json ?? null;
  const currentWeekNum = roadmap?.current_week ?? 1;
  const totalWeeks = plan?.total_weeks ?? 0;
  const isFinalWeek = currentWeekNum === totalWeeks;
  const roadmapFinished = currentWeekNum > totalWeeks && totalWeeks > 0;

  const currentWeek: RoadmapWeek | null = useMemo(
    () => plan?.weeks.find((w) => w.week_number === currentWeekNum) ?? null,
    [plan, currentWeekNum],
  );

  const completedSet = useMemo(
    () => new Set(progress.filter((p) => p.completed).map((p) => p.task_id)),
    [progress],
  );

  const ratingMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of progress) {
      if (p.completed && p.difficulty_rating != null) {
        m.set(p.task_id, p.difficulty_rating);
      }
    }
    return m;
  }, [progress]);

  const currentWeekTasks = currentWeek?.daily_tasks ?? [];
  const currentWeekCompleted = currentWeekTasks.filter((t) =>
    completedSet.has(t.id),
  ).length;
  const anyCurrentDone = currentWeekCompleted > 0;
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

  useEffect(() => {
    if (tasksByDay.has(todayShort)) {
      setExpandedDays(new Set([todayShort]));
    } else {
      const matchByNormalized = [...tasksByDay.keys()].find(
        (d) => normalizeDay(d) === todayShort,
      );
      if (matchByNormalized) {
        setExpandedDays(new Set([matchByNormalized]));
      } else if (tasksByDay.size > 0) {
        setExpandedDays(new Set([tasksByDay.keys().next().value!]));
      }
    }
  }, [tasksByDay, todayShort]);

  const completedWeeks = useMemo(
    () => plan?.weeks.filter((w) => w.week_number < currentWeekNum) ?? [],
    [plan, currentWeekNum],
  );
  const futureWeeks = useMemo(
    () => plan?.weeks.filter((w) => w.week_number > currentWeekNum) ?? [],
    [plan, currentWeekNum],
  );

  /* ---- actions ---- */
  async function completeTask(taskId: string, rating: DifficultyChoice, overrideMinutes?: number) {
    if (!roadmap || !currentWeek) return;
    setRatingTask(null);
    setTimerCompletedMinutes(null);

    const task = currentWeekTasks.find((t) => t.id === taskId);

    // Optimistic UI
    setProgress((prev) => [
      ...prev.filter((p) => p.task_id !== taskId),
      { task_id: taskId, completed: true, difficulty_rating: rating },
    ]);

    setXpFlashId(taskId);

    try {
      const res = await fetch("/api/progress/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roadmap_id: roadmap.id,
          week_number: currentWeek.week_number,
          task_id: taskId,
          difficulty_rating: rating,
          practice_minutes: overrideMinutes ?? task?.minutes ?? 0,
          client_date: getLocalDateStr(),
        }),
      });

      const data = await res.json();

      if (data.xp) {
        setLastXpResult({ xp: data.xp.total_xp, multiplier: data.xp.streak_multiplier });
      }

      setTimeout(() => {
        setXpFlashId(null);
        setLastXpResult(null);
      }, 2000);

      // Level up
      if (data.leveled_up) {
        setTimeout(() => setLevelUpModal(data.new_level), 500);
      }

      // Badge unlocks
      if (data.badges_unlocked?.length > 0) {
        for (const badge of data.badges_unlocked) {
          addToast({
            kind: "success",
            title: `Badge unlocked: ${badge.name}!`,
            message: `${badge.emoji} ${badge.description}`,
          });
        }
      }

      const label = DIFFICULTY_META[rating];
      const xpStr = data.xp ? `+${data.xp.total_xp}` : "+10";
      addToast({
        kind: "success",
        title: `Task complete! ${xpStr} XP`,
        message: `${label.emoji} ${label.label}${data.xp?.streak_multiplier > 1 ? ` · 🔥 ${data.xp.streak_multiplier}x streak bonus` : ""}`,
      });
    } catch {
      setProgress((prev) => prev.filter((p) => p.task_id !== taskId));
      setXpFlashId(null);
      addToast({ kind: "error", title: "Failed", message: "Could not save progress." });
    }
  }

  async function handleAdapt() {
    if (!roadmap || adapting) return;
    setAdapting(true);

    try {
      const res = await fetch("/api/roadmap/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roadmap_id: roadmap.id,
          completed_week: currentWeekNum,
        }),
      });

      const data = await res.json();

      if (!res.ok && !data.roadmap) {
        addToast({
          kind: "error",
          title: "Adaptation failed",
          message: data.error || "Try again later.",
        });
        setAdapting(false);
        return;
      }

      const updatedRoadmap = data.roadmap as RoadmapRow | undefined;
      const newCurrentWeek = updatedRoadmap?.current_week ?? currentWeekNum + 1;
      const totalWeeks = roadmap.total_weeks;

      if (data.adaptation_failed) {
        addToast({
          kind: "warning",
          title: "Plan kept as-is",
          message: "We couldn't update your plan this time, but you can keep going.",
        });
      }

      if (newCurrentWeek > totalWeeks) {
        setCompleted(true);
        setShowConfirm(false);
      } else {
        if (!data.adaptation_failed) {
          addToast({
            kind: "success",
            title: "Plan updated",
            message: `Week ${newCurrentWeek} is ready. Let's go!`,
          });
        }
        setShowConfirm(false);
        await fetchData();
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

  function togglePlayer(taskId: string) {
    setPlayerTaskId((prev) => (prev === taskId ? null : taskId));
  }

  function scrollToTask(taskId: string) {
    const el = taskRefs.current.get(taskId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-indigo-300", "dark:ring-indigo-700");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-indigo-300", "dark:ring-indigo-700");
      }, 2000);
    }
  }

  function handleSongPlay(song: RoadmapSong) {
    if (!currentWeek) return;
    const matchingTask = currentWeekTasks.find(
      (t) =>
        t.type === "song" &&
        (t.title.toLowerCase().includes(song.title.toLowerCase()) ||
          t.description.toLowerCase().includes(song.title.toLowerCase())),
    );
    if (matchingTask) {
      const day = matchingTask.day;
      setExpandedDays((prev) => new Set([...prev, day]));
      setPlayerTaskId(matchingTask.id);
      setTimeout(() => scrollToTask(matchingTask.id), 150);
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

  /* ---- loading ---- */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      </div>
    );
  }

  /* ---- celebration (completed entire roadmap) ---- */
  if (completed || roadmapFinished) {
    return (
      <CelebrationBanner onNewRoadmap={() => router.push("/onboarding")} />
    );
  }

  /* ---- no roadmap → redirect handled in fetchData, but show fallback just in case ---- */
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
          <button
            type="button"
            onClick={() => router.push("/onboarding")}
            className="mt-5 rounded-2xl bg-teal-700 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-teal-800"
          >
            Start Onboarding
          </button>
        </div>
      </div>
    );
  }

  /* ---- render ---- */
  return (
    <div className="space-y-6">
      {/* Confirm modal */}
      <ConfirmModal
        open={showConfirm}
        loading={adapting}
        weekNum={currentWeekNum}
        isFinalWeek={isFinalWeek}
        incompleteTasks={currentWeekTasks.length - currentWeekCompleted}
        onConfirm={handleAdapt}
        onCancel={() => setShowConfirm(false)}
      />

      {/* Practice timer overlay */}
      {timerTask && !timerCompletedMinutes && (
        <PracticeTimer
          taskTitle={timerTask.title}
          taskDescription={timerTask.description}
          durationMinutes={timerTask.minutes}
          onComplete={(actualMinutes) => {
            setTimerCompletedMinutes(actualMinutes);
            setRatingTask(timerTask.id);
          }}
          onCancel={() => setTimerTask(null)}
        />
      )}

      {/* Post-timer rating overlay */}
      {timerTask && timerCompletedMinutes != null && ratingTask === timerTask.id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-900 p-6 text-center shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-teal-400">
              Session complete
            </p>
            <p className="mt-3 text-lg font-black text-white">
              {timerTask.title}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-400">
              {timerCompletedMinutes} {timerCompletedMinutes === 1 ? "minute" : "minutes"} practiced
            </p>
            <p className="mt-5 text-xs font-bold text-slate-300">
              How was it?
            </p>
            <div className="mt-3 flex justify-center gap-2">
              {([1, 2, 3] as const).map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    completeTask(timerTask.id, val, timerCompletedMinutes);
                    setTimerTask(null);
                  }}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-extrabold text-slate-200 transition hover:border-teal-600 hover:bg-teal-900/30 hover:text-teal-400"
                >
                  {DIFFICULTY_META[val].emoji} {DIFFICULTY_META[val].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Level up modal */}
      {levelUpModal != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-900 p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30">
              <span className="text-3xl font-black text-white">{levelUpModal}</span>
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-widest text-amber-400">
              Level up!
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              You&apos;re now Level {levelUpModal}! 🎉
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-400">
              Keep practicing to reach Level {Math.min(levelUpModal + 1, 10)}
            </p>
            <button
              type="button"
              onClick={() => setLevelUpModal(null)}
              className="mt-6 rounded-2xl bg-amber-500 px-6 py-2.5 text-sm font-extrabold text-amber-950 transition hover:bg-amber-400"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}

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

        {/* Week completion CTA */}
        {allCurrentDone ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-extrabold text-emerald-900 dark:text-emerald-200">
                  Week complete! 🎉
                </p>
                <p className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {isFinalWeek
                    ? "This was the final week — finish your roadmap to celebrate!"
                    : "Great work. Advance to the next week and let your AI coach adapt the plan."}
                </p>
              </div>
              <button
                type="button"
                disabled={adapting}
                onClick={() => setShowConfirm(true)}
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl bg-teal-700 px-5 text-sm font-extrabold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {adapting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isFinalWeek
                  ? "Finish Roadmap"
                  : "Complete Week & Update Plan"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {currentWeekCompleted}/{currentWeekTasks.length} tasks done this week
            </p>
            <div className="group relative">
              <button
                type="button"
                disabled={!anyCurrentDone || adapting}
                onClick={() => setShowConfirm(true)}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-extrabold text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-teal-700"
              >
                {adapting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                Complete Week
              </button>
              {!anyCurrentDone && !adapting && (
                <span className="absolute -top-9 right-0 hidden whitespace-nowrap rounded-lg bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg group-hover:block dark:bg-slate-700">
                  Complete at least one task first
                </span>
              )}
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
              ratingMap={ratingMap}
              variant="completed"
            />
          )}

          {/* -- current week daily tasks -- */}
          <div className="space-y-2">
            {Array.from(tasksByDay.entries()).map(([day, tasks]) => {
              const normalizedDay = normalizeDay(day);
              const isToday = normalizedDay === todayShort;
              const isPast = isDayPast(normalizedDay, todayShort);
              const isFuture = isDayFuture(normalizedDay, todayShort);
              const open = expandedDays.has(day);
              const dayDone = tasks.every((t) => completedSet.has(t.id));
              const dayCompleted = tasks.filter((t) => completedSet.has(t.id)).length;
              const dayMinutes = tasks.reduce((s, t) => s + t.minutes, 0);
              const dayMissed = isPast && !dayDone;

              return (
                <div
                  key={day}
                  className={`rounded-3xl border shadow-sm transition ${
                    isToday
                      ? "border-teal-200 bg-white ring-2 ring-teal-100 dark:border-teal-700 dark:bg-slate-900 dark:ring-teal-900/40"
                      : dayMissed
                        ? "border-amber-200 bg-amber-50/30 dark:border-amber-800/50 dark:bg-amber-950/10"
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
                          className={`flex h-7 w-7 items-center justify-center rounded-full ${
                            isToday
                              ? "bg-teal-100 dark:bg-teal-900/40"
                              : dayMissed
                                ? "bg-amber-100 dark:bg-amber-900/30"
                                : "bg-slate-100 dark:bg-slate-800"
                          }`}
                        >
                          <span
                            className={`text-xs font-extrabold ${
                              isToday
                                ? "text-teal-700 dark:text-teal-400"
                                : dayMissed
                                  ? "text-amber-700 dark:text-amber-400"
                                  : "text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {day.charAt(0)}
                          </span>
                        </span>
                      )}
                      <div className="flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                          {day}
                          {isToday && (
                            <span className="ml-2 text-xs font-bold text-teal-600 dark:text-teal-400">
                              Today
                            </span>
                          )}
                          {dayMissed && (
                            <span className="ml-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                              Missed
                            </span>
                          )}
                          {isFuture && !dayDone && (
                            <span className="ml-2 text-xs font-bold text-slate-400 dark:text-slate-500">
                              Upcoming
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                          {tasks.length} {tasks.length === 1 ? "task" : "tasks"} · {dayMinutes} min · {dayCompleted}/{tasks.length} done
                        </span>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-400 transition dark:text-slate-500 ${open ? "rotate-180" : ""}`}
                    />
                  </button>

                  {open && (
                    <div className="space-y-2 px-5 pb-5">
                      {tasks.map((task) => {
                        const done = completedSet.has(task.id);
                        const showRating = ratingTask === task.id;
                        const meta = TYPE_META[task.type] ?? TYPE_META.technique;
                        const Icon = meta.Icon;
                        const showPlayer = playerTaskId === task.id;
                        const existingRating = ratingMap.get(task.id);

                        return (
                          <div
                            key={task.id}
                            ref={(el) => {
                              if (el) taskRefs.current.set(task.id, el);
                            }}
                            className="transition-all duration-300"
                          >
                            <div
                              className={`relative rounded-2xl border p-4 transition ${
                                done
                                  ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20"
                                  : "border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950/50"
                              }`}
                            >
                              <XpFlash
                                show={xpFlashId === task.id}
                                xp={lastXpResult?.xp}
                                streakMultiplier={lastXpResult?.multiplier}
                              />

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
                                      {task.minutes} min
                                    </span>
                                    {done && existingRating != null && (
                                      <DifficultyBadge rating={existingRating} />
                                    )}
                                  </div>
                                  <p
                                    className={`mt-1.5 text-sm font-extrabold ${done ? "text-slate-500 line-through dark:text-slate-400" : "text-slate-900 dark:text-slate-100"}`}
                                  >
                                    {task.title}
                                  </p>
                                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-400">
                                    {task.description}
                                  </p>

                                  {/* Action buttons */}
                                  {!done && (
                                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                      {task.type === "song" && (
                                        <button
                                          type="button"
                                          onClick={() => togglePlayer(task.id)}
                                          className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-extrabold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300 dark:hover:bg-indigo-900/40"
                                        >
                                          <Guitar className="h-3.5 w-3.5" />
                                          {showPlayer ? "Hide Tab" : "Play Tab ▶"}
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => setTimerTask(task)}
                                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-extrabold text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-teal-700 dark:hover:text-teal-400"
                                      >
                                        <Timer className="h-3.5 w-3.5" />
                                        Start timer
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* difficulty rating inline */}
                              {showRating && !done && (
                                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                    Nice work! How was it?
                                  </p>
                                  <div className="flex gap-1.5">
                                    {(
                                      [1, 2, 3] as const
                                    ).map((val) => (
                                      <button
                                        key={val}
                                        type="button"
                                        onClick={() =>
                                          completeTask(task.id, val)
                                        }
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-teal-700"
                                      >
                                        {DIFFICULTY_META[val].emoji}{" "}
                                        {DIFFICULTY_META[val].label}
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
                            {showPlayer &&
                              (() => {
                                const weekSong = currentWeek.songs.find(
                                  (s) =>
                                    task.title.toLowerCase().includes(s.title.toLowerCase()) ||
                                    task.description.toLowerCase().includes(s.title.toLowerCase()),
                                );
                                const songTitle = weekSong?.title ?? task.title;
                                const songArtist = weekSong?.artist ?? "";
                                return (
                                  <SongsterrSearch
                                    title={songTitle}
                                    artist={songArtist}
                                    onClose={() => setPlayerTaskId(null)}
                                  />
                                );
                              })()}
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
              ratingMap={ratingMap}
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
                <SongCard
                  key={i}
                  song={s}
                  onPlay={() => handleSongPlay(s)}
                />
              ))}

              {/* Week overview */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Week overview
                  </p>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Tasks</span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">
                      {currentWeekCompleted}/{currentWeekTasks.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Total minutes</span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">
                      {currentWeekTasks.reduce((s, t) => s + t.minutes, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Practice days</span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">
                      {tasksByDay.size}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Songs on mobile */}
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
              <SongCard
                key={i}
                song={s}
                onPlay={() => handleSongPlay(s)}
              />
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
  ratingMap,
  variant,
}: {
  title: string;
  weeks: RoadmapWeek[];
  expandedWeeks: Set<number>;
  toggleWeek: (n: number) => void;
  completedSet: Set<string>;
  ratingMap: Map<string, number>;
  variant: "completed" | "locked";
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {title}
      </p>
      {weeks.map((w) => {
        const open = expandedWeeks.has(w.week_number);
        const totalTasks = w.daily_tasks.length;
        const doneTasks = w.daily_tasks.filter((t) => completedSet.has(t.id)).length;

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
                ) : doneTasks === totalTasks && totalTasks > 0 ? (
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <span className="h-4 w-4" />
                )}
                <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  Week {w.week_number}: {w.theme}
                </span>
                {variant === "completed" && (
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                    {doneTasks}/{totalTasks} tasks
                  </span>
                )}
              </div>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`}
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

                {variant === "completed" && (
                  <div className="mt-3 space-y-1.5">
                    {w.daily_tasks.map((task) => {
                      const done = completedSet.has(task.id);
                      const rating = ratingMap.get(task.id);
                      const meta = TYPE_META[task.type] ?? TYPE_META.technique;

                      return (
                        <div
                          key={task.id}
                          className="flex items-center gap-2 rounded-lg px-2 py-1"
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded ${
                              done
                                ? "bg-emerald-500 dark:bg-emerald-600"
                                : "border border-slate-300 dark:border-slate-600"
                            }`}
                          >
                            {done && <Check className="h-2.5 w-2.5 text-white" />}
                          </span>
                          <span
                            className={`flex-1 truncate text-xs font-semibold ${done ? "text-slate-500 line-through dark:text-slate-400" : "text-slate-700 dark:text-slate-300"}`}
                          >
                            {task.title}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {meta.emoji}
                          </span>
                          {rating != null && (
                            <span className="text-[10px]">
                              {DIFFICULTY_META[rating as DifficultyChoice]?.emoji}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {variant === "locked" && (
                  <div className="mt-3 space-y-1.5">
                    {w.daily_tasks.slice(0, 5).map((task) => {
                      const meta = TYPE_META[task.type] ?? TYPE_META.technique;
                      return (
                        <div
                          key={task.id}
                          className="flex items-center gap-2 rounded-lg px-2 py-1 opacity-60"
                        >
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-300 dark:border-slate-600" />
                          <span className="flex-1 truncate text-xs font-semibold text-slate-600 dark:text-slate-400">
                            {task.title}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {meta.emoji} {task.minutes}m
                          </span>
                        </div>
                      );
                    })}
                    {w.daily_tasks.length > 5 && (
                      <p className="px-2 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                        + {w.daily_tasks.length - 5} more tasks
                      </p>
                    )}
                    <p className="mt-1 px-2 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                      Unlocks when you reach this week
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
