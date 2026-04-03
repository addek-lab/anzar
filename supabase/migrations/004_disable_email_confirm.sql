-- Disable email confirmation requirement
update auth.config set confirm_email_change_email_template = '' where true;

-- Alternative: update directly in auth settings
alter table auth.users alter column email_confirmed_at set default now();
update auth.users set email_confirmed_at = now() where email_confirmed_at is null;
