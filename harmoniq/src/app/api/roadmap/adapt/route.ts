import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGemini, GEMINI_MODEL, GENERATION_CONFIG } from "@/lib/gemini/client";
import {
  extractJson,
  validatePlanLenient,
  type RoadmapPlan,
} from "@/lib/roadmap-schema";
import { validateServerEnv } from "@/lib/env";

export const maxDuration = 30;

export async function POST(request: Request) {
  validateServerEnv();

  /* ---- auth ---- */
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  /* ---- parse body ---- */
  let roadmapId: string | undefined;
  let completedWeek: number;
  try {
    const body = await request.json();
    roadmapId = body.roadmap_id;
    completedWeek = body.completed_week ?? body.week_number;
    if (typeof completedWeek !== "number" || completedWeek < 1) {
      return NextResponse.json(
        { error: "completed_week must be a positive integer" },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  /* ---- fetch current roadmap ---- */
  let query = supabase.from("roadmaps").select("*").eq("user_id", user.id);

  if (roadmapId) {
    query = query.eq("id", roadmapId);
  } else {
    query = query.order("created_at", { ascending: false }).limit(1);
  }

  const { data: roadmap, error: rmErr } = await query.single();

  if (rmErr || !roadmap) {
    return NextResponse.json({ error: "No roadmap found" }, { status: 404 });
  }

  const plan = roadmap.plan_json as RoadmapPlan;

  /* ---- fetch progress for the completed week ---- */
  const { data: progress } = await supabase
    .from("week_progress")
    .select("task_id, completed, difficulty_rating, notes")
    .eq("user_id", user.id)
    .eq("roadmap_id", roadmap.id)
    .eq("week_number", completedWeek);

  const totalTasks = progress?.length ?? 0;
  const completedTasks = progress?.filter((p) => p.completed).length ?? 0;

  const avgDifficulty =
    totalTasks > 0
      ? (
          progress!.reduce((sum, p) => sum + (p.difficulty_rating ?? 2), 0) /
          totalTasks
        ).toFixed(1)
      : "N/A";

  const tooHardTasks = (progress ?? []).filter(
    (p) => (p.difficulty_rating ?? 2) === 3,
  );
  const tooEasyTasks = (progress ?? []).filter(
    (p) => (p.difficulty_rating ?? 2) === 1,
  );

  // Determine which task types were skipped (present in plan but not completed)
  const completedWeekPlan = plan.weeks.find(
    (w) => w.week_number === completedWeek,
  );
  const completedIds = new Set(
    (progress ?? []).filter((p) => p.completed).map((p) => p.task_id),
  );
  const skippedTypes = [
    ...new Set(
      (completedWeekPlan?.daily_tasks ?? [])
        .filter((t) => !completedIds.has(t.id))
        .map((t) => t.type),
    ),
  ];

  /* ---- fetch journal entries for context (if the table exists) ---- */
  let journalNotes = "";
  try {
    const { data: journals } = await supabase
      .from("journal_entries")
      .select("content")
      .eq("user_id", user.id)
      .eq("week_number", completedWeek);

    if (journals && journals.length > 0) {
      journalNotes = journals.map((j) => j.content).join("; ");
    }
  } catch {
    // journal_entries table may not exist yet — that's fine
  }

  /* ---- fetch survey for context ---- */
  const { data: survey } = await supabase
    .from("survey_responses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  /* ---- build prompt ---- */
  const completedWeeks = plan.weeks.filter(
    (w) => w.week_number <= completedWeek,
  );
  const remainingWeeks = plan.weeks.filter(
    (w) => w.week_number > completedWeek,
  );

  const prompt = buildAdaptPrompt({
    plan,
    completedWeek,
    completedTasks,
    totalTasks,
    avgDifficulty,
    tooHardTasks,
    tooEasyTasks,
    skippedTypes,
    journalNotes,
    remainingWeeks,
    survey,
  });

  /* ---- call Gemini (with one retry on parse failure) ---- */
  try {
    const gemini = getGemini();
    const model = gemini.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: GENERATION_CONFIG,
    });

    let parsed: Record<string, unknown> | null = null;

    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini timeout")), 25000),
      ),
    ]);
    const raw = result.response.text();

    try {
      const json = extractJson(raw);
      parsed = JSON.parse(json);
    } catch (parseErr) {
      console.warn("[roadmap/adapt] First parse failed, retrying…", parseErr);
    }

    if (!parsed) {
      const retry = await Promise.race([
        model.generateContent(
          "Your previous response was not valid JSON. Please respond with ONLY the JSON object, no other text.",
        ),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Gemini timeout")), 25000),
        ),
      ]);
      const retryRaw = retry.response.text();

      try {
        const retryJson = extractJson(retryRaw);
        parsed = JSON.parse(retryJson);
      } catch (retryErr) {
        console.error("[roadmap/adapt] Retry parse also failed", retryErr);
        return NextResponse.json(
          { error: "Failed to adapt the roadmap. Please try again." },
          { status: 500 },
        );
      }
    }

    const { valid, warnings } = validatePlanLenient(parsed);
    if (warnings.length > 0) {
      console.warn("[roadmap/adapt] Validation warnings:", warnings);
    }
    if (!valid) {
      return NextResponse.json(
        { error: "Gemini returned an unusable plan shape" },
        { status: 502 },
      );
    }

    // Merge: keep completed weeks as-is, replace future weeks with adapted ones
    const adaptedPlan = parsed as unknown as RoadmapPlan;
    const newFutureWeeks = adaptedPlan.weeks.filter(
      (w) => w.week_number > completedWeek,
    );

    const mergedWeeks = [...completedWeeks, ...newFutureWeeks];

    const updatedPlan: RoadmapPlan = {
      total_weeks: plan.total_weeks,
      weeks: mergedWeeks,
    };

    /* ---- persist ---- */
    const { error: updateErr } = await supabase
      .from("roadmaps")
      .update({
        current_week: completedWeek + 1,
        total_weeks: updatedPlan.total_weeks,
        plan_json: updatedPlan,
        updated_at: new Date().toISOString(),
      })
      .eq("id", roadmap.id);

    if (updateErr) {
      console.error("[roadmap/adapt] DB update failed:", updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      roadmap: {
        ...roadmap,
        plan_json: updatedPlan,
        current_week: completedWeek + 1,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[roadmap/adapt] Unexpected error:", message);
    return NextResponse.json({
      roadmap,
      adaptation_failed: true,
      error: message === "Gemini timeout"
        ? "The AI took too long to respond. Your existing plan is unchanged."
        : "Adaptation failed. Your existing plan is unchanged.",
    });
  }
}

/* ------------------------------------------------------------------ */
/*  Prompt builder                                                    */
/* ------------------------------------------------------------------ */

interface AdaptInput {
  plan: RoadmapPlan;
  completedWeek: number;
  completedTasks: number;
  totalTasks: number;
  avgDifficulty: string;
  tooHardTasks: Array<{ task_id: string }>;
  tooEasyTasks: Array<{ task_id: string }>;
  skippedTypes: string[];
  journalNotes: string;
  remainingWeeks: RoadmapPlan["weeks"];
  survey: Record<string, unknown> | null;
}

function buildAdaptPrompt(input: AdaptInput): string {
  const {
    plan,
    completedWeek,
    completedTasks,
    totalTasks,
    avgDifficulty,
    tooHardTasks,
    tooEasyTasks,
    skippedTypes,
    journalNotes,
    remainingWeeks,
    survey,
  } = input;

  const surveyBlock = survey
    ? `
STUDENT PROFILE:
- Level: ${survey.level}
- Genres: ${(survey.genres as string[]).join(", ")}
- Goals: ${(survey.goals as string[]).join(", ")}
- Weekly minutes: ${survey.weekly_minutes}
- Practice days: ${(survey.practice_days as string[]).join(", ")}
- Weak spots: ${(survey.weak_spots as string[]).join(", ")}`
    : "";

  return `You previously created a guitar practice roadmap. The student just finished week ${completedWeek}. Here's how it went:

ORIGINAL PLAN (remaining weeks): ${JSON.stringify(remainingWeeks)}

WEEK ${completedWeek} RESULTS:
- Tasks completed: ${completedTasks}/${totalTasks}
- Average difficulty rating: ${avgDifficulty} (1=too easy, 2=just right, 3=too hard)
- Tasks rated "too hard": ${tooHardTasks.length > 0 ? tooHardTasks.map((t) => t.task_id).join(", ") : "none"}
- Tasks rated "too easy": ${tooEasyTasks.length > 0 ? tooEasyTasks.map((t) => t.task_id).join(", ") : "none"}
- Skipped task types: ${skippedTypes.length > 0 ? skippedTypes.join(", ") : "none"}
- Student's journal notes: ${journalNotes || "None"}
${surveyBlock}

Based on this feedback, revise the REMAINING weeks (${completedWeek + 1} through ${plan.total_weeks}). Rules:
1. If things were too hard, slow down: add more foundational work, simpler songs, more practice time on basics.
2. If things were too easy, accelerate: introduce harder techniques, more complex songs, less warmup.
3. If they skipped a task type (e.g. always skipped theory), reduce but don't eliminate it — try making it more engaging.
4. Keep the total week count at ${plan.total_weeks} (don't add or remove weeks).
5. Only output weeks ${completedWeek + 1} through ${plan.total_weeks} — completed weeks are kept as-is.
6. Distribute tasks across the student's practice days, fitting within their weekly minutes.
7. Keep using the same id format: "w{week}-d{day_index}-t{task_index}".
8. Include REAL songs that exist on guitar tab sites.

Respond with ONLY valid JSON — no markdown fences, no commentary:
{
  "total_weeks": ${plan.total_weeks},
  "weeks": [
    {
      "week_number": ${completedWeek + 1},
      "theme": "short title",
      "summary": "1-2 sentence explanation",
      "focus_techniques": ["technique1"],
      "songs": [{ "title": "Song Name", "artist": "Artist Name", "why": "reason" }],
      "daily_tasks": [
        {
          "id": "w${completedWeek + 1}-d1-t1",
          "day": "Mon",
          "minutes": 20,
          "type": "warmup|technique|song|theory|ear_training",
          "title": "Short title",
          "description": "Clear instruction"
        }
      ]
    }
  ]
}`;
}
