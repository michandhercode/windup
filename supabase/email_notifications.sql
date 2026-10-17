-- Windup: "your sealed letter is ready" emails (sent by /api/cron/sealed-reminders through Brevo).
-- Run AFTER supabase/schema.sql. Safe to re-run. It does not touch the `thoughts` table.
--
-- sealed_letter_notifications remembers which letters were already announced, so nobody is emailed twice.
-- It is keyed by (letter, seal date): if a letter is re-sealed for a new date, it is announced again for that date.

begin;

create table if not exists public.sealed_letter_notifications (
  thought_id  uuid not null references public.thoughts(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  seal_until  timestamptz not null,
  notified_at timestamptz not null default now(),
  primary key (thought_id, seal_until)
);

-- Row Level Security on and NO policies: browsers (anon / signed-in users) cannot read or write this table at all.
-- Only the server's service role key (which bypasses RLS) can.
alter table public.sealed_letter_notifications enable row level security;

-- Sealed letters whose date has arrived and that were not announced yet, oldest first.
create or replace function public.sealed_letters_due(p_limit integer default 50)
returns table (thought_id uuid, user_id uuid, title text, seal_until timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select t.id as thought_id, t.user_id, t.title, t.seal_until
  from public.thoughts t
  where t.status = 'sealed'
    and t.seal_until is not null
    and t.seal_until <= now()
    and not exists (
      select 1
      from public.sealed_letter_notifications n
      where n.thought_id = t.id and n.seal_until = t.seal_until
    )
  order by t.seal_until asc
  limit greatest(1, least(coalesce(p_limit, 50), 200));
$$;

-- It lists every account's letters, so only the server (service role) may call it
revoke all on function public.sealed_letters_due(integer) from public, anon, authenticated;
grant execute on function public.sealed_letters_due(integer) to service_role;

commit;