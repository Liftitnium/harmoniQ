-- ============================================================
-- HarmoniQ — Full Database Schema
-- Run this in Supabase SQL Editor to set up all tables.
-- All statements use IF NOT EXISTS for idempotency.
-- ============================================================

-- ============================================================
-- 1. PROFILES
-- Stores user display info, XP, streaks, and gamification data.
-- Auto-created via trigger when a new auth user signs up.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id                    uuid        PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name          text,
  instrument            text        DEFAULT 'guitar',
  onboarded             boolean     DEFAULT false,
  xp                    int         NOT NULL DEFAULT 0,
  streak_days           int         NOT NULL DEFAULT 0,
  last_practice_date    date,
  current_level         int         NOT NULL DEFAULT 1,
  max_streak            int         NOT NULL DEFAULT 0,
  freeze_count          int         NOT NULL DEFAULT 0,
  total_tasks_completed int         NOT NULL DEFAULT 0,
  created_at            timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Auto-create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 2. SURVEY RESPONSES
-- Stores the onboarding survey data used to generate roadmaps.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.survey_responses (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  level             text,
  years_playing     int,
  genres            text[],
  goals             text[],
  weekly_minutes    int,
  practice_days     text[],
  known_techniques  text[],
  favorite_artists  text[],
  weak_spots        text[],
  raw_json          jsonb,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can read own surveys"
    ON public.survey_responses FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own surveys"
    ON public.survey_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own surveys"
    ON public.survey_responses FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own surveys"
    ON public.survey_responses FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
-- 3. ROADMAPS
-- AI-generated practice plans stored as JSON.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.roadmaps (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  current_week int         DEFAULT 1,
  total_weeks  int,
  plan_json    jsonb,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can read own roadmaps"
    ON public.roadmaps FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own roadmaps"
    ON public.roadmaps FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own roadmaps"
    ON public.roadmaps FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own roadmaps"
    ON public.roadmaps FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
-- 4. WEEK PROGRESS
-- Tracks task completion, difficulty ratings, and practice time.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.week_progress (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  roadmap_id        uuid        NOT NULL REFERENCES public.roadmaps ON DELETE CASCADE,
  week_number       int         NOT NULL,
  task_id           text        NOT NULL,
  completed         boolean     DEFAULT false,
  difficulty_rating int,
  practice_minutes  int,
  notes             text,
  completed_at      timestamptz,
  created_at        timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS week_progress_user_roadmap_task
  ON public.week_progress (user_id, roadmap_id, task_id);

ALTER TABLE public.week_progress ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can read own progress"
    ON public.week_progress FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own progress"
    ON public.week_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own progress"
    ON public.week_progress FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
-- 5. BADGE UNLOCKS
-- Tracks which badges each user has earned.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.badge_unlocks (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id    text        NOT NULL,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.badge_unlocks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own badges"
    ON public.badge_unlocks FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own badges"
    ON public.badge_unlocks FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
