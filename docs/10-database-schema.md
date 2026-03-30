# Database Schema

## Design Principles

1. **PostgreSQL-idiomatic** — use native types (uuid, enum, timestamptz, jsonb where appropriate)
2. **Supabase RLS-ready** — every user-owned table has `auth.uid()` accessible columns
3. **Multilingual** — translation tables for user-facing content, not column duplication
4. **Audit-friendly** — key state changes logged
5. **Soft deletes** — no hard deletes for core entities; use `deleted_at` or status flags
6. **Indexes** — defined for all common query patterns

---

## Enums

```sql
-- User account type
CREATE TYPE user_type AS ENUM ('customer', 'provider', 'admin', 'support');

-- Provider verification status
CREATE TYPE provider_status AS ENUM (
  'pending',       -- submitted, awaiting admin review
  'verified',      -- approved, active in platform
  'rejected',      -- rejected, can resubmit
  'restricted',    -- can receive leads but not show in new matches
  'suspended'      -- completely blocked
);

-- Request status
CREATE TYPE request_status AS ENUM (
  'draft',         -- not yet submitted
  'open',          -- submitted, matching in progress
  'matched',       -- providers matched, waiting for response
  'hired',         -- customer selected a provider
  'in_progress',   -- provider marked as working
  'completed',     -- both sides confirmed done
  'cancelled',     -- customer cancelled
  'expired'        -- no activity for 30 days
);

-- Urgency
CREATE TYPE urgency_level AS ENUM ('urgent', 'soon', 'flexible');

-- Match status
CREATE TYPE match_status AS ENUM (
  'pending',       -- provider notified, no response yet
  'viewed',        -- provider opened lead detail
  'responded',     -- provider sent offer or message
  'declined',      -- provider declined this lead
  'selected',      -- customer chose this provider
  'not_selected'   -- customer chose another provider
);

-- Job status (derived from request status but tracked on the job level)
CREATE TYPE job_status AS ENUM (
  'hired',
  'in_progress',
  'completed',
  'cancelled'
);

-- Message type
CREATE TYPE message_type AS ENUM ('text', 'offer', 'status_update', 'system');

-- Offer status
CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'declined', 'superseded');

-- Review status
CREATE TYPE review_status AS ENUM ('pending', 'published', 'rejected', 'flagged');

-- Moderation action type
CREATE TYPE moderation_action AS ENUM (
  'verify_provider',
  'reject_provider',
  'suspend_user',
  'reinstate_user',
  'restrict_user',
  'approve_review',
  'reject_review',
  'dismiss_flag',
  'resolve_dispute',
  'manual_match_override'
);

-- Notification type
CREATE TYPE notification_type AS ENUM (
  'new_lead',
  'verification_approved',
  'verification_rejected',
  'new_message',
  'offer_received',
  'offer_accepted',
  'offer_declined',
  'job_completed',
  'review_received',
  'request_expired'
);
```

---

## Core Tables

### users (extends Supabase auth.users)

```sql
-- Supabase auth.users is managed by Supabase.
-- We store additional profile data here.
CREATE TABLE profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type       user_type NOT NULL,
  phone           text NOT NULL UNIQUE,          -- E.164 format
  display_name    text,
  preferred_locale text NOT NULL DEFAULT 'fr',  -- 'fr' | 'ar'
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz                   -- soft delete
);

CREATE INDEX profiles_phone_idx ON profiles(phone);
CREATE INDEX profiles_user_type_idx ON profiles(user_type);
```

---

### customer_profiles

```sql
CREATE TABLE customer_profiles (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  city_id       integer REFERENCES cities(id),
  neighborhood  text,                           -- free text in V1
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
```

---

### provider_profiles

```sql
CREATE TABLE provider_profiles (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  business_name         text,                  -- optional company name
  bio                   text,                  -- max 500 chars
  bio_ar                text,                  -- Arabic version if provided
  whatsapp_number       text,                  -- separate from auth phone
  city_id               integer NOT NULL REFERENCES cities(id),
  service_radius_km     integer NOT NULL DEFAULT 10,  -- 5, 10, 20, or NULL (city-wide)
  status                provider_status NOT NULL DEFAULT 'pending',
  verified_at           timestamptz,
  rejection_reason      text,
  -- Computed metrics (updated by triggers / background jobs)
  response_rate         numeric(4,1),           -- percentage, 0.0–100.0
  avg_response_hours    numeric(5,1),           -- average hours to first response
  completed_jobs_count  integer NOT NULL DEFAULT 0,
  avg_rating            numeric(3,2),           -- 1.00–5.00
  review_count          integer NOT NULL DEFAULT 0,
  quality_score         numeric(5,2),           -- internal matching score
  last_active_at        timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX provider_profiles_city_idx ON provider_profiles(city_id);
CREATE INDEX provider_profiles_status_idx ON provider_profiles(status);
CREATE INDEX provider_profiles_quality_score_idx ON provider_profiles(quality_score DESC);
```

---

### provider_trades

```sql
-- Many-to-many: providers ↔ categories
CREATE TABLE provider_trades (
  id            serial PRIMARY KEY,
  provider_id   uuid NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  category_id   integer NOT NULL REFERENCES categories(id),
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(provider_id, category_id)
);

CREATE INDEX provider_trades_provider_idx ON provider_trades(provider_id);
CREATE INDEX provider_trades_category_idx ON provider_trades(category_id);
```

---

### provider_verifications

```sql
CREATE TABLE provider_verifications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id     uuid NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  document_type   text NOT NULL,               -- 'cin' | 'business_registration'
  document_url    text NOT NULL,               -- Supabase Storage private URL
  submitted_at    timestamptz NOT NULL DEFAULT now(),
  reviewed_at     timestamptz,
  reviewed_by     uuid REFERENCES profiles(id), -- admin user
  decision        text,                         -- 'approved' | 'rejected'
  notes           text
);
```

---

### provider_photos

```sql
CREATE TABLE provider_photos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id   uuid NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  url           text NOT NULL,                  -- Supabase Storage CDN URL
  sort_order    integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX provider_photos_provider_idx ON provider_photos(provider_id);
```

---

### categories

```sql
CREATE TABLE categories (
  id          serial PRIMARY KEY,
  slug        text NOT NULL UNIQUE,             -- 'electrician', 'plumbing', etc.
  icon        text NOT NULL,                    -- Lucide icon name
  sort_order  integer NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Translations
CREATE TABLE category_translations (
  id          serial PRIMARY KEY,
  category_id integer NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  locale      text NOT NULL,                   -- 'fr' | 'ar'
  name        text NOT NULL,
  description text,
  UNIQUE(category_id, locale)
);

-- Synonyms (for search)
CREATE TABLE category_synonyms (
  id          serial PRIMARY KEY,
  category_id integer NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  term        text NOT NULL,                   -- 'plombier', 'سباك', 'sbak', etc.
  locale      text,                            -- NULL = language-agnostic
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(category_id, term)
);

-- Full-text search index on synonyms
CREATE INDEX category_synonyms_term_idx ON category_synonyms
  USING GIN(to_tsvector('simple', term));
```

---

### cities

```sql
CREATE TABLE cities (
  id          serial PRIMARY KEY,
  slug        text NOT NULL UNIQUE,
  name_fr     text NOT NULL,
  name_ar     text NOT NULL,
  is_active   boolean NOT NULL DEFAULT false,  -- only Casablanca active in V1
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE neighborhoods (
  id        serial PRIMARY KEY,
  city_id   integer NOT NULL REFERENCES cities(id),
  name_fr   text NOT NULL,
  name_ar   text,
  slug      text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE(city_id, slug)
);
```

---

### service_requests

```sql
CREATE TABLE service_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid NOT NULL REFERENCES profiles(id),
  category_id     integer NOT NULL REFERENCES categories(id),
  description     text NOT NULL CHECK (char_length(description) >= 10),
  city_id         integer NOT NULL REFERENCES cities(id),
  neighborhood    text,                         -- free text
  urgency         urgency_level NOT NULL,
  budget_note     text,                         -- optional freeform budget
  status          request_status NOT NULL DEFAULT 'open',
  expires_at      timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  submitted_at    timestamptz NOT NULL DEFAULT now(),
  hired_at        timestamptz,
  completed_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX service_requests_customer_idx ON service_requests(customer_id);
CREATE INDEX service_requests_category_idx ON service_requests(category_id);
CREATE INDEX service_requests_city_idx ON service_requests(city_id);
CREATE INDEX service_requests_status_idx ON service_requests(status);
CREATE INDEX service_requests_expires_idx ON service_requests(expires_at)
  WHERE status IN ('open', 'matched');
```

---

### request_images

```sql
CREATE TABLE request_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id  uuid NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  url         text NOT NULL,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX request_images_request_idx ON request_images(request_id);
```

---

### matches

```sql
CREATE TABLE matches (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id      uuid NOT NULL REFERENCES service_requests(id),
  provider_id     uuid NOT NULL REFERENCES provider_profiles(id),
  match_score     numeric(6,2) NOT NULL,        -- computed score at time of match
  status          match_status NOT NULL DEFAULT 'pending',
  notified_at     timestamptz,                  -- when provider was notified
  viewed_at       timestamptz,
  responded_at    timestamptz,
  selected_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(request_id, provider_id)
);

CREATE INDEX matches_request_idx ON matches(request_id);
CREATE INDEX matches_provider_idx ON matches(provider_id);
CREATE INDEX matches_status_idx ON matches(status);
```

---

### conversations

```sql
CREATE TABLE conversations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id      uuid NOT NULL REFERENCES service_requests(id),
  provider_id     uuid NOT NULL REFERENCES provider_profiles(id),
  customer_id     uuid NOT NULL REFERENCES profiles(id),
  created_at      timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz,
  UNIQUE(request_id, provider_id)
);

CREATE INDEX conversations_request_idx ON conversations(request_id);
CREATE INDEX conversations_provider_idx ON conversations(provider_id);
CREATE INDEX conversations_customer_idx ON conversations(customer_id);
```

---

### messages

```sql
CREATE TABLE messages (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   uuid NOT NULL REFERENCES conversations(id),
  sender_id         uuid NOT NULL REFERENCES profiles(id),
  message_type      message_type NOT NULL DEFAULT 'text',
  content           text,                       -- for text messages
  offer_id          uuid REFERENCES offers(id), -- for offer messages
  is_read           boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX messages_conversation_idx ON messages(conversation_id);
CREATE INDEX messages_sender_idx ON messages(sender_id);
CREATE INDEX messages_created_idx ON messages(created_at);
```

---

### offers

```sql
CREATE TABLE offers (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   uuid NOT NULL REFERENCES conversations(id),
  provider_id       uuid NOT NULL REFERENCES provider_profiles(id),
  price_mad         numeric(10,2) NOT NULL,
  available_date    date,
  note              text,
  status            offer_status NOT NULL DEFAULT 'pending',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX offers_conversation_idx ON offers(conversation_id);
```

---

### jobs

```sql
CREATE TABLE jobs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id      uuid NOT NULL UNIQUE REFERENCES service_requests(id),
  provider_id     uuid NOT NULL REFERENCES provider_profiles(id),
  customer_id     uuid NOT NULL REFERENCES profiles(id),
  offer_id        uuid REFERENCES offers(id),
  status          job_status NOT NULL DEFAULT 'hired',
  hired_at        timestamptz NOT NULL DEFAULT now(),
  started_at      timestamptz,
  completed_at    timestamptz,
  customer_confirmed_complete boolean NOT NULL DEFAULT false,
  provider_confirmed_complete boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX jobs_request_idx ON jobs(request_id);
CREATE INDEX jobs_provider_idx ON jobs(provider_id);
CREATE INDEX jobs_customer_idx ON jobs(customer_id);
CREATE INDEX jobs_status_idx ON jobs(status);
```

---

### reviews

```sql
CREATE TABLE reviews (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          uuid NOT NULL REFERENCES jobs(id),
  reviewer_id     uuid NOT NULL REFERENCES profiles(id),
  reviewee_id     uuid NOT NULL REFERENCES profiles(id),
  rating          smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         text CHECK (char_length(comment) <= 300),
  is_public       boolean NOT NULL DEFAULT true,  -- false for provider→customer reviews
  status          review_status NOT NULL DEFAULT 'pending',
  published_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE(job_id, reviewer_id)
);

CREATE INDEX reviews_reviewee_idx ON reviews(reviewee_id);
CREATE INDEX reviews_job_idx ON reviews(job_id);
CREATE INDEX reviews_status_idx ON reviews(status);
```

---

### notifications

```sql
CREATE TABLE notifications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id),
  type            notification_type NOT NULL,
  title           text NOT NULL,
  body            text,
  data            jsonb,                         -- contextual data (requestId, etc.)
  is_read         boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notifications_user_idx ON notifications(user_id);
CREATE INDEX notifications_unread_idx ON notifications(user_id, is_read) WHERE is_read = false;
```

---

### moderation_flags

```sql
CREATE TABLE moderation_flags (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id     uuid NOT NULL REFERENCES profiles(id),
  target_type     text NOT NULL,                 -- 'user' | 'review' | 'message' | 'photo'
  target_id       text NOT NULL,                 -- UUID of target entity
  reason          text NOT NULL,
  notes           text,
  status          text NOT NULL DEFAULT 'open',  -- 'open' | 'resolved' | 'dismissed'
  resolved_by     uuid REFERENCES profiles(id),
  resolved_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX moderation_flags_status_idx ON moderation_flags(status);
CREATE INDEX moderation_flags_target_idx ON moderation_flags(target_type, target_id);
```

---

### admin_actions (audit log)

```sql
CREATE TABLE admin_actions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id        uuid NOT NULL REFERENCES profiles(id),
  action          moderation_action NOT NULL,
  target_type     text NOT NULL,
  target_id       text NOT NULL,
  notes           text,
  metadata        jsonb,                         -- before/after state snapshots
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX admin_actions_admin_idx ON admin_actions(admin_id);
CREATE INDEX admin_actions_target_idx ON admin_actions(target_type, target_id);
CREATE INDEX admin_actions_created_idx ON admin_actions(created_at);
```

---

## Key Relationships

```
profiles
  ├── customer_profiles (1:1)
  └── provider_profiles (1:1)
      ├── provider_trades (1:N)
      ├── provider_photos (1:N)
      └── provider_verifications (1:N)

service_requests
  ├── request_images (1:N)
  ├── matches (1:N → provider_profiles)
  ├── conversations (1:N)
  │   └── messages (1:N)
  │       └── offers (optional reference)
  └── jobs (1:1)
      └── reviews (1:N)

categories
  ├── category_translations (1:N)
  └── category_synonyms (1:N)
```

---

## Migration Strategy

1. **Supabase migrations** — all schema changes in `/supabase/migrations/` as timestamped SQL files
2. **Never edit applied migrations** — create new migration files for changes
3. **Local development** — `supabase db reset` applies all migrations + seeds
4. **Staging deployment** — `supabase db push` before code deploy
5. **Production deployment** — migrations run in same deployment pipeline, before code deploy
6. **Rollback** — downward migrations for every migration in V1 (during rapid iteration phase)

---

## Seed Data

Initial seed data for local/staging:

```sql
-- 6 categories with FR + AR translations
-- Casablanca city
-- 10 Casablanca neighborhoods
-- 1 admin account
-- 5 test customer accounts
-- 10 test provider accounts (2 per category, mix of verified/pending)
-- 20 test service requests
-- Various match states for testing
```

Seed file: `/supabase/seed.sql`
