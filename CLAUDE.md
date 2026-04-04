# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Node is at `/opt/homebrew/bin/node`. The standard `npm` / `npx` shims don't work in this shell — always use the full path or prefix with `PATH="/opt/homebrew/bin:$PATH"`.

```bash
# Development
PATH="/opt/homebrew/bin:$PATH" npm run dev          # start dev server (port 3000)
PATH="/opt/homebrew/bin:$PATH" npm run build        # production build (also type-checks)
PATH="/opt/homebrew/bin:$PATH" npm run lint         # ESLint via next lint

# Build is the only way to catch TypeScript errors — there are no separate tsc or test scripts
PATH="/opt/homebrew/bin:$PATH" /opt/homebrew/bin/node node_modules/.bin/next build
```

There are no automated tests. Verify changes by running `next build` (it fails on TypeScript errors and lint).

## Architecture Overview

Anzar is a **MyHammer-style home services marketplace for Morocco** — customers post jobs, providers (artisans) make offers, admin verifies providers.

**Stack:** Next.js 14 App Router · Supabase (Postgres + Auth + RLS) · Tailwind CSS · next-intl (FR/AR) · Zod v4 · Vercel

### Route Groups

```
src/app/
  (auth)/auth/          ← language picker → phone OTP → role selection
  (customer)/app/       ← customer dashboard (5-tab mobile nav)
  (provider)/pro/       ← provider dashboard (5-tab mobile nav)
  (admin)/admin/        ← admin dashboard (desktop sidebar + mobile tabs)
  api/v1/               ← all REST API routes
  page.tsx              ← public landing page
```

Middleware (`middleware.ts`) enforces role-based routing using `user.app_metadata.role` from the Supabase JWT — no DB round-trip per request. Roles: `customer` → `/app`, `provider` → `/pro`, `admin` → `/admin`.

### Auth Flow

1. `/auth` — pick language, detect existing session → redirect or continue
2. `/auth/phone` — Moroccan phone (`+212[5-7]XXXXXXXX`) → SMS OTP via Supabase
3. `/auth/verify` — 6-digit code → `verifyOtp` → session cookie set
4. `/auth/type` — new users pick role + enter name → `POST /api/v1/auth/set-type`

`set-type` uses the **service role key** to bypass RLS, writes to `profiles`, and calls `admin.auth.admin.updateUserById()` to store the role in `app_metadata` so the middleware can read it from the JWT.

`/api/v1/auth/login` (email+password) is **disabled in production** (returns 404) — it exists only for local dev without a real SIM.

### Database (Supabase)

Key tables and their relationships:
```
auth.users
  └─ profiles (user_type, full_name, phone)
       ├─ customer_profiles
       └─ provider_profiles (status: pending→verified→rejected/suspended)
            └─ matches → service_requests ← customers
                  └─ conversations → messages, offers
                        └─ jobs → reviews
```

Migrations live in `supabase/migrations/`. Seed data in `supabase/seed/001_seed_data.sql` uses **version-0 UUIDs** (`00000000-0000-0000-0000-000000000001`). Zod v4's `.uuid()` rejects these — all API routes that validate IDs from the DB use `.string().min(1)` instead of `.string().uuid()`.

### API Security Layer

`src/lib/api-guard.ts` provides three helpers used in every route:
- `requireJson(req)` — returns 415 if Content-Type ≠ `application/json`
- `requireAdmin(req)` — checks `app_metadata.role`, falls back to DB for legacy users
- `safeError(code, detail, status)` — hides raw DB error messages in production

Admin API routes use `requireAdmin()` instead of manual profile queries. All state-changing routes call `requireJson()` first.

### Matching Engine (`src/lib/matching.ts`)

Called asynchronously (non-blocking) after a customer posts a request. Finds up to 3 verified providers in the same city with matching `trade_ids`, scores them (response rate 30% · rating 25% · recent jobs 20% · profile completeness 10%), inserts into `matches`, and creates notifications. Providers with ≥ 5 active leads are excluded.

### i18n

Locale is stored in a `locale` cookie (not URL-based). `i18n.ts` reads it server-side. Client components use `useLocale()` from `src/hooks/useLocale.ts` for `isRTL`. All user-facing strings are in `public/locales/fr/common.json` and `public/locales/ar/common.json`. Bilingual DB columns follow the pattern `name_fr` / `name_ar`, `title_fr` / `title_ar`, etc.

Language switching: use `<a href>` (not Next `<Link>`) so the full page reloads and the server picks up the new cookie. `<Link>` client-side navigation skips the server read.

### Supabase Clients

Three clients, each for a specific context:

| Import | File | Key used | Use when |
|--------|------|----------|----------|
| `createClient()` | `lib/supabase/server.ts` | anon | Server Components, API routes (respects RLS) |
| `createAdminClient()` | `lib/supabase/server.ts` | service role | Admin operations that must bypass RLS |
| `createClient()` | `lib/supabase/client.ts` | anon | `'use client'` components only |

Never use `getSession()` for auth checks — always `getUser()` (validates the JWT server-side).

### Environment Variables

Required in `.env.local` and Vercel:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        # server-only, never expose to client
NEXT_PUBLIC_SITE_URL             # used by logout redirect (defaults to localhost:3000)
```

### Design Tokens

Brand colors: `#1A6B4A` (green, primary) · `#E8A838` (amber, accent). Both appear in Tailwind classes as arbitrary values. No Tailwind config extension for these — use the hex directly.

Admin users can only be created by manually setting `user_type = 'admin'` in the `profiles` table via the Supabase dashboard. The `set-type` API only accepts `customer` or `provider`.
