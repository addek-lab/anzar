-- Fix profiles table to support email-based auth (no phone)
alter table profiles alter column phone drop not null;
alter table profiles alter column phone set default null;

-- Drop the old unique constraint on phone (empty string conflicts)
alter table profiles drop constraint if exists profiles_phone_key;

-- Add it back allowing nulls (nulls don't conflict with each other)
create unique index if not exists profiles_phone_unique on profiles(phone) where phone is not null and phone != '';

-- Update the trigger to store email when phone is absent
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, phone)
  values (
    new.id,
    case
      when new.phone is not null and new.phone != '' then new.phone
      else null
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
