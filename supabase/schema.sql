-- Windup: `thoughts` table, safe public view, and Row Level Security.
--
-- Safe to re-run, and safe on a `thoughts` table you created by hand earlier: it repairs old status
-- constraints / enum types, normalizes old rows, then installs the rules the app expects.
-- Everything runs in ONE transaction: if any step fails, nothing is changed.
--
-- Status values: draft | folded (UI "kept") | sealed | opened | released

begin;

-- 1. Table (fresh installs) ---------------------------------------------------------------------------------
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

-- 2. Columns added after the first version of the table -----------------------------------------------------
alter table public.thoughts add column if not exists seal_until timestamptz;
alter table public.thoughts add column if not exists likes integer not null default 0;
alter table public.thoughts add column if not exists updated_at timestamptz not null default now();

-- 3. The public view depends on `status`, so drop it while the column is repaired (recreated in step 9) ----
drop view if exists public.public_thoughts;

-- 4. An old table may use an ENUM for status (cannot hold 'opened' / 'released'): convert it to plain text --
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'thoughts'
      and column_name = 'status' and data_type = 'USER-DEFINED'
  ) then
    alter table public.thoughts alter column status drop default;
    alter table public.thoughts alter column status type text using status::text;
  end if;
end $$;

-- 5. Drop EVERY old CHECK constraint that mentions status / is_private, whatever it is named ----------------
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.thoughts'::regclass
      and contype = 'c'
      and (pg_get_constraintdef(oid) ilike '%status%' or pg_get_constraintdef(oid) ilike '%is_private%')
  loop
    execute format('alter table public.thoughts drop constraint %I', c.conname);
  end loop;
end $$;

-- 6. Normalize old rows so they satisfy the new rules ---------------------------------------------------------
update public.thoughts set status = 'folded' where status is null or status in ('kept', 'unpublished');
update public.thoughts set is_private = true where is_private is null;
update public.thoughts set status = 'released' where is_private = false and status <> 'released';  -- public = released
update public.thoughts set status = 'folded'   where status = 'released' and is_private = true;
update public.thoughts set status = 'folded'   where status not in ('draft', 'folded', 'sealed', 'opened', 'released');

alter table public.thoughts alter column status set default 'folded';
alter table public.thoughts alter column status set not null;
alter table public.thoughts alter column is_private set default true;
alter table public.thoughts alter column is_private set not null;

-- 7. Rules ----------------------------------------------------------------------------------------------------
alter table public.thoughts add constraint thoughts_status_check
  check (status in ('draft', 'folded', 'sealed', 'opened', 'released'));

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

-- 8. RLS: owners can read / insert / update / delete their own rows. There is deliberately NO public SELECT
--    policy on the table (the Sky reads the view below). If supabase/diagnose_thoughts.sql lists other
--    policies on this table, review them: a policy that exposes public rows would also expose user_id.
alter table public.thoughts enable row level security;

drop policy if exists "users manage own thoughts" on public.thoughts;
create policy "users manage own thoughts"
  on public.thoughts for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 9. The Sky reads released planes through this view, which omits user_id so authors stay anonymous.
--    (Views run with their owner's rights, so they can read released rows the caller does not own.)
create view public.public_thoughts as
  select id, title, content, mood, likes, created_at
  from public.thoughts
  where status = 'released' and is_private = false;

revoke all on public.public_thoughts from public;
grant select on public.public_thoughts to anon, authenticated;

commit;