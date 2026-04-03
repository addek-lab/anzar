-- Drop the trigger entirely — profile creation handled by API
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user();

-- Make phone fully optional with no conflicts
alter table profiles alter column phone drop not null;
alter table profiles drop constraint if exists profiles_phone_key;
drop index if exists profiles_phone_unique;
