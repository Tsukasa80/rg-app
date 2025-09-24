-- Enable row level security
alter table activity_entries enable row level security;
alter table weekly_selections enable row level security;
alter table weekly_reflections enable row level security;

create policy "Users can manage their activities" on activity_entries
  for all using (user_id = auth.uid()::text)
  with check (user_id = auth.uid()::text);

create policy "Users can manage weekly selections" on weekly_selections
  for all using (user_id = auth.uid()::text)
  with check (user_id = auth.uid()::text);

create policy "Users can manage reflections" on weekly_reflections
  for all using (user_id = auth.uid()::text)
  with check (user_id = auth.uid()::text);

-- Guest access (no auth) for personal use
-- Allows rows whose user_id starts with 'guest_' to be managed without auth
create policy "Guests can manage their activities" on activity_entries
  for all using (auth.uid() is null and user_id like 'guest_%')
  with check (auth.uid() is null and user_id like 'guest_%');

create policy "Guests can manage weekly selections" on weekly_selections
  for all using (auth.uid() is null and user_id like 'guest_%')
  with check (auth.uid() is null and user_id like 'guest_%');

create policy "Guests can manage reflections" on weekly_reflections
  for all using (auth.uid() is null and user_id like 'guest_%')
  with check (auth.uid() is null and user_id like 'guest_%');
