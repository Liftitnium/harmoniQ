const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const LONG_TO_SHORT: Record<string, string> = {
  sunday: "Sun",
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
};

/**
 * Normalize any day representation ("Monday", "Mon", "monday") to the
 * 3-letter abbreviation used in roadmap task data: "Mon", "Tue", etc.
 */
export function normalizeDay(day: string): string {
  const trimmed = day.trim();
  const lower = trimmed.toLowerCase();

  if (LONG_TO_SHORT[lower]) return LONG_TO_SHORT[lower];

  const short = lower.slice(0, 3);
  const match = SHORT_DAYS.find((d) => d.toLowerCase() === short);
  return match ?? trimmed;
}

/** 0-indexed (Sun=0 … Sat=6) day index for a short day name. */
export function dayIndex(day: string): number {
  const normalized = normalizeDay(day);
  const idx = SHORT_DAYS.indexOf(normalized as (typeof SHORT_DAYS)[number]);
  return idx === -1 ? -1 : idx;
}

/** Get today's 3-letter day from the client clock. */
export function getTodayShort(): string {
  return SHORT_DAYS[new Date().getDay()];
}

/** Get today's YYYY-MM-DD in the client's local timezone. */
export function getLocalDateStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Time-aware greeting string. */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * Given the set of practice day names in the current week's tasks,
 * find the next practice day after today (wrapping around the week).
 * Returns the 3-letter day name or null if none found.
 */
export function getNextPracticeDay(
  practiceDays: string[],
  todayShort: string,
): string | null {
  const todayIdx = dayIndex(todayShort);
  if (todayIdx === -1) return null;

  const indices = practiceDays
    .map((d) => dayIndex(normalizeDay(d)))
    .filter((i) => i !== -1)
    .sort((a, b) => a - b);

  if (indices.length === 0) return null;

  const next = indices.find((i) => i > todayIdx);
  const idx = next ?? indices[0];
  return SHORT_DAYS[idx];
}

const FULL_DAY_NAMES: Record<string, string> = {
  Sun: "Sunday",
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
};

/** "Mon" → "Monday" */
export function fullDayName(shortDay: string): string {
  return FULL_DAY_NAMES[normalizeDay(shortDay)] ?? shortDay;
}

/** Human-readable relative time. */
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Returns true if `dayShort` falls before today in the calendar week.
 * Sun=0 … Sat=6.
 */
export function isDayPast(dayShort: string, todayShort: string): boolean {
  return dayIndex(dayShort) < dayIndex(todayShort);
}

export function isDayFuture(dayShort: string, todayShort: string): boolean {
  return dayIndex(dayShort) > dayIndex(todayShort);
}
