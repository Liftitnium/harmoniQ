import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGemini, GEMINI_MODEL, GENERATION_CONFIG } from "@/lib/gemini/client";
import { extractJson, validatePlanLenient } from "@/lib/roadmap-schema";
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

  /* ---- get survey data: body first, then DB fallback ---- */
  let survey: Record<string, unknown> | null = null;

  try {
    const body = await request.json();
    if (body && Object.keys(body).length > 0) {
      survey = body;
    }
  } catch {
    // no body or invalid JSON — fall through to DB
  }

  if (!survey) {
    const { data, error } = await supabase
      .from("survey_responses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "No survey found — complete onboarding first" },
        { status: 400 },
      );
    }
    survey = data;
  }

  /* ---- build prompt ---- */
  const prompt = buildGeneratePrompt(survey!);

  /* ---- call Gemini (with one retry on parse failure) ---- */
  try {
    const gemini = getGemini();
    const model = gemini.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: GENERATION_CONFIG,
    });

    let parsed: Record<string, unknown> | null = null;

    // First attempt
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
      console.warn("[roadmap/generate] First parse failed, retrying…", parseErr);
    }

    // Retry with explicit JSON-only instruction
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
        console.error("[roadmap/generate] Retry parse also failed", retryErr);
        return NextResponse.json(
          { error: "Failed to generate a valid roadmap. Please try again." },
          { status: 500 },
        );
      }
    }

    /* ---- lenient validation ---- */
    const { valid, warnings } = validatePlanLenient(parsed);

    if (warnings.length > 0) {
      console.warn("[roadmap/generate] Validation warnings:", warnings);
    }

    if (!valid) {
      console.error("[roadmap/generate] Validation failed. Parsed keys:", Object.keys(parsed as object), "| Parsed preview:", JSON.stringify(parsed).slice(0, 300));
      return NextResponse.json(
        {
          error: "Gemini returned an unusable plan shape. Please try again.",
          details: warnings,
        },
        { status: 502 },
      );
    }

    /* ---- persist ---- */
    const totalWeeks =
      typeof (parsed as Record<string, unknown>).total_weeks === "number"
        ? (parsed as Record<string, unknown>).total_weeks
        : ((parsed as Record<string, unknown>).weeks as unknown[]).length;

    const { data: roadmap, error: insertErr } = await supabase
      .from("roadmaps")
      .insert({
        user_id: user.id,
        current_week: 1,
        total_weeks: totalWeeks,
        plan_json: parsed,
      })
      .select()
      .single();

    if (insertErr) {
      console.error("[roadmap/generate] DB insert failed:", insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ roadmap });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[roadmap/generate] Unexpected error:", message);
    if (message === "Gemini timeout") {
      return NextResponse.json(
        { error: "The AI took too long to respond. Please try again." },
        { status: 504 },
      );
    }
    return NextResponse.json(
      { error: "Failed to generate roadmap. Please try again." },
      { status: 502 },
    );
  }
}

/* ------------------------------------------------------------------ */
/*  Prompt builder                                                    */
/* ------------------------------------------------------------------ */

function buildGeneratePrompt(survey: Record<string, unknown>): string {
  const level = survey.level as string;
  const yearsPlaying = survey.years_playing ?? survey.yearsPlaying ?? 0;
  const genres = (survey.genres as string[]) || [];
  const goals = (survey.goals as string[]) || [];
  const weeklyMinutes = (survey.weekly_minutes ?? survey.weeklyMinutes ?? 60) as number;
  const practiceDays = ((survey.practice_days ?? survey.practiceDays) as string[]) || [];
  const knownTechniques = ((survey.known_techniques ?? survey.knownTechniques) as string[]) || [];
  const favoriteArtists = ((survey.favorite_artists ?? survey.favoriteArtists) as string[]) || [];
  const weakSpots = ((survey.weak_spots ?? survey.weakSpots) as string[]) || [];

  const totalWeeks = pickWeekCount(level, goals);
  const perDay = practiceDays.length > 0 ? Math.round(weeklyMinutes / practiceDays.length) : 30;

  return `You are an expert guitar teacher building a personalized practice roadmap for a student. Based on their profile, create a structured multi-week practice plan.

STUDENT PROFILE:
Level: ${level}
Years playing: ${yearsPlaying}
Genres they love: ${genres.join(", ")}
Goals: ${goals.join(", ")}
Weekly practice time: ${weeklyMinutes} minutes across these days: ${practiceDays.join(", ")}
Techniques they already know: ${knownTechniques.join(", ") || "None yet"}
Artists/songs they want to play: ${favoriteArtists.join(", ") || "No preference"}
Weak spots to improve: ${weakSpots.join(", ") || "None specified"}

RULES:
1. Create a ${totalWeeks}-week plan (4 weeks for beginners, 6-8 for intermediate, 8-12 for advanced).
2. Each week has a theme and daily tasks ONLY on the student's practice days (${practiceDays.join(", ")}).
3. Daily tasks must fit within the per-day time budget: roughly ${perDay} minutes per practice day.
4. Include REAL, well-known songs that match their genres and favorite artists. Use songs that actually exist on guitar tab sites.
5. Progress from their known techniques into adjacent new ones — don't repeat what they already know unless it's a warmup.
6. Spend more time on their weak spots.
7. Mix task types: warmup, technique drill, song practice, theory, ear training.
8. Song names must be real: {title: "actual song name", artist: "actual artist name"}.
9. Each task needs a unique ID in format "w{week}-d{day_index}-t{task_index}" (e.g. "w1-d1-t1").

Respond with ONLY valid JSON matching this exact schema. No markdown fences, no explanation, no commentary — ONLY the JSON object:
{
  "total_weeks": number,
  "weeks": [
    {
      "week_number": number,
      "theme": "short descriptive title",
      "summary": "1-2 sentences explaining why this week focuses on this",
      "focus_techniques": ["technique1", "technique2"],
      "songs": [
        {
          "title": "real song name",
          "artist": "real artist name",
          "why": "1 sentence on why this song fits this week's goals"
        }
      ],
      "daily_tasks": [
        {
          "id": "w1-d1-t1",
          "day": "Mon",
          "minutes": 15,
          "type": "warmup|technique|song|theory|ear_training",
          "title": "short task title",
          "description": "2-3 sentences: what to do, how to do it, what to focus on"
        }
      ]
    }
  ]
}`;
}

function pickWeekCount(level: string, goals: string[]): number {
  const l = (level || "").toLowerCase();
  if (l === "advanced" || goals.includes("Pass an exam / grade")) return 12;
  if (l === "intermediate") return 8;
  return 4;
}
