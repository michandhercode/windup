-- Windup: READ-ONLY diagnostics for the `thoughts` table. Changes nothing.
-- Paste into the Supabase SQL editor and run. Each block is a separate result: run them one at a time
-- if your editor only shows the last result.

-- 1. Columns: is `status` "text", or an enum (USER-DEFINED)? Are seal_until / likes / updated_at there?
select column_name, data_type, udt_name, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'thoughts'
order by ordinal_position;

-- 2. CHECK / other constraints. A check that does not list all of: draft, folded, sealed, opened, released
--    is what blocks opening and releasing letters (error code 23514).
select conname, contype, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.thoughts'::regclass
order by contype, conname;

-- 3. If status is an enum, its allowed values (error code 22P02 when a value is missing)
select t.typname, e.enumlabel
from pg_type t join pg_enum e on e.enumtypid = t.oid
where t.typname in (
  select udt_name from information_schema.columns
  where table_schema = 'public' and table_name = 'thoughts' and column_name = 'status'
)
order by e.enumsortorder;

-- 4. Row Level Security: is it on, and which policies exist? You need one that allows UPDATE (and DELETE)
--    for the owner (cmd = ALL or UPDATE). With no UPDATE policy, an update silently changes 0 rows.
select relrowsecurity as rls_enabled from pg_class where oid = 'public.thoughts'::regclass;
select policyname, cmd, roles, permissive, qual as using_expr, with_check
from pg_policies
where schemaname = 'public' and tablename = 'thoughts';

-- 5. Triggers on the table (a broken trigger makes every update fail)
select tgname, pg_get_triggerdef(oid) as definition
from pg_trigger
where tgrelid = 'public.thoughts'::regclass and not tgisinternal;

-- 6. What is stored now? Any status outside the five valid ones, or a row where
--    (status = 'released') does not match (is_private = false), will break the new rules.
select status, is_private, count(*) as rows
from public.thoughts
group by status, is_private
order by status, is_private;

-- 7. The Sky view
select pg_get_viewdef('public.public_thoughts'::regclass, true) as view_definition;