-- Windup: `thoughts` table, safe public view, and Row Level Security.
-- Safe to re-run. If you already created `public.thoughts` by hand, the ALTERs below bring it up to date.

create table if not exists public.thoughts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text,
  content     text not null,
  mood        text,
  is_private  boolean not null default true,
  status      text not null default 'folded',
  seal_until  timestamptz,
  likes       integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Columns added after the first version of the table
alter table public.thoughts add column if not exists seal_until timestamptz;
alter table public.thoughts add column if not exists likes integer not null default 0;
alter table public.thoughts add column if not exists updated_at timestamptz not null default now();

-- Statuses: draft | folded (UI "kept") | sealed | opened | released
alter table public.thoughts drop constraint if exists thoughts_status_check;
alter table public.thoughts add constraint thoughts_status_check
  check (status in ('draft', 'folded', 'sealed', 'opened', 'released'));

alter table public.thoughts drop constraint if exists thoughts_limits_check;
alter table public.thoughts add constraint thoughts_limits_check
  check (
    (title is null or char_length(title) <= 120)
    and char_length(content) between 1 and 10000
    and ((status = 'released') = (is_private = false))
  );

create index if not exists thoughts_owner_idx on public.thoughts (user_id, created_at desc);
create index if not exists thoughts_public_idx on public.thoughts (created_at desc) where status = 'released';

-- Keep updated_at fresh
create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists thoughts_set_updated_at on public.thoughts;
create trigger thoughts_set_updated_at before update on public.thoughts
  for each row execute function public.set_updated_at();

-- RLS: owners manage their own rows. There is deliberately NO public SELECT policy on the table.
alter table public.thoughts enable row level security;

drop policy if exists "users manage own thoughts" on public.thoughts;
create policy "users manage own thoughts"
  on public.thoughts for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- The Sky reads released planes through this view, which omits user_id so authors stay anonymous.
-- (Views run with their owner's rights, so they can read released rows the caller does not own.)
create or replace view public.public_thoughts as
  select id, title, content, mood, likes, created_at
  from public.thoughts
  where status = 'released' and is_private = false;

revoke all on public.public_thoughts from public;
grant select on public.public_thoughts to anon, authenticated;