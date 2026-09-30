-- ============================================================
-- TWINE — Migration 003: Fitness tracker
-- Run in: Supabase → SQL Editor → + New query → paste → Run
-- Safe to run more than once. Does not touch plans or lists.
-- ============================================================

-- What each person tracks. Editable from the app ("Edit habits").
--   kind = 'check'    → done / not done            (Creatine, pills…)
--   kind = 'training' → done + type, km and a note
--   kind = 'number'   → a value, e.g. hours of sleep
create table if not exists habits (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,                 -- 'facu' | 'janina'
  name        text not null,
  emoji       text not null default '✅',
  kind        text not null default 'check' check (kind in ('check', 'training', 'number')),
  unit        text,                          -- 'h' for sleep
  sort_order  integer not null default 100,
  active      boolean not null default true, -- hidden habits keep their history
  created_at  timestamptz not null default now()
);

-- One row per habit per day. No row = not done.
create table if not exists habit_logs (
  id          uuid primary key default gen_random_uuid(),
  habit_id    uuid not null references habits(id) on delete cascade,
  user_id     text not null,
  date        date not null,                 -- the local calendar day, not a timestamp
  value       numeric,                       -- sleep hours, or km for training
  type        text,                          -- training type: Run, Gym, Padel, Other
  note        text,
  created_at  timestamptz not null default now(),
  unique (habit_id, date)
);

create index if not exists habit_logs_date_idx on habit_logs(date);

-- Starting habits (only if there are none yet) ----------------------------
insert into habits (user_id, name, emoji, kind, unit, sort_order)
select * from (values
  ('facu',   'Creatine',     '🥤', 'check',    null, 1),
  ('facu',   'Magnesium',    '💊', 'check',    null, 2),
  ('facu',   'Training',     '🏃', 'training', null, 10),
  ('facu',   'Sleep',        '😴', 'number',   'h',  20),
  ('janina', 'Creatine',     '🥤', 'check',    null, 1),
  ('janina', 'Magnesium',    '💊', 'check',    null, 2),
  ('janina', 'Allergy pill', '🤧', 'check',    null, 3),
  ('janina', 'Period pill',  '🌸', 'check',    null, 4),
  ('janina', 'Training',     '🏃', 'training', null, 10),
  ('janina', 'Sleep',        '😴', 'number',   'h',  20)
) as seed(user_id, name, emoji, kind, unit, sort_order)
where not exists (select 1 from habits);

-- Access: same model as the rest of Twine ----------------------------------
alter table habits enable row level security;
alter table habit_logs enable row level security;

drop policy if exists "Allow all for habits" on habits;
create policy "Allow all for habits"
  on habits for all using (true) with check (true);

drop policy if exists "Allow all for habit_logs" on habit_logs;
create policy "Allow all for habit_logs"
  on habit_logs for all using (true) with check (true);

-- Realtime ----------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and tablename = 'habits') then
    alter publication supabase_realtime add table habits;
  end if;
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and tablename = 'habit_logs') then
    alter publication supabase_realtime add table habit_logs;
  end if;
end $$;
