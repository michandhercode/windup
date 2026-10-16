-- Windup: per-account daily quotas (planes released into the Sky, messages to Mimi).
-- Run AFTER supabase/schema.sql and supabase/likes.sql. Safe to re-run.
--
-- Counters live in the database, keyed by the account (auth.uid() / thoughts.user_id), so they cannot be
-- reset by clearing browser storage, switching browsers, or signing out and in as someone else.
--
--  * 'release': enforced by a trigger on public.thoughts. ANY insert/update that turns a row into a
--    released plane consumes one unit atomically with that write; if the write fails, the unit is not used.
--    The browser cannot bypass it, even with direct table access.
--  * 'mimi': consumed by the /api/chat route through consume_mimi_message() before Gemini is called.
--
-- The day rolls over at midnight in quota_timezone() below (UTC by default; change it in ONE place).
-- The limits live in quota_limit(); keep DEFAULT_DAILY_LIMITS in lib/quota.ts in step (display fallback only).

begin;

create table if not exists public.daily_usage (
  user_id uuid    not null references auth.users(id) on delete cascade,
  kind    text    not null check (kind in ('release', 'mimi')),
  day     date    not null,
  used    integer not null default 0 check (used >= 0),
  primary key (user_id, kind, day)
);

alter table public.daily_usage enable row level security;   -- no policies on purpose: no direct access
revoke all on public.daily_usage from anon, authenticated;

create or replace function public.quota_timezone() returns text
language sql immutable as $$ select 'UTC'::text $$;          -- e.g. 'Asia/Manila' to reset at local midnight

create or replace function public.quota_day() returns date
language sql stable as $$ select (now() at time zone public.quota_timezone())::date $$;

create or replace function public.quota_limit(p_kind text) returns integer
language sql immutable as $$
  select case p_kind when 'release' then 3 when 'mimi' then 10 end
$$;

-- Internal: atomically use one unit for this account today. Returns false when the limit is already reached.
create or replace function public.consume_daily_quota(p_user_id uuid, p_kind text) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_limit integer := public.quota_limit(p_kind);
  v_day   date    := public.quota_day();
  v_used  integer;
begin
  if p_user_id is null or v_limit is null then
    raise exception 'Invalid quota request' using errcode = '22023';
  end if;

  insert into public.daily_usage (user_id, kind, day, used)
    values (p_user_id, p_kind, v_day, 0)
    on conflict do nothing;

  -- The row lock makes concurrent requests queue up, so the limit can never be overshot
  update public.daily_usage
     set used = used + 1
   where user_id = p_user_id and kind = p_kind and day = v_day and used < v_limit
  returning used into v_used;

  delete from public.daily_usage where user_id = p_user_id and day < v_day - 7;  -- keep the table tiny

  return v_used is not null;
end;
$$;

-- Releases: every transition INTO 'released' (new plane, or a jar letter / draft sent to the Sky) costs one unit.
create or replace function public.enforce_release_quota() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'released' and (tg_op = 'INSERT' or old.status is distinct from 'released') then
    if not public.consume_daily_quota(new.user_id, 'release') then
      raise exception 'DAILY_RELEASE_LIMIT' using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists thoughts_release_quota on public.thoughts;
create trigger thoughts_release_quota
  before insert or update of status on public.thoughts
  for each row execute function public.enforce_release_quota();

-- What the app can ask: "how much have I used today, and what is my limit?" (own account only)
create or replace function public.get_daily_quota(p_kind text)
returns table (used integer, daily_limit integer)
language sql stable security definer set search_path = public as $$
  select
    coalesce((
      select u.used from public.daily_usage u
      where u.user_id = auth.uid() and u.kind = p_kind and u.day = public.quota_day()
    ), 0),
    public.quota_limit(p_kind)
  where auth.uid() is not null and public.quota_limit(p_kind) is not null
$$;

-- Mimi: the only quota the browser/server may consume directly (always for the caller's own account)
create or replace function public.consume_mimi_message() returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    raise exception 'A signed-in account is required' using errcode = '28000';
  end if;
  return public.consume_daily_quota(auth.uid(), 'mimi');
end;
$$;

revoke all on function public.consume_daily_quota(uuid, text) from public, anon, authenticated;
revoke all on function public.enforce_release_quota() from public, anon, authenticated;
revoke all on function public.get_daily_quota(text) from public, anon;
revoke all on function public.consume_mimi_message() from public, anon;
grant execute on function public.get_daily_quota(text) to authenticated;
grant execute on function public.consume_mimi_message() to authenticated;

commit;

-- If the app still says the function is missing right after running this file, refresh the API schema cache:
-- notify pgrst, 'reload schema';