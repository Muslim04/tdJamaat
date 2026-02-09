
-- Create the main data storage table
create table records (
  id uuid primary key default gen_random_uuid(),
  week integer not null,
  team text not null,
  activity text not null, -- Stores the JSON payload { miniCard: ..., members: ..., _date: ... }
  created_at timestamp with time zone default now()
);

-- Indices for faster queries by week or team
create index idx_records_week on records(week);
create index idx_records_team on records(team);

-- Row Level Security (RLS) is recommended
alter table records enable row level security;

-- Policy to allow read access to everyone
create policy "Enable read access for all users"
on records for select
to anon, authenticated
using (true);

-- Policy to allow insert/update/delete (assuming frontend authentication or using service_role for migration)
-- For now, allowing anon write access as requested ("both apps can read/write instantly", "no backend server").
-- WARNING: This allows anyone with the anon key to modify data. In production, use authentication.
create policy "Enable insert for all users"
on records for insert
to anon, authenticated
with check (true);

create policy "Enable update for all users"
on records for update
to anon, authenticated
using (true);

create policy "Enable delete for all users"
on records for delete
to anon, authenticated
using (true);
