-- ============================================================
-- TWINE — Supabase Schema
-- Run this entire file in: Supabase → SQL Editor → Run
-- ============================================================

-- Plans
create table if not exists plans (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text default '',
  category_id     text not null default 'todo',
  location        text default '',
  cost            integer default 0,
  duration_mins   integer default 60,
  status          text default 'idea',
  suggested_by    text not null,
  tags            text[] default '{}',
  notes           text default '',
  image_urls      text[] default '{}',
  ranking_janina  integer,
  ranking_facu    integer,
  created_at      timestamptz default now()
);

-- Experiences (post-date feedback, one per plan)
create table if not exists experiences (
  id              uuid primary key default gen_random_uuid(),
  plan_id         uuid references plans(id) on delete cascade unique,
  overall_rating  numeric(3,1) default 0,
  mood_before     integer default 5,
  mood_after      integer default 5,
  fun_level       integer default 5,
  would_repeat    boolean default true,
  favorite_memory text default '',
  completed_at    timestamptz default now()
);

-- Enable Realtime so both devices sync instantly
alter publication supabase_realtime add table plans;
alter publication supabase_realtime add table experiences;

-- Allow all operations (no auth — couple shares one project)
alter table plans enable row level security;
alter table experiences enable row level security;

create policy "Allow all for plans"
  on plans for all using (true) with check (true);

create policy "Allow all for experiences"
  on experiences for all using (true) with check (true);
