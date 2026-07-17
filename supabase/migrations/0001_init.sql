-- Bloom schema: all tables + RLS + status-change bookkeeping.
-- Apply via Supabase dashboard SQL editor (CLI migrations arrive in Phase 3).

-- ---------------------------------------------------------------------------
-- applications: one flower per job application
-- ---------------------------------------------------------------------------
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),

  company text not null,
  role text not null,
  url text,
  source text check (source in ('linkedin', 'referral', 'company_site', 'recruiter', 'other')),
  location text,
  salary_min int,
  salary_max int,
  salary_currency text,
  species text not null check (species in
    ('sunflower', 'tulip', 'rose', 'daisy', 'lavender', 'poppy', 'peony', 'orchid')),
  is_dream boolean not null default false,
  -- not in the original spec schema: records the "tailored materials" checkbox
  -- at planting time so Phase 2 can award its Sunlight bonus
  tailored boolean not null default false,
  status text not null default 'planted' check (status in
    ('planted', 'outreach', 'screening', 'interviewing', 'offer',
     'accepted', 'rejected', 'withdrawn', 'ghosted')),
  -- 0 seed, 1 sprout, 2 bud, 3 bloom; derived from status (see trigger below,
  -- which must stay in sync with stageForStatus in src/lib/game/growth.ts)
  growth_stage int not null default 0 check (growth_stage between 0 and 3),
  notes text,
  applied_at date,
  last_activity_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- stage_events: immutable timeline per application (trigger-written)
-- ---------------------------------------------------------------------------
create table public.stage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),

  application_id uuid not null references public.applications (id) on delete cascade,
  from_status text,
  to_status text not null,
  occurred_at timestamptz not null default now(),
  note text
);

-- ---------------------------------------------------------------------------
-- contacts (Phase 2+ UI)
-- ---------------------------------------------------------------------------
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),

  application_id uuid references public.applications (id) on delete set null,
  name text not null,
  role text,
  company text,
  channel text check (channel in ('linkedin', 'email', 'other')),
  last_contacted_at date,
  next_followup_at date,
  notes text
);

-- ---------------------------------------------------------------------------
-- interviews (Phase 3 UI)
-- ---------------------------------------------------------------------------
create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),

  application_id uuid not null references public.applications (id) on delete cascade,
  scheduled_at timestamptz not null,
  kind text check (kind in
    ('recruiter', 'behavioral', 'technical', 'system_design', 'case', 'onsite', 'final')),
  location_or_link text,
  outcome text not null default 'pending' check (outcome in
    ('pending', 'passed', 'failed', 'cancelled')),
  notes text
);

-- ---------------------------------------------------------------------------
-- prep_tasks: auto-generated per interview (Phase 3)
-- ---------------------------------------------------------------------------
create table public.prep_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),

  interview_id uuid not null references public.interviews (id) on delete cascade,
  due_on date not null,
  title text not null,
  kind text check (kind in ('research', 'jd_mapping', 'practice', 'mock', 'logistics')),
  completed_at timestamptz,
  sunlight_reward int not null default 25
);

-- ---------------------------------------------------------------------------
-- sunlight_events: append-only XP ledger (Phase 2)
-- ---------------------------------------------------------------------------
create table public.sunlight_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),

  amount int not null,
  reason text not null check (reason in
    ('planted', 'tailored_bonus', 'outreach', 'followup', 'prep_task', 'mock',
     'stage_advance', 'compost', 'quest', 'achievement')),
  ref_id uuid,
  occurred_on date not null default current_date
);

-- ---------------------------------------------------------------------------
-- streaks: single row per user (Phase 2)
-- ---------------------------------------------------------------------------
create table public.streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),

  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_active_on date,
  freezes_available int not null default 2,
  freezes_used_this_week int not null default 0
);

-- ---------------------------------------------------------------------------
-- quests (Phase 2)
-- ---------------------------------------------------------------------------
create table public.quests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),

  kind text not null check (kind in ('daily', 'weekly')),
  title text not null,
  target int not null default 1,
  progress int not null default 0,
  reward int not null,
  assigned_on date not null default current_date,
  expires_on date not null,
  completed_at timestamptz
);

-- ---------------------------------------------------------------------------
-- achievements (Phase 2)
-- ---------------------------------------------------------------------------
create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),

  key text not null,
  unlocked_at timestamptz not null default now(),
  unique (user_id, key)
);

-- ---------------------------------------------------------------------------
-- Row Level Security: every table, owner-only for all operations
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'applications', 'stage_events', 'contacts', 'interviews',
    'prep_tasks', 'sunlight_events', 'streaks', 'quests', 'achievements'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "owner_all" on public.%I for all
         using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Status-change bookkeeping.
-- The timeline and growth_stage are written here, in the database, so they
-- stay correct and atomic no matter which screen changes a status.
-- Growth mapping mirrors stageForStatus in src/lib/game/growth.ts — keep in sync.
-- ---------------------------------------------------------------------------
create or replace function public.stage_for_status(s text)
returns int
language sql
immutable
as $$
  select case s
    when 'planted' then 0
    when 'outreach' then 0
    when 'screening' then 1
    when 'interviewing' then 2
    when 'offer' then 3
    when 'accepted' then 3
    else null -- terminal statuses (rejected/withdrawn/ghosted) keep the last stage
  end;
$$;

-- BEFORE: stamp derived fields onto the row being written
create or replace function public.stamp_application_growth()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    new.growth_stage := coalesce(public.stage_for_status(new.status), 0);
  elsif new.status is distinct from old.status then
    new.last_activity_at := now();
    new.growth_stage := coalesce(public.stage_for_status(new.status), old.growth_stage);
  end if;
  return new;
end;
$$;

-- AFTER: record the timeline event (must run after so the FK target exists on insert)
create or replace function public.record_stage_event()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.stage_events (user_id, application_id, from_status, to_status)
    values (new.user_id, new.id, null, new.status);
  elsif new.status is distinct from old.status then
    insert into public.stage_events (user_id, application_id, from_status, to_status)
    values (new.user_id, new.id, old.status, new.status);
  end if;
  return new;
end;
$$;

create trigger application_stamp_growth
  before insert or update on public.applications
  for each row
  execute function public.stamp_application_growth();

create trigger application_record_stage_event
  after insert or update on public.applications
  for each row
  execute function public.record_stage_event();

-- helpful indexes for the common lookups
create index applications_user_idx on public.applications (user_id, created_at desc);
create index stage_events_application_idx on public.stage_events (application_id, occurred_at);
create index sunlight_events_user_day_idx on public.sunlight_events (user_id, occurred_on);
