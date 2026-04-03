-- Drop the circular policy causing infinite recursion
drop policy if exists "profiles_read_providers" on profiles;

-- Replace with simple: any authenticated user can read any profile (MVP is fine with this)
create policy "profiles_read_authenticated" on profiles
  for select
  using (auth.uid() is not null);
