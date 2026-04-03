-- ================================================================
-- Migration 008: Storage buckets + work photos table
-- ================================================================

-- Work photos for provider portfolios
create table if not exists work_photos (
  id uuid primary key default uuid_generate_v4(),
  provider_id uuid not null references provider_profiles(id) on delete cascade,
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

create index idx_work_photos_provider on work_photos(provider_id);
alter table work_photos enable row level security;

create policy "work_photos_provider_own" on work_photos for all
  using (exists (
    select 1 from provider_profiles pp
    where pp.id = work_photos.provider_id and pp.profile_id = auth.uid()
  ));

create policy "work_photos_public_read" on work_photos for select
  using (exists (
    select 1 from provider_profiles pp
    where pp.id = work_photos.provider_id and pp.status = 'verified'
  ));

-- Request images table (photos uploaded with service requests)
create table if not exists request_images (
  id uuid primary key default uuid_generate_v4(),
  request_id uuid not null references service_requests(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index idx_request_images_request on request_images(request_id);
alter table request_images enable row level security;

create policy "request_images_customer_own" on request_images for all
  using (exists (
    select 1 from service_requests sr
    where sr.id = request_images.request_id and sr.customer_id = auth.uid()
  ));

create policy "request_images_provider_view" on request_images for select
  using (exists (
    select 1 from service_requests sr
    join matches m on m.request_id = sr.id
    join provider_profiles pp on pp.id = m.provider_id
    where sr.id = request_images.request_id and pp.profile_id = auth.uid()
  ));

-- Note: Storage buckets must be created via Supabase Dashboard or CLI:
-- Bucket: "provider-docs"    (private) — for CIN identity documents
-- Bucket: "work-photos"      (public)  — for provider portfolio photos
-- Bucket: "request-images"   (private) — for customer request photos
