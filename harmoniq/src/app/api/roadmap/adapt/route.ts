import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGemini, GEMINI_MODEL } from "@/lib/gemini/client";
import {
  extractJson,
  validatePlan,
  type RoadmapPlan,
} from "@/lib/roadmap-schema";

export async function POST(request: Request) {
  /* ---- auth ---- */
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  /* ---- parse body ---- */
  let weekNumber: number;
  try {
    const body = await request.json();
    weekNumber = body.week_number;
    if (typeof weekNumber !== "number" || weekNumber < 1) {
      return NextResponse.json(
        { error: "week_number must be a positive integer" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  /* ---- fetch current roadmap ---- */
  const { data: roadmap, error: rmErr } = await supabase
    .from("roadmaps")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (rmErr || !roadmap) {
    return NextResponse.json(
      { error: "No roadmap found" },
      { status: 404 }
    );
  }

  const plan = roadmap.plan_json as RoadmapPlan;

  /* ---- fetch progress for the completed week ---- */
  const { data: progress } = await supabase
    .from("week_progress")
    .select("task_id, completed, difficulty_rating, notes")
    .eq("user_id", user.id)
    .eq("roadmap_id", roadmap.id)
    .eq("week_number", weekNumber);

  const totalTasks = progress?.length ?? 0;
  const completedTasks = progress?.filter((p) => p.completed).length ?? 0;
  const avgDifficulty =
    progress && progress.length > 0
      ? (
          progress.reduce(
            (sum, p) => sum + (p.difficulty_rating ?? 3),
            0
          ) / progress.length
        ).toFixed(1)
      : "N/A";

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
    (w) => w.week_number <= weekNumber
  );
  const futureWeeks = plan.weeks.filter((w) => w.week_number > weekNumber);

  const prompt = buildAdaptPrompt({
    plan,
    weekNumber,
    completedTasks,
    totalTasks,
    avgDifficulty,
    progressDetails: progress ?? [],
    completedWeeks,
    futureWeeks,
    survey,
  });

  /* ---- call Gemini ---- */
  try {
    const gemini = getGemini();
    const model = gemini.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const json = extractJson(raw);
    const parsed = JSON.parse(json);

    if (!validatePlan(parsed)) {
      return NextResponse.json(
        { error: "Gemini returned an invalid plan shape" },
        { status: 502 }
      );
    }

    // Merge: keep completed weeks as-is, replace future weeks
    const mergedWeeks = [
      ...completedWeeks,
      ...parsed.weeks.filter(
        (w: { week_number: number }) => w.week_number > weekNumber
      ),
    ];

    const updatedPlan: RoadmapPlan = {
      total_weeks: parsed.total_weeks,
      weeks: mergedWeeks,
    };

    /* ---- persist ---- */
    const { error: updateErr } = await supabase
      .from("roadmaps")
      .update({
        current_week: weekNumber + 1,
        total_weeks: updatedPlan.total_weeks,
        plan_json: updatedPlan,
        updated_at: new Date().toISOString(),
      })
      .eq("id", roadmap.id);

    if (updateErr) {
      return NextResponse.json(
        { error: updateErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ roadmap: { ...roadmap, plan_json: updatedPlan, current_week: weekNumber + 1 } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gemini call failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

/* ------------------------------------------------------------------ */
/*  Prompt builder                                                    */
/* ------------------------------------------------------------------ */

interface AdaptInput {
  plan: RoadmapPlan;
  weekNumber: number;
  completedTasks: number;
  totalTasks: number;
  avgDifficulty: string;
  progressDetails: Array<{
    task_id: string;
    completed: boolean;
    difficulty_rating: number | null;
    notes: string | null;
  }>;
  completedWeeks: RoadmapPlan["weeks"];
  futureWeeks: RoadmapPlan["weeks"];
  survey: Record<string, unknown> | null;
}

function buildAdaptPrompt(input: AdaptInput): string {
  const {
    plan,
    weekNumber,
    completedTasks,
    totalTasks,
    avgDifficulty,
    progressDetails,
    futureWeeks,
    survey,
  } = input;

  const skippedTasks = progressDetails
    .filter((p) => !p.completed)
    .map((p) => p.task_id);

  const hardTasks = progressDetails
    .filter((p) => (p.difficulty_rating ?? 3) >= 4)
    .map((p) => p.task_id);

  return `You are HarmoniQ, an expert guitar coach AI. The student just finished week ${weekNumber} of their ${plan.total_weeks}-week roadmap. Adapt the REMAINING weeks based on how they did.

COMPLETION DATA FOR WEEK ${weekNumber}:
- Tasks completed: ${completedTasks} / ${totalTasks}
- Average difficulty rating (1-5): ${avgDifficulty}
- Tasks the student skipped: ${skippedTasks.length > 0 ? skippedTasks.join(", ") : "none"}
- Tasks rated hard (4-5): ${hardTasks.length > 0 ? hardTasks.join(", ") : "none"}

${survey ? `STUDENT PROFILE:
- Level: ${survey.level}
- Genres: ${(survey.genres as string[]).join(", ")}
- Goals: ${(survey.goals as string[]).join(", ")}
- Weekly minutes: ${survey.weekly_minutes}
- Practice days: ${(survey.practice_days as string[]).join(", ")}
- Weak spots: ${(survey.weak_spots as string[]).join(", ")}` : ""}

CURRENT REMAINING PLAN (weeks ${weekNumber + 1}–${plan.total_weeks}):
${JSON.stringify(futureWeeks, null, 2)}

ADAPTATION RULES:
1. If the student completed most tasks and found them easy (avg difficulty < 3), increase complexity in the next weeks.
2. If they skipped many tasks or found them hard (avg difficulty > 3.5), slow down — add more review, reduce new material.
3. If specific tasks were skipped, reintroduce that material in the next week.
4. Keep the total week count at ${plan.total_weeks} (don't add or remove weeks).
5. Only output weeks ${weekNumber + 1} through ${plan.total_weeks} — completed weeks are kept as-is.
6. Distribute tasks across the student's practice days, fitting within their weekly minutes.
7. Keep using the same id format: "w{week}-d{day_index}-t{task_index}".

Return ONLY valid JSON matching this exact schema — no markdown fences, no commentary:
{
  "total_weeks": ${plan.total_weeks},
  "weeks": [
    {
      "week_number": ${weekNumber + 1},
      "theme": "short title",
      "summary": "1-2 sentence explanation",
      "focus_techniques": ["technique1"],
      "songs": [{ "title": "Song Name", "artist": "Artist Name", "why": "reason" }],
      "daily_tasks": [
        {
          "id": "w${weekNumber + 1}-d1-t1",
          "day": "Mon",
          "minutes": 20,
          "type": "warmup",
          "title": "Short title",
          "description": "Clear instruction"
        }
      ]
    }
  ]
}`;
}
