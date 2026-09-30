-- ============================================================
-- TWINE — Migration 002: Shopping lists
-- Run in: Supabase → SQL Editor → paste → Run
-- Safe to run more than once (every step checks before creating).
-- Does NOT touch the existing plans / experiences tables.
-- ============================================================

-- Lists ------------------------------------------------------------------
create table if not exists shopping_lists (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  emoji        text not null default '🛒',
  is_default   boolean not null default false,   -- default lists can be renamed, never archived or deleted
  sort_order   integer not null default 100,
  archived_at  timestamptz,                      -- null = active, set = archived
  created_by   text,
  created_at   timestamptz not null default now()
);

-- Items ------------------------------------------------------------------
create table if not exists shopping_items (
  id          uuid primary key default gen_random_uuid(),
  list_id     uuid not null references shopping_lists(id) on delete cascade,
  text        text not null,
  checked     boolean not null default false,
  added_by    text,
  checked_by  text,
  checked_at  timestamptz,
  cleared_at  timestamptz,                       -- "Clear checked" hides items instead of deleting them,
                                                 -- so autocomplete remembers what you usually buy
  created_at  timestamptz not null default now()
);

create index if not exists shopping_items_list_id_idx on shopping_items(list_id);

-- Default lists (only inserted the first time) ----------------------------
insert into shopping_lists (name, emoji, is_default, sort_order)
select 'Moabit Home', '🏠', true, 0
where not exists (select 1 from shopping_lists where is_default and sort_order = 0);

insert into shopping_lists (name, emoji, is_default, sort_order)
select 'Mitte Home', '🏡', true, 1
where not exists (select 1 from shopping_lists where is_default and sort_order = 1);

-- Access: same model as plans (no login, the two of you share the project) --
alter table shopping_lists enable row level security;
alter table shopping_items enable row level security;

drop policy if exists "Allow all for shopping_lists" on shopping_lists;
create policy "Allow all for shopping_lists"
  on shopping_lists for all using (true) with check (true);

drop policy if exists "Allow all for shopping_items" on shopping_items;
create policy "Allow all for shopping_items"
  on shopping_items for all using (true) with check (true);

-- Realtime (skips tables that are already added) --------------------------
do $$
begin
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and tablename = 'shopping_lists') then
    alter publication supabase_realtime add table shopping_lists;
  end if;
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and tablename = 'shopping_items') then
    alter publication supabase_realtime add table shopping_items;
  end if;
end $$;
