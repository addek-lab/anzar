-- ================================================================
-- Anzar MVP — Initial Database Schema
-- Run this in Supabase SQL Editor (project dashboard > SQL Editor)
-- ================================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "unaccent";

-- ================================================================
-- ENUMS
-- ================================================================

create type user_type as enum ('customer', 'provider', 'admin');
create type provider_status as enum ('pending', 'verified', 'rejected', 'suspended');
create type request_status as enum ('open', 'matched', 'in_progress', 'completed', 'expired', 'cancelled');
create type urgency_level as enum ('urgent', 'soon', 'flexible');
create type match_status as enum ('pending', 'notified', 'viewed', 'responded', 'declined', 'expired');
create type job_status as enum ('active', 'completed', 'disputed', 'cancelled');
create type message_type as enum ('text', 'offer', 'system');
create type offer_status as enum ('pending', 'accepted', 'declined', 'expired');
create type review_status as enum ('pending', 'approved', 'rejected');
create type notification_type as enum (
  'new_lead', 'offer_received', 'offer_accepted', 'offer_declined',
  'message_received', 'job_completed', 'review_received',
  'verification_approved', 'verification_rejected', 'request_expired'
);

-- ================================================================
-- PROFILES (mirrors auth.users)
-- ================================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text not null unique,
  user_type user_type,
  full_name text,
  preferred_locale text not null default 'fr' check (preferred_locale in ('fr', 'ar')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_user_type on profiles(user_type);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, phone)
  values (new.id, coalesce(new.phone, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ================================================================
-- CITIES & NEIGHBORHOODS
-- ================================================================

create table cities (
  id uuid primary key default uuid_generate_v4(),
  name_fr text not null,
  name_ar text not null,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table neighborhoods (
  id uuid primary key default uuid_generate_v4(),
  city_id uuid not null references cities(id) on delete cascade,
  name_fr text not null,
  name_ar text not null,
  created_at timestamptz not null default now()
);

create index idx_neighborhoods_city on neighborhoods(city_id);

-- ================================================================
-- CATEGORIES
-- ================================================================

create table categories (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name_fr text not null,
  name_ar text not null,
  icon text not null default '🔧',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ================================================================
-- CUSTOMER PROFILES
-- ================================================================

create table customer_profiles (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null unique references profiles(id) on delete cascade,
  neighborhood_id uuid references neighborhoods(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ================================================================
-- PROVIDER PROFILES
-- ================================================================

create table provider_profiles (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null unique references profiles(id) on delete cascade,
  business_name text,
  slug text not null unique,
  bio_fr text,
  bio_ar text,
  city_id uuid references cities(id) on delete set null,
  neighborhood_ids uuid[] not null default '{}',
  trade_ids uuid[] not null default '{}',
  years_experience integer check (years_experience >= 0 and years_experience <= 60),
  status provider_status not null default 'pending',
  identity_doc_url text,
  avg_rating numeric(3,2) not null default 0 check (avg_rating >= 0 and avg_rating <= 5),
  review_count integer not null default 0,
  response_rate numeric(4,3) not null default 0 check (response_rate >= 0 and response_rate <= 1),
  jobs_completed integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_provider_profiles_status on provider_profiles(status);
create index idx_provider_profiles_city on provider_profiles(city_id);
create index idx_provider_profiles_trades on provider_profiles using gin(trade_ids);
create index idx_provider_profiles_slug on provider_profiles(slug);

-- ================================================================
-- SERVICE REQUESTS
-- ================================================================

create table service_requests (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references profiles(id) on delete cascade,
  category_id uuid not null references categories(id) on delete restrict,
  city_id uuid not null references cities(id) on delete restrict,
  neighborhood_id uuid references neighborhoods(id) on delete set null,
  description text not null check (char_length(description) >= 10),
  budget_text text,
  urgency urgency_level not null default 'soon',
  status request_status not null default 'open',
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_requests_customer on service_requests(customer_id);
create index idx_requests_status on service_requests(status);
create index idx_requests_category_city on service_requests(category_id, city_id);
create index idx_requests_expires on service_requests(expires_at);

-- ================================================================
-- MATCHES
-- ================================================================

create table matches (
  id uuid primary key default uuid_generate_v4(),
  request_id uuid not null references service_requests(id) on delete cascade,
  provider_id uuid not null references provider_profiles(id) on delete cascade,
  score numeric(6,2) not null default 0,
  status match_status not null default 'pending',
  notified_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  unique(request_id, provider_id)
);

create index idx_matches_request on matches(request_id);
create index idx_matches_provider on matches(provider_id);
create index idx_matches_status on matches(status);

-- ================================================================
-- CONVERSATIONS
-- ================================================================

create table conversations (
  id uuid primary key default uuid_generate_v4(),
  request_id uuid not null references service_requests(id) on delete cascade,
  customer_id uuid not null references profiles(id) on delete cascade,
  provider_id uuid not null references provider_profiles(id) on delete cascade,
  match_id uuid not null references matches(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(match_id)
);

create index idx_conversations_customer on conversations(customer_id);
create index idx_conversations_provider on conversations(provider_id);

-- ================================================================
-- MESSAGES
-- ================================================================

create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  content text not null check (char_length(content) >= 1),
  message_type message_type not null default 'text',
  offer_id uuid,
  created_at timestamptz not null default now()
);

create index idx_messages_conversation on messages(conversation_id, created_at);

-- ================================================================
-- OFFERS
-- ================================================================

create table offers (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  provider_id uuid not null references provider_profiles(id) on delete cascade,
  price_mad numeric(10,2) not null check (price_mad > 0),
  description text not null,
  estimated_duration text,
  status offer_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_offers_conversation on offers(conversation_id);

-- Add FK after both tables exist
alter table messages add constraint fk_messages_offer
  foreign key (offer_id) references offers(id) on delete set null;

-- ================================================================
-- JOBS
-- ================================================================

create table jobs (
  id uuid primary key default uuid_generate_v4(),
  request_id uuid not null references service_requests(id) on delete cascade,
  offer_id uuid not null unique references offers(id) on delete restrict,
  customer_id uuid not null references profiles(id) on delete cascade,
  provider_id uuid not null references provider_profiles(id) on delete cascade,
  status job_status not null default 'active',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_jobs_customer on jobs(customer_id);
create index idx_jobs_provider on jobs(provider_id);
create index idx_jobs_status on jobs(status);

-- ================================================================
-- REVIEWS
-- ================================================================

create table reviews (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid not null references jobs(id) on delete cascade,
  reviewer_id uuid not null references profiles(id) on delete cascade,
  reviewed_id uuid not null references profiles(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  status review_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique(job_id, reviewer_id)
);

create index idx_reviews_reviewed on reviews(reviewed_id, status);

-- Auto-update provider avg_rating on review approval
create or replace function update_provider_rating()
returns trigger language plpgsql security definer as $$
declare
  v_provider_profile_id uuid;
begin
  select id into v_provider_profile_id
  from provider_profiles
  where profile_id = new.reviewed_id;

  if v_provider_profile_id is not null and new.status = 'approved' then
    update provider_profiles
    set
      avg_rating = (
        select coalesce(avg(r.rating)::numeric(3,2), 0)
        from reviews r
        where r.reviewed_id = new.reviewed_id
        and r.status = 'approved'
      ),
      review_count = (
        select count(*) from reviews r
        where r.reviewed_id = new.reviewed_id
        and r.status = 'approved'
      ),
      updated_at = now()
    where id = v_provider_profile_id;
  end if;

  return new;
end;
$$;

create trigger on_review_update
  after insert or update on reviews
  for each row execute function update_provider_rating();

-- ================================================================
-- NOTIFICATIONS
-- ================================================================

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null,
  title_fr text not null,
  title_ar text not null,
  body_fr text not null,
  body_ar text not null,
  data jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on notifications(user_id, created_at desc);
create index idx_notifications_unread on notifications(user_id) where read_at is null;

-- ================================================================
-- ADMIN ACTIONS AUDIT LOG
-- ================================================================

create table admin_actions (
  id uuid primary key default uuid_generate_v4(),
  admin_id uuid not null references profiles(id) on delete cascade,
  action text not null,
  target_type text not null,
  target_id uuid not null,
  reason text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index idx_admin_actions_admin on admin_actions(admin_id, created_at desc);
create index idx_admin_actions_target on admin_actions(target_type, target_id);

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

alter table profiles enable row level security;
alter table customer_profiles enable row level security;
alter table provider_profiles enable row level security;
alter table service_requests enable row level security;
alter table matches enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table offers enable row level security;
alter table jobs enable row level security;
alter table reviews enable row level security;
alter table notifications enable row level security;
alter table admin_actions enable row level security;
alter table categories enable row level security;
alter table cities enable row level security;
alter table neighborhoods enable row level security;

-- Profiles: users can read/update own profile
create policy "profiles_own" on profiles for all using (auth.uid() = id);
create policy "profiles_read_providers" on profiles for select
  using (exists (
    select 1 from provider_profiles pp
    join matches m on m.provider_id = pp.id
    join service_requests sr on sr.id = m.request_id
    where pp.profile_id = profiles.id and sr.customer_id = auth.uid()
  ));

-- Customer profiles: own only
create policy "customer_profiles_own" on customer_profiles for all
  using (profile_id = auth.uid());

-- Provider profiles: own read/write; others read verified only
create policy "provider_profiles_own" on provider_profiles for all
  using (profile_id = auth.uid());
create policy "provider_profiles_read_verified" on provider_profiles for select
  using (status = 'verified');

-- Categories/cities/neighborhoods: public read
create policy "categories_read" on categories for select using (true);
create policy "cities_read" on cities for select using (true);
create policy "neighborhoods_read" on neighborhoods for select using (true);

-- Service requests: customer sees own; providers see matched
create policy "requests_own_customer" on service_requests for all
  using (customer_id = auth.uid());
create policy "requests_provider_view" on service_requests for select
  using (exists (
    select 1 from matches m
    join provider_profiles pp on pp.id = m.provider_id
    where m.request_id = service_requests.id and pp.profile_id = auth.uid()
  ));

-- Matches: provider sees own; customer sees their request matches
create policy "matches_provider" on matches for select
  using (exists (
    select 1 from provider_profiles pp
    where pp.id = matches.provider_id and pp.profile_id = auth.uid()
  ));
create policy "matches_customer" on matches for select
  using (exists (
    select 1 from service_requests sr
    where sr.id = matches.request_id and sr.customer_id = auth.uid()
  ));

-- Conversations: participants only
create policy "conversations_participant" on conversations for all
  using (
    customer_id = auth.uid() or
    exists (select 1 from provider_profiles pp where pp.id = provider_id and pp.profile_id = auth.uid())
  );

-- Messages: conversation participants
create policy "messages_participant" on messages for all
  using (exists (
    select 1 from conversations c
    where c.id = messages.conversation_id
    and (
      c.customer_id = auth.uid() or
      exists (select 1 from provider_profiles pp where pp.id = c.provider_id and pp.profile_id = auth.uid())
    )
  ));

-- Offers: conversation participants
create policy "offers_participant" on offers for all
  using (exists (
    select 1 from conversations c
    where c.id = offers.conversation_id
    and (
      c.customer_id = auth.uid() or
      exists (select 1 from provider_profiles pp where pp.id = c.provider_id and pp.profile_id = auth.uid())
    )
  ));

-- Jobs: participants
create policy "jobs_participant" on jobs for all
  using (
    customer_id = auth.uid() or
    exists (select 1 from provider_profiles pp where pp.id = provider_id and pp.profile_id = auth.uid())
  );

-- Reviews: own or about you
create policy "reviews_own" on reviews for all using (reviewer_id = auth.uid());
create policy "reviews_about_me" on reviews for select using (reviewed_id = auth.uid());
create policy "reviews_public" on reviews for select using (status = 'approved');

-- Notifications: own only
create policy "notifications_own" on notifications for all using (user_id = auth.uid());

-- Admin actions: admin only (via service role)
create policy "admin_actions_none" on admin_actions for all using (false);
