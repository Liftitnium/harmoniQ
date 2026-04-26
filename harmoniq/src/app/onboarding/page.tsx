"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Guitar,
  Loader2,
  Rocket,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

const GENRES = [
  "Rock",
  "Blues",
  "Metal",
  "Fingerstyle",
  "Acoustic / Singer-Songwriter",
  "Jazz",
  "Classical",
  "Funk",
  "Country",
  "Indie",
] as const;

const GOALS = [
  "Learn specific songs",
  "Improvise",
  "Write music",
  "Play live",
  "Pass an exam / grade",
  "Just have fun",
] as const;

const WEEKLY_MINUTES = [
  { value: 60, label: "1 hr" },
  { value: 120, label: "2 hrs" },
  { value: 180, label: "3 hrs" },
  { value: 300, label: "5 hrs" },
  { value: 500, label: "5+ hrs" },
] as const;

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const TECHNIQUE_GROUPS: { category: string; items: string[] }[] = [
  { category: "Chords", items: ["Open chords", "Barre chords", "Power chords"] },
  { category: "Picking", items: ["Alternate picking", "Economy picking", "Sweep picking", "Hybrid picking"] },
  { category: "Lead", items: ["Bends", "Vibrato", "Legato", "Tapping"] },
  { category: "Rhythm", items: ["Strumming patterns", "Palm muting", "Syncopation"] },
];

const WEAK_SPOTS = [
  "Timing / rhythm",
  "Theory",
  "Speed",
  "Ear training",
  "Memorization",
  "Fretboard knowledge",
  "Improvisation",
] as const;

const STEP_META = [
  { title: "Your Level", desc: "How experienced are you with guitar?" },
  { title: "Genres", desc: "What styles of music do you want to play?" },
  { title: "Your Goals", desc: "What do you want to achieve?" },
  { title: "Practice Schedule", desc: "How much time can you dedicate?" },
  { title: "Techniques", desc: "What techniques do you already know?" },
  { title: "Inspiration", desc: "Who inspires your playing?" },
  { title: "Areas to Improve", desc: "Where do you want to get better?" },
];

const TOTAL_STEPS = STEP_META.length;

/* ------------------------------------------------------------------ */
/*  Shared primitives                                                 */
/* ------------------------------------------------------------------ */

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-extrabold transition ${
        selected
          ? "border-teal-300 bg-teal-50 text-teal-900 dark:border-teal-700 dark:bg-teal-950/50 dark:text-teal-100"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600"
      }`}
    >
      {selected && <Check className="h-3.5 w-3.5 text-teal-700 dark:text-teal-400" />}
      {label}
    </button>
  );
}

function toggle(arr: string[], item: string) {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function OnboardingPage() {
  const router = useRouter();

  /* step navigation */
  const [step, setStep] = useState(0);

  /* form state */
  const [level, setLevel] = useState("");
  const [yearsPlaying, setYearsPlaying] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [weeklyMinutes, setWeeklyMinutes] = useState<number | null>(null);
  const [practiceDays, setPracticeDays] = useState<string[]>([]);
  const [knownTechniques, setKnownTechniques] = useState<string[]>([]);
  const [favoriteArtists, setFavoriteArtists] = useState("");
  const [weakSpots, setWeakSpots] = useState<string[]>([]);

  /* submission */
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canProceed = useCallback(() => {
    switch (step) {
      case 0:
        return level !== "";
      case 1:
        return genres.length > 0;
      case 2:
        return goals.length > 0;
      case 3:
        return weeklyMinutes !== null && practiceDays.length > 0;
      case 4:
        return true;
      case 5:
        return true;
      case 6:
        return weakSpots.length > 0;
      default:
        return false;
    }
  }, [step, level, genres, goals, weeklyMinutes, practiceDays, weakSpots]);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("You must be signed in to complete onboarding.");
        setSubmitting(false);
        return;
      }

      const artistsArray = favoriteArtists
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      const payload = {
        user_id: user.id,
        level,
        years_playing: yearsPlaying ? parseInt(yearsPlaying, 10) : 0,
        genres,
        goals,
        weekly_minutes: weeklyMinutes,
        practice_days: practiceDays,
        known_techniques: knownTechniques,
        favorite_artists: artistsArray,
        weak_spots: weakSpots,
        raw_json: {
          level,
          yearsPlaying: yearsPlaying ? parseInt(yearsPlaying, 10) : 0,
          genres,
          goals,
          weeklyMinutes,
          practiceDays,
          knownTechniques,
          favoriteArtists: artistsArray,
          weakSpots,
        },
      };

      const { error: insertErr } = await supabase
        .from("survey_responses")
        .insert(payload);

      if (insertErr) {
        setError(insertErr.message);
        setSubmitting(false);
        return;
      }

      const res = await fetch("/api/roadmap/generate", {
        method: "POST",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || `Roadmap generation failed (${res.status})`);
        setSubmitting(false);
        return;
      }

      await supabase
        .from("profiles")
        .update({ onboarded: true })
        .eq("id", user.id);

      router.push("/roadmap");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  const isLast = step === TOTAL_STEPS - 1;
  const pct = ((step + 1) / TOTAL_STEPS) * 100;
  const meta = STEP_META[step];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      {/* ---- top bar ---- */}
      <div className="mx-auto w-full max-w-2xl px-4 pt-6 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/50">
            <Guitar className="h-4 w-4 text-teal-700 dark:text-teal-400" />
          </div>
          <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
            Harmoni<span className="text-teal-700 dark:text-teal-400">Q</span>
          </p>
          <div className="flex-1" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {step + 1} / {TOTAL_STEPS}
          </span>
        </div>

        {/* progress bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-2 rounded-full bg-teal-600 transition-[width] duration-300 dark:bg-teal-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* ---- content ---- */}
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
        <div key={step} className="animate-page-in space-y-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              {meta.title}
            </h1>
            <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
              {meta.desc}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                {error}
              </p>
            </div>
          )}

          {/* ============ STEP 0 — Level ============ */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Skill level
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {LEVELS.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLevel(l)}
                      className={`relative rounded-2xl border p-4 text-left transition ${
                        level === l
                          ? "border-teal-300 bg-teal-50 dark:border-teal-700 dark:bg-teal-950/50"
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600"
                      }`}
                    >
                      {level === l && (
                        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600">
                          <Check className="h-3 w-3 text-white" />
                        </span>
                      )}
                      <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                        {l}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {l === "Beginner"
                          ? "Just getting started"
                          : l === "Intermediate"
                            ? "Comfortable with basics"
                            : "Looking to master"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    Years playing guitar
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={yearsPlaying}
                    onChange={(e) => setYearsPlaying(e.target.value)}
                    placeholder="e.g. 2"
                    className="mt-3 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:ring-2 focus:ring-teal-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-700"
                  />
                </label>
              </div>
            </div>
          )}

          {/* ============ STEP 1 — Genres ============ */}
          {step === 1 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Select all that interest you
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <Chip
                    key={g}
                    label={g}
                    selected={genres.includes(g)}
                    onClick={() => setGenres(toggle(genres, g))}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ============ STEP 2 — Goals ============ */}
          {step === 2 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Select all that apply
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {GOALS.map((g) => (
                  <Chip
                    key={g}
                    label={g}
                    selected={goals.includes(g)}
                    onClick={() => setGoals(toggle(goals, g))}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ============ STEP 3 — Time ============ */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Weekly practice time
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {WEEKLY_MINUTES.map((wm) => (
                    <button
                      key={wm.value}
                      type="button"
                      onClick={() => setWeeklyMinutes(wm.value)}
                      className={`rounded-2xl border px-5 py-3 text-sm font-extrabold transition ${
                        weeklyMinutes === wm.value
                          ? "border-teal-300 bg-teal-50 text-teal-900 dark:border-teal-700 dark:bg-teal-950/50 dark:text-teal-100"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      {wm.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Practice days
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {DAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setPracticeDays(toggle(practiceDays, d))}
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-xs font-extrabold transition sm:h-12 sm:w-12 sm:text-sm ${
                        practiceDays.includes(d)
                          ? "border-teal-300 bg-teal-50 text-teal-900 dark:border-teal-700 dark:bg-teal-950/50 dark:text-teal-100"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============ STEP 4 — Techniques ============ */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Check what you can already do (skip if unsure)
              </p>
              {TECHNIQUE_GROUPS.map((group) => (
                <div
                  key={group.category}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    {group.category}
                  </p>
                  <div className="mt-3 space-y-2">
                    {group.items.map((t) => {
                      const checked = knownTechniques.includes(t);
                      return (
                        <label
                          key={t}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-2.5 transition ${
                            checked
                              ? "border-teal-200 bg-teal-50/60 dark:border-teal-800 dark:bg-teal-950/30"
                              : "border-slate-100 bg-white hover:border-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                              checked
                                ? "border-teal-600 bg-teal-600"
                                : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900"
                            }`}
                          >
                            {checked && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </span>
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={checked}
                            onChange={() =>
                              setKnownTechniques(toggle(knownTechniques, t))
                            }
                          />
                          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {t}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ============ STEP 5 — Artists ============ */}
          {step === 5 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Separate with commas (optional)
              </p>
              <textarea
                value={favoriteArtists}
                onChange={(e) => setFavoriteArtists(e.target.value)}
                rows={4}
                placeholder="e.g. John Mayer, Metallica, Tommy Emmanuel"
                className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:ring-2 focus:ring-teal-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-700"
              />
            </div>
          )}

          {/* ============ STEP 6 — Weak spots ============ */}
          {step === 6 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Select all that apply
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {WEAK_SPOTS.map((w) => (
                  <Chip
                    key={w}
                    label={w}
                    selected={weakSpots.includes(w)}
                    onClick={() => setWeakSpots(toggle(weakSpots, w))}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---- bottom nav ---- */}
      <div className="sticky bottom-0 border-t border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {isLast ? (
            <button
              type="button"
              disabled={!canProceed() || submitting}
              onClick={handleSubmit}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-teal-700 px-6 text-sm font-extrabold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Rocket className="h-4 w-4" />
              )}
              {submitting ? "Building your plan…" : "Generate My Roadmap"}
            </button>
          ) : (
            <button
              type="button"
              disabled={!canProceed()}
              onClick={() => setStep((s) => s + 1)}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-teal-700 px-6 text-sm font-extrabold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
