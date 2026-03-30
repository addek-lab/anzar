# Recommended Implementation Order

## Guiding Principle

Build in dependency order. Ship the scaffolding before the features. Never build a feature whose dependencies don't exist yet.

**Sequence rule:** Infrastructure → Auth → Core domain → Matching → Communication → Admin → Polish

---

## Implementation Phases

### Phase 0: Project Scaffolding (Days 1–3)

Set up the project so all developers can work in parallel from Day 4.

1. Initialize Next.js 14 project (App Router, TypeScript strict)
2. Configure Tailwind CSS + shadcn/ui base
3. Set up Supabase local development (Docker + CLI)
4. Create `/supabase/migrations/` folder with first migration (profiles table)
5. Configure ESLint + Prettier + Husky pre-commit hooks
6. Set up Vitest for unit tests
7. Set up Playwright for E2E tests
8. Create `.env.example` with all required variables
9. Set up GitHub repo with branch protection
10. Connect Vercel to GitHub repo (preview deployments from PR day 1)
11. Configure Sentry (basic setup)
12. Configure PostHog (basic setup)
13. Set up i18n (next-intl) with FR/AR locale files skeleton
14. Create base layout with RTL direction switching
15. Set up CI pipeline (GitHub Actions)

**Output:** Working scaffolding. All engineers can start.

---

### Phase 1: Auth + User Foundation (Days 4–10)

Build auth first because everything else depends on knowing who the user is.

1. Database: `profiles`, `customer_profiles`, `provider_profiles` tables + RLS
2. Supabase Auth OTP configuration (Twilio SMS)
3. Phone login screen (SCR-AUTH-02)
4. OTP verification screen (SCR-AUTH-03)
5. Language selection screen (SCR-AUTH-01)
6. Account type selection (SCR-AUTH-04)
7. Middleware: session check, role routing
8. Auth API routes: `send-otp`, `verify-otp`, `set-user-type`, `logout`
9. Session management (httpOnly cookie handling)
10. i18n: all auth strings in FR + AR

**Test gates:**
- Auth flow works end-to-end on mobile browser
- Wrong OTP shows error
- Rate limiting works
- Role routing works (customer → /app, provider → /pro)

---

### Phase 2: Core Domain (Days 11–20)

Build the data layer for requests, categories, and location.

1. Database: `categories`, `category_translations`, `category_synonyms`, `cities`, `neighborhoods`
2. Seed data: 6 categories (FR+AR), Casablanca city, neighborhoods
3. Admin: categories management UI (basic)
4. Customer: request creation wizard (SCR-CUST-02 through 07)
5. Image upload pipeline (Supabase Storage, WebP conversion)
6. Request creation API route
7. Request list page (SCR-CUST-10)
8. Request detail page — skeleton (SCR-CUST-08, no matches yet)
9. i18n: all request creation strings in FR + AR

**Test gates:**
- Complete request wizard in < 60 seconds
- Image upload works on mobile (including HEIC from iOS)
- RTL layout correct on all wizard steps
- Request stored in database with correct fields

---

### Phase 3: Provider Foundation (Days 15–22)

Can overlap with Phase 2 (separate developer).

1. Database: `provider_trades`, `provider_photos`, `provider_verifications` tables
2. Provider onboarding wizard (SCR-PRO-01 through 08)
3. Document upload (private Supabase Storage bucket)
4. Provider onboarding API route
5. Provider pending screen (SCR-PRO-08)
6. Public provider profile page (SCR-PUB, /artisan/[slug])
7. Provider profile API (public)
8. i18n: all provider onboarding strings in FR + AR

**Test gates:**
- Provider can complete onboarding on mobile
- Documents upload to private bucket
- Provider sees pending screen after submission
- Public profile page renders correctly

---

### Phase 4: Admin Foundation (Days 20–26)

Admin is needed before any real provider can be verified and matched.

1. Admin auth (email/password, separate from OTP)
2. Admin dashboard skeleton (SCR-ADMIN-02)
3. Provider verification queue (SCR-ADMIN-03)
4. Provider detail view with document access (SCR-ADMIN-04)
5. Approve/reject provider API route
6. SMS notification to provider on decision
7. `provider_status` state machine in database
8. Audit log (admin_actions table) for all verification decisions
9. Basic user management list (SCR-ADMIN-05)

**Test gates:**
- Admin can view pending provider with documents
- Approve → provider status becomes verified
- Reject → provider receives SMS with reason
- All actions logged in audit_log

---

### Phase 5: Matching Engine (Days 24–30)

Now that providers can be verified, build the matching.

1. Database: `matches` table + indexes
2. Matching algorithm implementation (see `12-matching-engine.md`)
3. Match API route (triggered on request submission)
4. Match display on request detail page (SCR-CUST-08, now with providers)
5. Provider notification on new match (in-app + SMS)
6. Lead inbox for provider (SCR-PRO-09)
7. Lead detail view for provider (SCR-PRO-10)
8. Match status tracking (pending → viewed → responded/declined)

**Test gates:**
- Submit request → 3 providers matched within 2 seconds
- Suspended provider not in match pool
- Pending provider not in match pool
- Provider receives SMS notification
- Provider sees new lead in inbox

---

### Phase 6: Communication (Days 28–36)

Build the offer and chat system.

1. Database: `conversations`, `messages`, `offers` tables
2. In-app chat (Supabase Realtime subscription)
3. Chat UI — customer side (SCR-CUST-11)
4. Chat UI — provider side (SCR-PRO-14)
5. Offer form (SCR-PRO-11)
6. Offer display card in chat
7. Offer accept/decline (customer)
8. WhatsApp contact button (reveals after match)
9. Call contact button
10. Message API routes
11. Offer API routes
12. Unread message count in navigation

**Test gates:**
- Messages deliver in < 1 second via WebSocket
- Offer sent by provider appears as special card in customer's chat
- Accepting offer → job created, request status → hired
- Customer phone revealed to provider after offer acceptance

---

### Phase 7: Job Lifecycle + Reviews (Days 34–40)

1. Database: `jobs`, `reviews` tables
2. Job status transitions (hired → in_progress → completed)
3. Job status UI in customer and provider views
4. Mark complete (both sides)
5. Auto-complete logic (7-day inactivity)
6. Review prompt after completion
7. Review submission UI (SCR-CUST-14)
8. Review API route
9. Review moderation queue in admin (SCR-ADMIN-07)
10. Provider stats update on review (avg_rating, review_count)

**Test gates:**
- Both sides can mark job complete
- Review prompt appears after completion
- Review goes to pending status
- Admin can approve/reject review
- Published review appears on provider profile

---

### Phase 8: Notifications (Days 38–44)

1. Database: `notifications` table
2. In-app notification center (SCR-CUST-12)
3. Notification creation for all events (see `11-api-specification.md` trigger list)
4. Unread count in navigation
5. Mark as read
6. SMS notifications for critical events

**Test gates:**
- All notification types fire correctly
- Unread count shows in nav
- Marking read clears the count

---

### Phase 9: Polish and Hardening (Days 42–50)

The final phase before launch readiness.

1. **All empty states** implemented (every list, every section)
2. **All loading/skeleton states** implemented
3. **All error states** implemented (with recovery paths)
4. **Offline/network failure handling** (request draft save, retry)
5. **RTL visual audit** — systematic review of every screen in Arabic
6. **Mobile performance audit** — Lighthouse on all critical pages
7. **Security review** — RLS policies second review, admin access test
8. **Accessibility audit** — WCAG AA check on critical flows
9. **i18n completeness check** — no hardcoded strings, key parity FR/AR
10. **Admin tools completion** — synonym management, city management, fraud dashboard
11. **Performance monitoring** — set Sentry alerts, PostHog dashboards
12. **Seed data** — production seed for categories, Casablanca setup

---

## Parallelization Strategy

With 2 full-stack engineers + 1 designer:

```
Engineer A:  Auth → Request Creation → Matching Engine → Chat (server)
Engineer B:  Provider Onboarding → Admin → Job Lifecycle → Reviews
Designer:    Design system → Screens per phase (1 sprint ahead of engineers)
```

Phases 2 and 3 can run in parallel between the two engineers.

---

## Critical Path

The sequence that cannot be parallelized or skipped:

```
Auth → Request Creation → Matching Engine → Chat → Job Lifecycle → Reviews
                    ↑
              Admin + Provider Verification (must be ready before matching works)
```

**If timeline slips:** Cut polish, not functionality. A basic-looking app that works beats a beautiful app with broken flows.
