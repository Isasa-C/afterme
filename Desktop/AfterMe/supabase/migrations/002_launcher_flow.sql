create table public.activity_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_id uuid not null references public.activities(id) on delete cascade,
  label text not null,
  icon_key text not null,
  sort_order int not null,
  is_door_step boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_activity_items_lookup
  on public.activity_items(user_id, activity_id, sort_order);

alter table public.activity_items enable row level security;

create policy "activity items are owner scoped" on public.activity_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.commitments
  add column if not exists packing_started_at timestamptz,
  add column if not exists out_at timestamptz,
  add column if not exists minimum_minutes int not null default 10;
