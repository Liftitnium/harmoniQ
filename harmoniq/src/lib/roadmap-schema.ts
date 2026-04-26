/* ------------------------------------------------------------------ */
/*  Roadmap JSON types — shared between generate / adapt / frontend   */
/* ------------------------------------------------------------------ */

export interface RoadmapSong {
  title: string;
  artist: string;
  why: string;
}

export interface DailyTask {
  id: string;
  day: string;
  minutes: number;
  type: "warmup" | "technique" | "song" | "theory" | "ear_training";
  title: string;
  description: string;
}

export interface RoadmapWeek {
  week_number: number;
  theme: string;
  summary: string;
  focus_techniques: string[];
  songs: RoadmapSong[];
  daily_tasks: DailyTask[];
}

export interface RoadmapPlan {
  total_weeks: number;
  weeks: RoadmapWeek[];
}

/**
 * Extract valid JSON from an LLM response that might contain markdown
 * fences, leading prose, or trailing commentary.
 */
export function extractJson(raw: string): string {
  let cleaned = raw.trim();

  const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  if (!cleaned.startsWith("{") && !cleaned.startsWith("[")) {
    const idx = cleaned.indexOf("{");
    if (idx !== -1) cleaned = cleaned.slice(idx);
  }

  let depth = 0;
  let end = -1;
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === "{") depth++;
    else if (cleaned[i] === "}") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end !== -1) cleaned = cleaned.slice(0, end + 1);

  return cleaned;
}

/**
 * Strict validation — shape must be correct for the plan to be usable.
 */
export function validatePlan(data: unknown): data is RoadmapPlan {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  if (typeof obj.total_weeks !== "number") return false;
  if (!Array.isArray(obj.weeks) || obj.weeks.length === 0) return false;
  const first = obj.weeks[0] as Record<string, unknown>;
  if (typeof first.week_number !== "number") return false;
  if (typeof first.theme !== "string") return false;
  if (!Array.isArray(first.daily_tasks)) return false;
  return true;
}

/**
 * Lenient deep validation — logs issues but returns true for partial plans
 * so the user gets *something* rather than a hard failure.
 */
export function validatePlanLenient(data: unknown): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  if (!data || typeof data !== "object") {
    return { valid: false, warnings: ["Response is not an object"] };
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.total_weeks !== "number") {
    warnings.push("Missing total_weeks");
  }

  if (!Array.isArray(obj.weeks) || obj.weeks.length === 0) {
    return { valid: false, warnings: [...warnings, "No weeks array"] };
  }

  for (const week of obj.weeks as Record<string, unknown>[]) {
    if (typeof week.week_number !== "number") {
      warnings.push(`Week missing week_number`);
    }
    if (!Array.isArray(week.daily_tasks)) {
      warnings.push(`Week ${week.week_number ?? "?"} missing daily_tasks`);
      continue;
    }
    for (const task of week.daily_tasks as Record<string, unknown>[]) {
      if (!task.id) warnings.push(`Task missing id in week ${week.week_number}`);
      if (!task.day) warnings.push(`Task ${task.id} missing day`);
      if (!task.type) warnings.push(`Task ${task.id} missing type`);
      if (!task.title) warnings.push(`Task ${task.id} missing title`);
    }
  }

  return { valid: true, warnings };
}
