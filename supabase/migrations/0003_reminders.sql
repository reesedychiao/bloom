-- Phase 3: reminder infrastructure.
-- Apply via Supabase dashboard SQL editor.

-- idempotency marker for the dispatch function: a task is notified once
alter table public.prep_tasks add column notified_at timestamptz;

-- one row per browser/device that granted push permission
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),

  endpoint text not null unique,
  p256dh text not null,
  auth text not null
);

-- channel prefs; quiet-hours columns ship now, their UI arrives in Phase 4
create table public.notification_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),

  push_enabled boolean not null default true,
  email_enabled boolean not null default true,
  email text,
  timezone text not null default 'UTC', -- IANA name, captured from the browser
  quiet_start smallint check (quiet_start between 0 and 23),
  quiet_end smallint check (quiet_end between 0 and 23)
);

do $$
declare
  t text;
begin
  foreach t in array array['push_subscriptions', 'notification_settings'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "owner_all" on public.%I for all
         using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;
