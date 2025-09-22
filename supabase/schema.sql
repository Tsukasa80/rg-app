create table if not exists activity_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  occurred_at timestamptz not null,
  type text not null check (type in ('GREEN','RED')),
  title text not null,
  note text,
  energy_score smallint not null check (energy_score in (-2,-1,0,1,2)),
  duration_min integer,
  tags text[] default '{}'::text[] not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists weekly_selections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  iso_week int not null,
  year int not null,
  type text not null check (type in ('GREEN_BEST','RED_WORST')),
  entry_ids uuid[] not null,
  notes jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, year, iso_week, type)
);

create table if not exists weekly_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  iso_week int not null,
  year int not null,
  q1 text,
  q2 text,
  q3 text,
  summary jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, year, iso_week)
);
