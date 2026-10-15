-- Windup: likes ("resonated") for paper planes. Run AFTER supabase/schema.sql. Safe to re-run.
--
-- One row per (plane, liker). A liker is a signed-in user ('u:<user id>') or a guest ('g:<guest id>', an id the
-- app keeps in a cookie). Likes are changed ONLY through toggle_thought_like(); the table itself is closed to
-- the browser, so nobody can read who liked what. A trigger keeps thoughts.likes equal to the real count, so
-- the public_thoughts view (The Sky) and the owner's Sent Planes always show the same number.

begin;

create table if not exists public.thought_likes (
  thought_id uuid not null references public.thoughts(id) on delete cascade,
  liker_key  text not null,
  created_at timestamptz not null default now(),
  primary key (thought_id, liker_key)
);

alter table public.thought_likes enable row level security;   -- no policies on purpose: no direct access
revoke all on public.thought_likes from anon, authenticated;

-- Keep thoughts.likes in step with the rows above
create or replace function public.sync_thought_likes() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.thoughts set likes = likes + 1 where id = new.thought_id;
  elsif tg_op = 'DELETE' then
    update public.thoughts set likes = greatest(likes - 1, 0) where id = old.thought_id;
  end if;
  return null;
end;
$$;

drop trigger if exists thought_likes_sync on public.thought_likes;
create trigger thought_likes_sync after insert or delete on public.thought_likes
  for each row execute function public.sync_thought_likes();

-- Who is asking? A signed-in user is always identified by their account; a guest by the id the app sends.
create or replace function public.viewer_like_key(p_guest_id text) returns text
language sql stable set search_path = public as $$
  select case
    when auth.uid() is not null then 'u:' || auth.uid()::text
    when p_guest_id ~ '^[0-9a-fA-F-]{36}$' then 'g:' || lower(p_guest_id)
  end
$$;

-- Like if not liked yet, unlike if already liked. Returns the new state and the real total.
create or replace function public.toggle_thought_like(p_thought_id uuid, p_guest_id text default null)
returns table (liked boolean, likes integer)
language plpgsql security definer set search_path = public as $$
declare
  v_key text := public.viewer_like_key(p_guest_id);
  v_liked boolean;
begin
  if v_key is null then
    raise exception 'A signed-in account or a guest id is required' using errcode = '28000';
  end if;

  -- Only released, public planes can be liked
  if not exists (
    select 1 from public.thoughts t
    where t.id = p_thought_id and t.status = 'released' and t.is_private = false
  ) then
    raise exception 'Plane not found' using errcode = 'P0002';
  end if;

  delete from public.thought_likes where thought_id = p_thought_id and liker_key = v_key;
  if found then
    v_liked := false;
  else
    insert into public.thought_likes (thought_id, liker_key) values (p_thought_id, v_key)
      on conflict do nothing;
    v_liked := true;
  end if;

  return query select v_liked, (select t.likes from public.thoughts t where t.id = p_thought_id);
end;
$$;

-- Ids of the planes this viewer has liked (so the heart shows as filled after a reload)
create or replace function public.liked_thought_ids(p_guest_id text default null)
returns setof uuid
language sql stable security definer set search_path = public as $$
  select l.thought_id from public.thought_likes l where l.liker_key = public.viewer_like_key(p_guest_id)
$$;

revoke all on function public.sync_thought_likes() from public, anon, authenticated;
revoke all on function public.viewer_like_key(text) from public, anon, authenticated;
revoke all on function public.toggle_thought_like(uuid, text) from public;
revoke all on function public.liked_thought_ids(text) from public;
grant execute on function public.toggle_thought_like(uuid, text) to anon, authenticated;
grant execute on function public.liked_thought_ids(text) to anon, authenticated;

-- Live updates for owners: let Supabase Realtime announce changes to `thoughts` (their own rows only; RLS
-- still applies). Sent Planes uses this to show new likes without a reload. Skipped if Realtime isn't present.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'thoughts'
     ) then
    alter publication supabase_realtime add table public.thoughts;
  end if;
end $$;

commit;