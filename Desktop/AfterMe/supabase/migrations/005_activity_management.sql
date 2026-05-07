alter table activities
  add column if not exists archived_at timestamptz null,
  add column if not exists sort_order int not null default 0,
  add column if not exists color_key text not null default 'purple';

alter table activities
  drop constraint if exists activities_color_key_check;

alter table activities
  add constraint activities_color_key_check
  check (color_key in ('purple', 'green', 'orange', 'blue', 'pink', 'yellow'));

create index if not exists idx_activities_user_active_order
  on activities (user_id, sort_order)
  where archived_at is null;
