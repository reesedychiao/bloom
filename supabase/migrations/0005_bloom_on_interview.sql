-- Phase 4: a flower reaches full bloom when an interview is scheduled — not
-- only at offer. Offers are rare; blooming on a booked interview rewards
-- effort the user controls and lets the garden actually bloom. The bouquet
-- (growth_stage = 3) then collects every interview milestone as a keepsake.
-- Apply via Supabase dashboard SQL editor.

-- growth_stage = greatest(status stage, interview bloom), terminal statuses
-- preserve whatever bloom they had reached (they wilt in place).
create or replace function public.growth_stage_for(p_app_id uuid, p_status text, p_prev int)
returns int
language plpgsql
stable
as $$
declare
  s int := public.stage_for_status(p_status);
  has_interview boolean;
begin
  if s is null then
    return p_prev; -- terminal: keep the last stage
  end if;
  select exists(select 1 from public.interviews where application_id = p_app_id) into has_interview;
  return greatest(s, case when has_interview then 3 else 0 end);
end;
$$;

-- update the status-change stamp to use the combined rule
create or replace function public.stamp_application_growth()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    -- no interviews can reference this row yet; greatest() is a no-op here
    new.growth_stage := coalesce(public.stage_for_status(new.status), 0);
  elsif new.status is distinct from old.status then
    new.last_activity_at := now();
    new.growth_stage := public.growth_stage_for(new.id, new.status, old.growth_stage);
  end if;
  return new;
end;
$$;

-- scheduling (or removing) an interview re-blooms/recomputes the parent flower.
-- Status is unchanged, so this writes growth_stage directly without tripping
-- the status stamp or emitting a spurious stage_event.
create or replace function public.recompute_growth_on_interview()
returns trigger
language plpgsql
as $$
declare
  aid uuid := coalesce(new.application_id, old.application_id);
  app record;
begin
  select id, status, growth_stage into app from public.applications where id = aid;
  if found then
    update public.applications
      set growth_stage = public.growth_stage_for(app.id, app.status, app.growth_stage)
      where id = app.id;
  end if;
  return coalesce(new, old);
end;
$$;

create trigger interview_recompute_growth
  after insert or delete on public.interviews
  for each row
  execute function public.recompute_growth_on_interview();

-- backfill: bloom any existing application that already has an interview
update public.applications a
  set growth_stage = public.growth_stage_for(a.id, a.status, a.growth_stage);
