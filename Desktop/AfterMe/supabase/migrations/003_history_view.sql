create or replace view public.v_commitment_with_reflection as
select
  c.*,
  r.outcome,
  r.note,
  r.feeling_score
from public.commitments c
left join public.reflections r on r.commitment_id = c.id;
