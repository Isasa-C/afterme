alter table public.activity_items
  add column if not exists priority text not null default 'must'
    check (priority in ('must', 'optional')),
  add column if not exists hint text;

alter table public.commitments
  add column if not exists gone_at timestamptz;

alter table public.commitments
  drop column if exists out_at;
