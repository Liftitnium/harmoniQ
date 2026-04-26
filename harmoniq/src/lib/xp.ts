/* ------------------------------------------------------------------ */
/*  XP, Levels, and Badge definitions — shared across server + client */
/* ------------------------------------------------------------------ */

// ---- Level thresholds ------------------------------------------------

export const LEVEL_THRESHOLDS = [
  0,    // Level 1
  100,  // Level 2
  300,  // Level 3
  600,  // Level 4
  1000, // Level 5
  1500, // Level 6
  2100, // Level 7
  2800, // Level 8
  3600, // Level 9
  4500, // Level 10
] as const;

export const MAX_LEVEL = LEVEL_THRESHOLDS.length;

export function levelFromXp(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function xpForLevel(level: number): number {
  return LEVEL_THRESHOLDS[Math.min(level - 1, LEVEL_THRESHOLDS.length - 1)];
}

export function xpForNextLevel(level: number): number | null {
  if (level >= MAX_LEVEL) return null;
  return LEVEL_THRESHOLDS[level]; // level is 1-indexed, so THRESHOLDS[level] is the next one
}

export function xpProgress(xp: number): {
  level: number;
  currentThreshold: number;
  nextThreshold: number | null;
  progressInLevel: number;
  progressFraction: number;
} {
  const level = levelFromXp(xp);
  const currentThreshold = xpForLevel(level);
  const nextThreshold = xpForNextLevel(level);

  if (nextThreshold === null) {
    return { level, currentThreshold, nextThreshold: null, progressInLevel: 0, progressFraction: 1 };
  }

  const range = nextThreshold - currentThreshold;
  const progressInLevel = xp - currentThreshold;
  const progressFraction = range > 0 ? progressInLevel / range : 1;

  return { level, currentThreshold, nextThreshold, progressInLevel, progressFraction };
}

// ---- XP calculation --------------------------------------------------

export const BASE_XP = 10;

export const DIFFICULTY_XP: Record<number, number> = {
  1: 5,  // too easy
  2: 10, // just right
  3: 15, // too hard
};

export const FIRST_TODAY_BONUS = 5;
export const WEEK_COMPLETION_BONUS = 100;

export function streakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 2;
  if (streakDays >= 7) return 1.5;
  return 1;
}

export interface XpBreakdown {
  base_xp: number;
  difficulty_bonus: number;
  first_today_bonus: number;
  streak_multiplier: number;
  week_completion_bonus: number;
  total_xp: number;
}

export function calculateXp(opts: {
  difficultyRating: number;
  streakDays: number;
  isFirstToday: boolean;
  weekCompleted: boolean;
}): XpBreakdown {
  const difficultyBonus = DIFFICULTY_XP[opts.difficultyRating] ?? 10;
  const firstBonus = opts.isFirstToday ? FIRST_TODAY_BONUS : 0;
  const multiplier = streakMultiplier(opts.streakDays);

  const preMultiplier = BASE_XP + difficultyBonus + firstBonus;
  const xpFromTask = Math.round(preMultiplier * multiplier);
  const weekBonus = opts.weekCompleted ? WEEK_COMPLETION_BONUS : 0;

  return {
    base_xp: BASE_XP,
    difficulty_bonus: difficultyBonus,
    first_today_bonus: firstBonus,
    streak_multiplier: multiplier,
    week_completion_bonus: weekBonus,
    total_xp: xpFromTask + weekBonus,
  };
}

// ---- Streak logic ----------------------------------------------------

export function computeStreak(opts: {
  lastPracticeDate: string | null; // ISO date string "YYYY-MM-DD"
  currentStreakDays: number;
  freezeCount: number;
  today: string; // "YYYY-MM-DD"
}): { newStreak: number; newFreezeCount: number; isFirstToday: boolean } {
  const { lastPracticeDate, currentStreakDays, freezeCount, today } = opts;

  if (!lastPracticeDate) {
    return { newStreak: 1, newFreezeCount: freezeCount, isFirstToday: true };
  }

  if (lastPracticeDate === today) {
    return { newStreak: currentStreakDays, newFreezeCount: freezeCount, isFirstToday: false };
  }

  const last = new Date(lastPracticeDate + "T00:00:00");
  const now = new Date(today + "T00:00:00");
  const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return { newStreak: currentStreakDays + 1, newFreezeCount: freezeCount, isFirstToday: true };
  }

  if (diffDays === 2 && freezeCount > 0) {
    return {
      newStreak: currentStreakDays + 1,
      newFreezeCount: freezeCount - 1,
      isFirstToday: true,
    };
  }

  // Streak broken
  return { newStreak: 1, newFreezeCount: freezeCount, isFirstToday: true };
}

// ---- Badges ----------------------------------------------------------

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

export const BADGES: BadgeDef[] = [
  { id: "first_step",      name: "First Step",      description: "Complete your first task",           emoji: "👣" },
  { id: "week_one_done",   name: "Week One Done",   description: "Finish all tasks in week 1",        emoji: "🏁" },
  { id: "streak_3",        name: "Streak Starter",  description: "3-day practice streak",             emoji: "🔥" },
  { id: "streak_7",        name: "On Fire",         description: "7-day practice streak",             emoji: "🔥" },
  { id: "streak_30",       name: "Unstoppable",     description: "30-day practice streak",            emoji: "⚡" },
  { id: "xp_100",          name: "Century",         description: "Earn 100 total XP",                 emoji: "💯" },
  { id: "xp_500",          name: "Half K",          description: "Earn 500 total XP",                 emoji: "🌟" },
  { id: "xp_1000",         name: "Grand",           description: "Earn 1,000 total XP",               emoji: "👑" },
  { id: "songs_10",        name: "Song Bird",       description: "Complete 10 song tasks",            emoji: "🐦" },
  { id: "theory_10",       name: "Theory Buff",     description: "Complete 10 theory tasks",          emoji: "📖" },
  { id: "ear_10",          name: "Ear Worm",        description: "Complete 10 ear training tasks",    emoji: "👂" },
  { id: "roadmap_master",  name: "Roadmap Master",  description: "Complete an entire roadmap",        emoji: "🗺️" },
];

export const BADGE_MAP = new Map(BADGES.map((b) => [b.id, b]));

export interface BadgeCheckContext {
  totalTasksCompleted: number;
  totalXp: number;
  streakDays: number;
  taskType: string;
  songTasksCompleted: number;
  theoryTasksCompleted: number;
  earTasksCompleted: number;
  weekFullyCompleted: boolean;
  weekNumber: number;
  roadmapFullyCompleted: boolean;
  existingBadgeIds: Set<string>;
}

export function checkBadges(ctx: BadgeCheckContext): string[] {
  const newBadges: string[] = [];
  const has = (id: string) => ctx.existingBadgeIds.has(id);

  if (!has("first_step") && ctx.totalTasksCompleted >= 1)           newBadges.push("first_step");
  if (!has("week_one_done") && ctx.weekFullyCompleted && ctx.weekNumber === 1) newBadges.push("week_one_done");
  if (!has("streak_3") && ctx.streakDays >= 3)                      newBadges.push("streak_3");
  if (!has("streak_7") && ctx.streakDays >= 7)                      newBadges.push("streak_7");
  if (!has("streak_30") && ctx.streakDays >= 30)                    newBadges.push("streak_30");
  if (!has("xp_100") && ctx.totalXp >= 100)                        newBadges.push("xp_100");
  if (!has("xp_500") && ctx.totalXp >= 500)                        newBadges.push("xp_500");
  if (!has("xp_1000") && ctx.totalXp >= 1000)                      newBadges.push("xp_1000");
  if (!has("songs_10") && ctx.songTasksCompleted >= 10)             newBadges.push("songs_10");
  if (!has("theory_10") && ctx.theoryTasksCompleted >= 10)          newBadges.push("theory_10");
  if (!has("ear_10") && ctx.earTasksCompleted >= 10)                newBadges.push("ear_10");
  if (!has("roadmap_master") && ctx.roadmapFullyCompleted)          newBadges.push("roadmap_master");

  return newBadges;
}
