-- Auto-confirm all existing and future users (disables email confirmation at DB level)
update auth.users set email_confirmed_at = now() where email_confirmed_at is null;

-- Fix profiles RLS: add WITH CHECK so users can insert their own row
drop policy if exists "profiles_own" on profiles;
create policy "profiles_own" on profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Fix customer_profiles RLS: add WITH CHECK
drop policy if exists "customer_profiles_own" on customer_profiles;
create policy "customer_profiles_own" on customer_profiles
  for all
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());
