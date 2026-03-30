# Technical Architecture

## Architecture Overview

### Chosen Pattern: Integrated Monolith with BaaS

**Decision:** Next.js 14 App Router + Supabase BaaS

**Why not microservices:** The platform is a two-sided marketplace with tight data coupling between users, requests, matches, and messages. Microservices at MVP scale adds operational complexity without solving real problems. A well-structured monolith with clean module boundaries is correct for this stage.

**Why Supabase over custom backend:** Supabase gives us:
- PostgreSQL (production-grade, not proprietary)
- Row Level Security (replaces most manual auth middleware)
- Realtime subscriptions (WebSocket for chat)
- Storage with CDN (image uploads)
- Edge Functions if needed (Deno runtime, near-user latency)
- Phone/OTP auth built in (Twilio integration configurable)
- Local development support (Supabase CLI)

We own the data. We own the schema. We can migrate off if needed. It is not a vendor lock-in trap.

---

## System Architecture Diagram (Text)

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                          │
│                                                           │
│  Mobile Browser / PWA          Desktop Browser            │
│  (Customer App, Provider App)  (Admin App, Support App)  │
└──────────────────────┬────────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼────────────────────────────────────┐
│                    VERCEL EDGE NETWORK                     │
│                                                            │
│  Next.js App Router (Server Components + API Routes)       │
│  ├─ /app/* — Customer app (RSC + Client Components)       │
│  ├─ /pro/* — Provider app (RSC + Client Components)       │
│  ├─ /admin/* — Admin app (RSC + Client Components)        │
│  ├─ /api/* — API Routes (authentication, mutations)       │
│  └─ / (public pages — SSR for SEO)                        │
└──────────────────────┬────────────────────────────────────┘
                       │ Supabase Client / Service Role Key
┌──────────────────────▼────────────────────────────────────┐
│                    SUPABASE (BaaS)                          │
│                                                            │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  PostgreSQL │  │  Auth (OTP)  │  │  Storage (CDN)   │  │
│  │  + RLS      │  │  + Sessions  │  │  request-images  │  │
│  └─────────────┘  └──────────────┘  │  provider-photos │  │
│                                     │  documents       │  │
│  ┌─────────────────────────────┐    └──────────────────┘  │
│  │  Realtime (WebSocket)       │                          │
│  │  messages channel           │                          │
│  └─────────────────────────────┘                          │
└───────────────────────────────────────────────────────────┘
                       │
┌──────────────────────▼────────────────────────────────────┐
│                  EXTERNAL SERVICES                          │
│                                                            │
│  Twilio / SMS provider (OTP delivery — Moroccan numbers)  │
│  Sentry (error tracking)                                  │
│  PostHog (product analytics)                              │
│  Resend (transactional email — for admin/support only)    │
└───────────────────────────────────────────────────────────┘
```

---

## Next.js App Router Structure

```
/app
├── (public)/               — unauthenticated marketing pages
│   ├── page.tsx            — Landing page (SSR for SEO)
│   ├── comment-ca-marche/
│   ├── categories/
│   ├── confiance/
│   ├── artisans/
│   └── artisan/[slug]/     — Public provider profile (SSR)
│
├── (auth)/                 — Auth routes (no layout chrome)
│   ├── login/
│   ├── otp/
│   └── type/
│
├── app/                    — Customer app (protected)
│   ├── layout.tsx          — Customer shell (bottom nav, header)
│   ├── home/
│   ├── request/
│   │   ├── new/
│   │   └── [id]/
│   ├── requests/
│   ├── messages/
│   │   └── [requestId]/[providerId]/
│   ├── notifications/
│   ├── provider/[id]/
│   └── profile/
│
├── pro/                    — Provider app (protected)
│   ├── layout.tsx          — Provider shell
│   ├── onboarding/
│   ├── leads/
│   │   └── [id]/
│   ├── jobs/
│   ├── messages/
│   ├── profile/
│   ├── performance/
│   └── settings/
│
├── admin/                  — Admin app (protected, admin role)
│   ├── layout.tsx
│   ├── dashboard/
│   ├── providers/
│   ├── users/
│   ├── requests/
│   ├── reviews/
│   ├── disputes/
│   ├── taxonomy/
│   ├── fraud/
│   └── audit/
│
├── support/                — Support app (protected, support role)
│
└── api/                    — API routes
    ├── auth/
    ├── requests/
    ├── matches/
    ├── offers/
    ├── messages/
    ├── reviews/
    ├── providers/
    ├── admin/
    └── webhooks/
```

---

## Authentication Architecture

### Auth Flow (Supabase Auth with OTP)

```
1. User enters phone number
2. Next.js API route → supabase.auth.signInWithOtp({ phone })
3. Supabase triggers SMS via configured SMS provider (Twilio)
4. User enters OTP in app
5. Next.js API route → supabase.auth.verifyOtp({ phone, token, type: 'sms' })
6. Supabase returns session (access_token + refresh_token)
7. Session stored in httpOnly cookie (via Supabase SSR helpers)
8. All subsequent requests include session cookie
9. Server components read session via createServerClient()
10. RLS policies on PostgreSQL enforce data access rules
```

### Middleware (Next.js)

```typescript
// middleware.ts
// Runs on every request to protected routes
// Checks session validity
// Redirects based on role (user_type from profiles table)
// Refreshes session if near expiry
```

### Role Enforcement

Roles are stored in the `profiles` table as an enum, not in JWT (avoid stale roles issue). Middleware reads role from database on each request to protected routes (cached via edge KV if performance demands).

Admin and support users have separate auth path: email/password (no OTP) — stored in Supabase Auth with custom admin claims.

---

## Data Access Layer

### Supabase Row Level Security Strategy

All tables enforce RLS. Policies are:

```sql
-- Example: requests table
-- Customers can see only their own requests
CREATE POLICY "customer_own_requests"
ON requests FOR SELECT
USING (auth.uid() = customer_id);

-- Providers can see requests they are matched to
CREATE POLICY "provider_matched_requests"
ON requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM matches
    WHERE matches.request_id = requests.id
    AND matches.provider_id = auth.uid()
  )
);

-- Admin service role bypasses RLS
-- (used only server-side with service role key, never exposed to client)
```

### Server-Side Data Fetching

React Server Components fetch data server-side using the Supabase server client (with service role for admin operations, with user session for user operations).

Client Components use SWR or React Query for client-side data with Supabase anon key (RLS enforced).

---

## Matching Engine Architecture

**Location:** Next.js API Route `/api/requests/[id]/match` OR Supabase Edge Function

**Execution:** Synchronous, triggered on request submission.

**Implementation:** See `12-matching-engine.md` for full design.

**Performance contract:** < 2 seconds for scoring up to 500 providers.

---

## Chat / Realtime Architecture

**Technology:** Supabase Realtime (Postgres Changes + Broadcast)

```typescript
// Client subscribes to channel for a specific conversation
const channel = supabase
  .channel(`conversation:${requestId}:${providerId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, (payload) => {
    // Update UI with new message
  })
  .subscribe()
```

**Message delivery guarantee:** At-least-once. Duplicate prevention via message_id idempotency.

**Fallback:** If WebSocket connection drops, client reconnects automatically. Message input is queued and sent on reconnect.

---

## File Storage Architecture

**Technology:** Supabase Storage

**Bucket structure:**
```
request-images/      — Customer uploaded photos for requests
  {requestId}/{imageId}.webp

provider-photos/     — Provider work gallery
  {providerId}/{photoId}.webp

provider-documents/  — Verification documents (private bucket)
  {providerId}/{documentId}.{ext}

avatars/             — User profile photos
  {userId}.webp
```

**Access control:**
- `request-images`: public read (matched providers must see request photos)
- `provider-photos`: public read (shown on profiles)
- `provider-documents`: private, service role only (admin verification use)
- `avatars`: public read

**Upload pipeline:**
1. Client uploads to Supabase Storage via signed upload URL
2. Supabase Storage policy validates file type and size
3. Next.js API route receives upload completion callback
4. Triggers WebP conversion via Supabase Edge Function (or client-side via Canvas API for lighter images)
5. Stores final URL in database

---

## Search Architecture (V1)

**Technology:** PostgreSQL full-text search + synonyms table

```sql
-- Full-text search on categories and synonyms
-- Supports French, Arabic, Darija (via synonym expansion)

-- Synonyms table maps input terms to category IDs
-- Example:
-- "plombier", "سباك", "sbak", "snak" → category_id: 2 (Plumbing)
```

**No ElasticSearch or external search service in V1.** The search volume does not justify the operational overhead. PostgreSQL with GIN indexes is sufficient.

---

## Notification Architecture

**V1 notifications:**
1. In-app notifications (stored in `notifications` table, read via Supabase Realtime)
2. SMS notifications (critical actions only: new match, verification decision)

**SMS provider:** Twilio (Supabase Auth SMS backend). Custom SMS via Twilio API for non-auth notifications.

**Notification triggers:**
- Provider: new lead match → SMS + in-app
- Customer: provider responded → in-app (SMS optional)
- Provider: verification approved/rejected → SMS
- Customer: job completed → in-app

**Push notifications (PWA):** V1.1 via Web Push API + service worker.

---

## Security Architecture Summary

(Full details in `14-security-checklist.md`)

Key decisions:
1. **Supabase RLS is the primary data security layer** — not application-level checks alone
2. **Service role key never exposed to client** — only used server-side in API routes
3. **All mutations go through Next.js API Routes** — not direct Supabase client mutations from browser (for auditability)
4. **Provider documents are in private storage** — never publicly accessible URLs
5. **Phone numbers are never exposed** in API responses to unauthorized parties
6. **OTP rate limiting** enforced at Supabase level + application level

---

## Technology Decision Log

| Decision | Choice | Alternative Considered | Reason |
|---|---|---|---|
| Frontend framework | Next.js 14 (App Router) | Remix, SvelteKit | Ecosystem size, Vercel integration, RSC for mobile perf |
| Styling | Tailwind CSS + shadcn/ui | Chakra UI, MUI | No runtime CSS-in-JS cost, excellent RTL support, full control |
| BaaS | Supabase | Firebase, PocketBase | PostgreSQL ownership, RLS, no vendor lock, Realtime |
| Auth | Supabase Auth (OTP) | Clerk, Auth0 | Built into Supabase, phone OTP native, cost |
| Realtime | Supabase Realtime | Pusher, Ably | Built into Supabase, no extra service |
| Storage | Supabase Storage | AWS S3 + CloudFront | Built into Supabase, integrated CDN |
| Deployment | Vercel | Railway, Fly.io | Preview deployments, Edge Network, Next.js native |
| Error tracking | Sentry | Datadog, Rollbar | Cost, Next.js integration, free tier sufficient |
| Analytics | PostHog | Mixpanel, Amplitude | Open source option, self-hostable if needed, generous free tier |
| i18n | next-intl | next-i18next, react-intl | App Router native support, server component support |
| ORM | Supabase client (generated types) + raw SQL where needed | Prisma, Drizzle | Supabase typed client is sufficient; avoid ORM overhead |
