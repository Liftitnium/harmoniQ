-- ============================================================
-- HarmoniQ — initial schema
-- ============================================================

-- 1. profiles ---------------------------------------------------
create table public.profiles (
  id          uuid        primary key references auth.users on delete cascade,
  display_name text,
  instrument  text        default 'guitar',
  onboarded   boolean     default false,
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. survey_responses -------------------------------------------
create table public.survey_responses (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references auth.users on delete cascade,
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
  created_at        timestamptz default now()
);

alter table public.survey_responses enable row level security;

create policy "Users can read own surveys"
  on public.survey_responses for select
  using (auth.uid() = user_id);

create policy "Users can insert own surveys"
  on public.survey_responses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own surveys"
  on public.survey_responses for update
  using (auth.uid() = user_id);


-- 3. roadmaps ---------------------------------------------------
create table public.roadmaps (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users on delete cascade,
  current_week int         default 1,
  total_weeks  int,
  plan_json    jsonb,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table public.roadmaps enable row level security;

create policy "Users can read own roadmaps"
  on public.roadmaps for select
  using (auth.uid() = user_id);

create policy "Users can insert own roadmaps"
  on public.roadmaps for insert
  with check (auth.uid() = user_id);

create policy "Users can update own roadmaps"
  on public.roadmaps for update
  using (auth.uid() = user_id);


-- 4. week_progress ----------------------------------------------
create table public.week_progress (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references auth.users on delete cascade,
  roadmap_id        uuid        not null references public.roadmaps on delete cascade,
  week_number       int         not null,
  task_id           text        not null,
  completed         boolean     default false,
  difficulty_rating int,
  notes             text,
  completed_at      timestamptz,
  created_at        timestamptz default now()
);

-- Unique constraint for upsert on task completion
create unique index week_progress_user_roadmap_task
  on public.week_progress (user_id, roadmap_id, task_id);

alter table public.week_progress enable row level security;

create policy "Users can read own progress"
  on public.week_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.week_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.week_progress for update
  using (auth.uid() = user_id);
