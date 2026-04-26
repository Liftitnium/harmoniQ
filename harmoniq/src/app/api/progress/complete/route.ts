import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  calculateXp,
  computeStreak,
  levelFromXp,
  checkBadges,
  BADGE_MAP,
  type BadgeCheckContext,
} from "@/lib/xp";
import type { RoadmapPlan } from "@/lib/roadmap-schema";

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    roadmap_id: string;
    week_number: number;
    task_id: string;
    difficulty_rating: number;
    practice_minutes?: number;
  };

  try {
    body = await request.json();
    if (
      !body.roadmap_id ||
      !body.task_id ||
      typeof body.week_number !== "number" ||
      typeof body.difficulty_rating !== "number"
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  /* ---- upsert task completion ---- */
  const { data: progressRow, error: upsertErr } = await supabase
    .from("week_progress")
    .upsert(
      {
        user_id: user.id,
        roadmap_id: body.roadmap_id,
        week_number: body.week_number,
        task_id: body.task_id,
        completed: true,
        difficulty_rating: body.difficulty_rating,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,roadmap_id,task_id" },
    )
    .select()
    .single();

  if (upsertErr) {
    console.error("[progress/complete] Upsert failed:", upsertErr);
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  /* ---- load profile ---- */
  const { data: profile } = await supabase
    .from("profiles")
    .select("xp, streak_days, last_practice_date, current_level, max_streak, freeze_count, total_tasks_completed")
    .eq("id", user.id)
    .single();

  const currentXp = profile?.xp ?? 0;
  const currentStreak = profile?.streak_days ?? 0;
  const lastPracticeDate = profile?.last_practice_date ?? null;
  const currentLevel = profile?.current_level ?? 1;
  const maxStreak = profile?.max_streak ?? 0;
  const freezeCount = profile?.freeze_count ?? 0;
  const totalTasksBefore = profile?.total_tasks_completed ?? 0;

  /* ---- streak calculation ---- */
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  const { newStreak, newFreezeCount, isFirstToday } = computeStreak({
    lastPracticeDate,
    currentStreakDays: currentStreak,
    freezeCount,
    today,
  });

  // Award a freeze for every 7-day streak milestone reached
  const oldMilestones = Math.floor(currentStreak / 7);
  const newMilestones = Math.floor(newStreak / 7);
  const freezesEarned = Math.max(0, newMilestones - oldMilestones);
  const finalFreezeCount = newFreezeCount + freezesEarned;

  /* ---- check if this week is now fully completed ---- */
  const { data: weekProgress } = await supabase
    .from("week_progress")
    .select("task_id, completed")
    .eq("user_id", user.id)
    .eq("roadmap_id", body.roadmap_id)
    .eq("week_number", body.week_number);

  const { data: roadmap } = await supabase
    .from("roadmaps")
    .select("plan_json, total_weeks, current_week")
    .eq("id", body.roadmap_id)
    .single();

  const plan = roadmap?.plan_json as RoadmapPlan | null;
  const weekPlan = plan?.weeks.find((w) => w.week_number === body.week_number);
  const weekTaskIds = new Set(weekPlan?.daily_tasks.map((t) => t.id) ?? []);
  const completedTaskIds = new Set(
    (weekProgress ?? []).filter((p) => p.completed).map((p) => p.task_id),
  );
  const weekFullyCompleted =
    weekTaskIds.size > 0 && [...weekTaskIds].every((id) => completedTaskIds.has(id));

  // Check if entire roadmap is fully completed
  const { count: totalRoadmapTasks } = await supabase
    .from("week_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("roadmap_id", body.roadmap_id)
    .eq("completed", true);

  const allRoadmapTaskIds = plan?.weeks.flatMap((w) => w.daily_tasks.map((t) => t.id)) ?? [];
  const roadmapFullyCompleted =
    allRoadmapTaskIds.length > 0 && (totalRoadmapTasks ?? 0) >= allRoadmapTaskIds.length;

  /* ---- XP calculation ---- */
  const xpResult = calculateXp({
    difficultyRating: body.difficulty_rating,
    streakDays: newStreak,
    isFirstToday,
    weekCompleted: weekFullyCompleted,
  });

  const newTotalXp = currentXp + xpResult.total_xp;
  const newLevel = levelFromXp(newTotalXp);
  const leveledUp = newLevel > currentLevel;
  const newMaxStreak = Math.max(maxStreak, newStreak);
  const newTotalTasks = totalTasksBefore + 1;

  /* ---- badge checks ---- */
  // Count tasks by type for this user across all roadmaps
  const taskType = weekPlan?.daily_tasks.find((t) => t.id === body.task_id)?.type ?? "technique";

  const { count: songCount } = await supabase
    .from("week_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("completed", true)
    .in("task_id", plan?.weeks.flatMap((w) => w.daily_tasks.filter((t) => t.type === "song").map((t) => t.id)) ?? [""]);

  const { count: theoryCount } = await supabase
    .from("week_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("completed", true)
    .in("task_id", plan?.weeks.flatMap((w) => w.daily_tasks.filter((t) => t.type === "theory").map((t) => t.id)) ?? [""]);

  const { count: earCount } = await supabase
    .from("week_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("completed", true)
    .in("task_id", plan?.weeks.flatMap((w) => w.daily_tasks.filter((t) => t.type === "ear_training").map((t) => t.id)) ?? [""]);

  const { data: existingBadges } = await supabase
    .from("badge_unlocks")
    .select("badge_id")
    .eq("user_id", user.id);

  const existingBadgeIds = new Set((existingBadges ?? []).map((b) => b.badge_id));

  const badgeCtx: BadgeCheckContext = {
    totalTasksCompleted: newTotalTasks,
    totalXp: newTotalXp,
    streakDays: newStreak,
    taskType,
    songTasksCompleted: songCount ?? 0,
    theoryTasksCompleted: theoryCount ?? 0,
    earTasksCompleted: earCount ?? 0,
    weekFullyCompleted,
    weekNumber: body.week_number,
    roadmapFullyCompleted,
    existingBadgeIds,
  };

  const newBadgeIds = checkBadges(badgeCtx);

  // Insert new badges
  if (newBadgeIds.length > 0) {
    await supabase.from("badge_unlocks").insert(
      newBadgeIds.map((badgeId) => ({
        user_id: user.id,
        badge_id: badgeId,
      })),
    );
  }

  const unlockedBadges = newBadgeIds
    .map((id) => BADGE_MAP.get(id))
    .filter(Boolean);

  /* ---- persist profile ---- */
  const { error: profileErr } = await supabase
    .from("profiles")
    .update({
      xp: newTotalXp,
      streak_days: newStreak,
      last_practice_date: today,
      current_level: newLevel,
      max_streak: newMaxStreak,
      freeze_count: finalFreezeCount,
      total_tasks_completed: newTotalTasks,
    })
    .eq("id", user.id);

  if (profileErr) {
    console.warn("[progress/complete] Profile update failed:", profileErr);
  }

  return NextResponse.json({
    success: true,
    xp: xpResult,
    new_total_xp: newTotalXp,
    new_streak: newStreak,
    new_level: newLevel,
    leveled_up: leveledUp,
    badges_unlocked: unlockedBadges,
    week_completed: weekFullyCompleted,
    progress: progressRow,
  });
}
