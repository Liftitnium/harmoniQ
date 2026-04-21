import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGemini, GEMINI_MODEL } from "@/lib/gemini/client";
import { extractJson, validatePlan } from "@/lib/roadmap-schema";

export async function POST() {
  /* ---- auth ---- */
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  /* ---- fetch latest survey ---- */
  const { data: survey, error: surveyErr } = await supabase
    .from("survey_responses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (surveyErr || !survey) {
    return NextResponse.json(
      { error: "No survey found — complete onboarding first" },
      { status: 400 }
    );
  }

  /* ---- build prompt ---- */
  const prompt = buildGeneratePrompt(survey);

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

    /* ---- persist ---- */
    const { data: roadmap, error: insertErr } = await supabase
      .from("roadmaps")
      .insert({
        user_id: user.id,
        current_week: 1,
        total_weeks: parsed.total_weeks,
        plan_json: parsed,
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ roadmap });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gemini call failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

/* ------------------------------------------------------------------ */
/*  Prompt builder                                                    */
/* ------------------------------------------------------------------ */

function buildGeneratePrompt(survey: Record<string, unknown>): string {
  return `You are HarmoniQ, an expert guitar coach AI. Based on the student profile below, generate a personalized practice roadmap.

STUDENT PROFILE:
- Level: ${survey.level}
- Years playing: ${survey.years_playing}
- Genres they want to play: ${(survey.genres as string[]).join(", ")}
- Goals: ${(survey.goals as string[]).join(", ")}
- Weekly practice time: ${survey.weekly_minutes} minutes
- Practice days: ${(survey.practice_days as string[]).join(", ")}
- Techniques they already know: ${(survey.known_techniques as string[]).length > 0 ? (survey.known_techniques as string[]).join(", ") : "none specified"}
- Favorite artists / songs: ${(survey.favorite_artists as string[]).length > 0 ? (survey.favorite_artists as string[]).join(", ") : "none specified"}
- Weak spots they want to improve: ${(survey.weak_spots as string[]).join(", ")}

INSTRUCTIONS:
1. Create a ${pickWeekCount(survey)}-week roadmap.
2. Pick realistic songs the student would actually enjoy based on their favorite artists and genres. Include actual song titles and artist names.
3. Progress from their known techniques into adjacent new ones — don't jump to advanced skills they aren't ready for.
4. Spend more practice time on their weak spots.
5. Distribute daily_tasks across ONLY their practice days (${(survey.practice_days as string[]).join(", ")}), fitting within ${survey.weekly_minutes} minutes per week total.
6. Each daily task should be 10-30 minutes. Use types: warmup, technique, song, theory, ear.
7. Let song-based vs technique-based weighting be decided by their goals.
8. Give each task a unique id in the format "w{week}-d{day_index}-t{task_index}" (e.g. "w1-d1-t1").
9. Each week should have a clear theme that builds on the previous week.

Return ONLY valid JSON matching this exact schema — no markdown fences, no commentary, no explanation:
{
  "total_weeks": number,
  "weeks": [
    {
      "week_number": 1,
      "theme": "short title",
      "summary": "1-2 sentence explanation of why this week matters",
      "focus_techniques": ["technique1", "technique2"],
      "songs": [{ "title": "Song Name", "artist": "Artist Name", "why": "reason for picking this song" }],
      "daily_tasks": [
        {
          "id": "w1-d1-t1",
          "day": "Mon",
          "minutes": 20,
          "type": "warmup",
          "title": "Short task title",
          "description": "Clear instruction for what to practice"
        }
      ]
    }
  ]
}`;
}

function pickWeekCount(survey: Record<string, unknown>): number {
  const goals = (survey.goals as string[]) || [];
  const level = survey.level as string;
  if (level === "Advanced" || goals.includes("Pass an exam / grade")) return 12;
  if (level === "Intermediate") return 8;
  return 6;
}
