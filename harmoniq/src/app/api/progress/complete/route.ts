import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Upsert so re-clicks don't create duplicates
  const { data, error } = await supabase
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
      { onConflict: "user_id,roadmap_id,task_id" }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ progress: data });
}
