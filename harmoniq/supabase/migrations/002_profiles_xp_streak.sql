-- ============================================================
-- Full XP, streak, and badge system for profiles
-- ============================================================

-- Profile columns
alter table public.profiles add column if not exists xp                    int not null default 0;
alter table public.profiles add column if not exists streak_days           int not null default 0;
alter table public.profiles add column if not exists last_practice_date    date;
alter table public.profiles add column if not exists current_level         int not null default 1;
alter table public.profiles add column if not exists max_streak            int not null default 0;
alter table public.profiles add column if not exists freeze_count          int not null default 0;
alter table public.profiles add column if not exists total_tasks_completed int not null default 0;

-- Badge unlocks
create table if not exists public.badge_unlocks (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  badge_id    text        not null,
  unlocked_at timestamptz not null default now(),
  unique(user_id, badge_id)
);

alter table public.badge_unlocks enable row level security;

create policy "Users can view own badges"
  on public.badge_unlocks for select
  using (auth.uid() = user_id);

create policy "Users can insert own badges"
  on public.badge_unlocks for insert
  with check (auth.uid() = user_id);
