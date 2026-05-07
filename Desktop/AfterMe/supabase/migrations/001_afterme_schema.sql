create type public.commitment_status as enum ('active', 'completed', 'abandoned');
create type public.reflection_outcome as enum ('better', 'same', 'worse');

create table public.user_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Friend',
  avatar_url text,
  bio_line text not null default 'Showing up for myself, every day.',
  reminder_time time not null default '19:00',
  reminders_enabled boolean not null default true,
  dark_mode boolean not null default false,
  struggle_window text,
  created_at timestamptz not null default now()
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null default 'custom',
  name text not null,
  icon text not null default 'custom',
  color text not null default '#7C5CFF',
  default_duration_min int not null default 10 check (default_duration_min between 1 and 240),
  benefits text[] not null default '{}',
  is_default boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.commitments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_id uuid not null references public.activities(id) on delete restrict,
  duration_minutes int not null check (duration_minutes between 1 and 240),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status public.commitment_status not null default 'active',
  constraint completed_has_completed_at check (
    (status = 'completed' and completed_at is not null) or status <> 'completed'
  )
);

create table public.reflections (
  id uuid primary key default gen_random_uuid(),
  commitment_id uuid not null unique references public.commitments(id) on delete cascade,
  outcome public.reflection_outcome not null,
  feeling_score int check (feeling_score between 1 and 10),
  note text,
  created_at timestamptz not null default now()
);

create unique index one_active_commitment_per_user
  on public.commitments(user_id)
  where status = 'active';

create index activities_user_active_idx on public.activities(user_id, is_archived);
create index commitments_user_recent_idx on public.commitments(user_id, started_at desc);
create index commitments_user_status_idx on public.commitments(user_id, status);
create index commitments_activity_recent_idx on public.commitments(activity_id, started_at desc);
create index reflections_commitment_outcome_idx on public.reflections(commitment_id, outcome);

alter table public.user_profile enable row level security;
alter table public.activities enable row level security;
alter table public.commitments enable row level security;
alter table public.reflections enable row level security;

create policy "profiles are owner scoped" on public.user_profile
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "activities are owner scoped" on public.activities
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "commitments are owner scoped" on public.commitments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "reflections are owner scoped" on public.reflections
  for all using (
    exists (
      select 1 from public.commitments c
      where c.id = commitment_id and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.commitments c
      where c.id = commitment_id and c.user_id = auth.uid()
    )
  );

create view public.activity_outcome_stats as
select
  c.user_id,
  a.id as activity_id,
  a.name,
  a.key,
  a.color,
  count(r.id)::int as reflected_count,
  count(*) filter (where r.outcome = 'better')::int as better_count,
  round(100 * count(*) filter (where r.outcome = 'better') / nullif(count(r.id), 0))::int as felt_better_pct
from public.activities a
left join public.commitments c on c.activity_id = a.id and c.status = 'completed'
left join public.reflections r on r.commitment_id = c.id
group by c.user_id, a.id;

create or replace function public.current_streak(user_uuid uuid)
returns int
language sql
stable
security definer
as $$
  with completed_days as (
    select distinct (started_at at time zone 'utc')::date as day
    from public.commitments
    where user_id = user_uuid and status = 'completed'
  ),
  numbered as (
    select day, row_number() over (order by day desc) - 1 as rn
    from completed_days
    where day <= current_date
  )
  select coalesce(count(*)::int, 0)
  from numbered
  where day = current_date - rn::int;
$$;
