-- Enable row level security
alter table activity_entries enable row level security;
alter table weekly_selections enable row level security;
alter table weekly_reflections enable row level security;

create policy "Users can manage their activities" on activity_entries
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage weekly selections" on weekly_selections
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can manage reflections" on weekly_reflections
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
