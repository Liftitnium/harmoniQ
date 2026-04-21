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
  type: "warmup" | "technique" | "song" | "theory" | "ear";
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

  // Strip ```json ... ``` or ``` ... ```
  const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  // If it doesn't start with { or [, try to find the first {
  if (!cleaned.startsWith("{") && !cleaned.startsWith("[")) {
    const idx = cleaned.indexOf("{");
    if (idx !== -1) cleaned = cleaned.slice(idx);
  }

  // Trim any trailing text after the closing brace
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
 * Minimal runtime validation — ensures the shape is what we expect.
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
