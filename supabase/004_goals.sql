-- ============================================================
-- TWINE — Migration 004: Goals
-- Run in: Supabase → SQL Editor → + New query → paste → Run
-- Safe to run more than once. Does not touch any other table.
-- ============================================================

create table if not exists goals (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  emoji       text not null default '🎯',
  owner       text not null check (owner in ('facu', 'janina', 'both')),
  due_date    date,                          -- optional
  why         text,                          -- one line of motivation
  created_by  text,
  done_at     timestamptz,                   -- set when achieved
  created_at  timestamptz not null default now()
);

create table if not exists goal_milestones (
  id          uuid primary key default gen_random_uuid(),
  goal_id     uuid not null references goals(id) on delete cascade,
  text        text not null,
  done        boolean not null default false,
  created_by  text,
  done_by     text,
  done_at     timestamptz,
  created_at  timestamptz not null default now()
);

create table if not exists goal_cheers (
  id          uuid primary key default gen_random_uuid(),
  goal_id     uuid not null references goals(id) on delete cascade,
  from_user   text not null,
  seen_at     timestamptz,                   -- when the other person saw it on Home
  created_at  timestamptz not null default now()
);

create index if not exists goal_milestones_goal_idx on goal_milestones(goal_id);
create index if not exists goal_cheers_goal_idx on goal_cheers(goal_id);

alter table goals enable row level security;
alter table goal_milestones enable row level security;
alter table goal_cheers enable row level security;

drop policy if exists "Allow all for goals" on goals;
create policy "Allow all for goals" on goals for all using (true) with check (true);

drop policy if exists "Allow all for goal_milestones" on goal_milestones;
create policy "Allow all for goal_milestones" on goal_milestones for all using (true) with check (true);

drop policy if exists "Allow all for goal_cheers" on goal_cheers;
create policy "Allow all for goal_cheers" on goal_cheers for all using (true) with check (true);

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'goals') then
    alter publication supabase_realtime add table goals;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'goal_milestones') then
    alter publication supabase_realtime add table goal_milestones;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'goal_cheers') then
    alter publication supabase_realtime add table goal_cheers;
  end if;
end $$;
