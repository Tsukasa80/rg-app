insert into activity_entries (user_id, occurred_at, type, title, note, energy_score, duration_min, tags)
values
  ('00000000-0000-0000-0000-000000000001', now() - interval '1 day', 'GREEN', '朝ラン', '海沿い3km', 2, 25, array['運動']),
  ('00000000-0000-0000-0000-000000000001', now() - interval '1 day', 'RED', '経費精算', 'レシート整理', -1, 40, array['仕事']);
