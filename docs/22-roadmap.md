# Build Roadmap

## Timeline Overview

| Phase | Duration | Weeks | Milestone |
|---|---|---|---|
| Phase 0: Scaffolding | 3 days | 0.5 | All engineers unblocked |
| Phase 1: Auth | 7 days | 1.5 | Login works end-to-end |
| Phase 2+3: Domain + Provider | 12 days | 2.5 | Request creation + provider onboarding |
| Phase 4: Admin | 6 days | 1.5 | Verification workflow live |
| Phase 5: Matching | 6 days | 1.5 | First match working |
| Phase 6: Communication | 9 days | 2 | Full offer/chat loop |
| Phase 7: Jobs + Reviews | 6 days | 1.5 | Complete transaction loop |
| Phase 8: Notifications | 7 days | 1.5 | All notifications live |
| Phase 9: Polish + QA | 9 days | 2 | Launch-ready |
| **Total** | **~65 days** | **~10 weeks** | **Production ready** |

---

## Sprint-Level Roadmap (10 Sprints × 1 week)

### Sprint 1 (Week 1): Foundation
**Focus:** Project setup, database, auth

| # | Task | Owner |
|---|---|---|
| 1.1 | Initialize Next.js 14 project with TypeScript, Tailwind, shadcn/ui | Eng Lead |
| 1.2 | Supabase project setup (local + staging + prod) | DevOps |
| 1.3 | Database migration 001: profiles, customer_profiles, provider_profiles | Eng Lead |
| 1.4 | Supabase Auth OTP configuration (Twilio Morocco) | Eng Lead |
| 1.5 | Auth API routes: send-otp, verify-otp, set-user-type, logout | Eng Lead |
| 1.6 | next-intl setup, FR/AR locale files skeleton | Eng 2 |
| 1.7 | RTL direction switching (html dir attribute based on locale) | Eng 2 |
| 1.8 | Language selection screen (SCR-AUTH-01) | Eng 2 |
| 1.9 | Phone login + OTP screens (SCR-AUTH-02, 03) | Eng 2 |
| 1.10 | CI pipeline (GitHub Actions: lint, type-check, test, build) | DevOps |
| 1.11 | Design: Design system tokens, typography, color system | Designer |

**Sprint Goal:** Developer can log in with OTP in French and Arabic

---

### Sprint 2 (Week 2): Core Screens + Provider Onboarding
**Focus:** Account type, customer home, provider onboarding

| # | Task | Owner |
|---|---|---|
| 2.1 | Account type selection screen + routing (SCR-AUTH-04) | Eng 2 |
| 2.2 | Customer home screen (SCR-CUST-01) | Eng 2 |
| 2.3 | Database migration 002: categories, cities, neighborhoods, translations, synonyms | Eng Lead |
| 2.4 | Seed data: 6 categories (FR+AR), Casablanca city | Eng Lead |
| 2.5 | Categories API route (GET /categories) | Eng Lead |
| 2.6 | Provider onboarding wizard Steps 1–4 (SCR-PRO-01 to 04) | Eng 2 |
| 2.7 | Provider onboarding wizard Steps 5–7 (SCR-PRO-05 to 07) | Eng 2 |
| 2.8 | Provider onboarding API route | Eng Lead |
| 2.9 | Supabase Storage buckets configuration + policies | DevOps |
| 2.10 | Document upload (private bucket) | Eng Lead |
| 2.11 | Design: Auth screens, provider onboarding screens | Designer |

**Sprint Goal:** Provider can complete full onboarding and submit for verification

---

### Sprint 3 (Week 3): Request Creation + Admin Core
**Focus:** Customer request wizard, admin verification

| # | Task | Owner |
|---|---|---|
| 3.1 | Request creation wizard (SCR-CUST-02 through 06) | Eng 2 |
| 3.2 | Image upload pipeline (client → Supabase Storage → WebP) | Eng Lead |
| 3.3 | Database migration 003: service_requests, request_images | Eng Lead |
| 3.4 | Request creation API route | Eng Lead |
| 3.5 | Request confirmation screen (SCR-CUST-07) | Eng 2 |
| 3.6 | Admin login (email/password) | Eng Lead |
| 3.7 | Admin layout shell | Eng 2 |
| 3.8 | Admin verification queue (SCR-ADMIN-03) | Eng 2 |
| 3.9 | Admin provider detail + document viewer (SCR-ADMIN-04) | Eng 2 |
| 3.10 | Approve/reject API route + SMS notification + audit log | Eng Lead |
| 3.11 | Design: request wizard screens, admin queue | Designer |

**Sprint Goal:** Customer can create a request. Admin can verify providers.

---

### Sprint 4 (Week 4): Matching Engine
**Focus:** Matching logic, lead inbox, provider notifications

| # | Task | Owner |
|---|---|---|
| 4.1 | Database migration 004: matches table | Eng Lead |
| 4.2 | Matching engine implementation (eligibility filter + scoring) | Eng Lead |
| 4.3 | Matching API route (triggered on request submit) | Eng Lead |
| 4.4 | Request detail page — with matches display (SCR-CUST-08) | Eng 2 |
| 4.5 | Provider card component (mini profile with trust signals) | Eng 2 |
| 4.6 | Provider notification: new lead (in-app + SMS) | Eng Lead |
| 4.7 | Lead inbox (SCR-PRO-09) | Eng 2 |
| 4.8 | Lead detail view (SCR-PRO-10) | Eng 2 |
| 4.9 | Lead decline API route | Eng Lead |
| 4.10 | Matching engine unit tests | Eng Lead |
| 4.11 | Design: provider profile card, matched providers list | Designer |

**Sprint Goal:** Full loop: request → matched providers shown to customer, provider sees lead

---

### Sprint 5 (Week 5): Chat + Offers
**Focus:** Realtime chat, offer system

| # | Task | Owner |
|---|---|---|
| 5.1 | Database migration 005: conversations, messages, offers | Eng Lead |
| 5.2 | Supabase Realtime subscription for chat | Eng Lead |
| 5.3 | Chat UI — customer side (SCR-CUST-11) | Eng 2 |
| 5.4 | Chat UI — provider side (SCR-PRO-14) | Eng 2 |
| 5.5 | Message send API route | Eng Lead |
| 5.6 | Offer form (SCR-PRO-11) | Eng 2 |
| 5.7 | Offer card in chat (SCR-CUST-11 offer card) | Eng 2 |
| 5.8 | Offer send API route | Eng Lead |
| 5.9 | Offer accept/decline API route | Eng Lead |
| 5.10 | WhatsApp + Call contact buttons (phone revealed on offer acceptance) | Eng 2 |
| 5.11 | Messages list (SCR-CUST-12, SCR-PRO-13) | Eng 2 |
| 5.12 | Design: chat, offer card, messages list | Designer |

**Sprint Goal:** Customer and provider can exchange offers and messages in real-time

---

### Sprint 6 (Week 6): Jobs + Reviews
**Focus:** Job lifecycle, ratings

| # | Task | Owner |
|---|---|---|
| 6.1 | Database migration 006: jobs, reviews | Eng Lead |
| 6.2 | Job creation on offer acceptance | Eng Lead |
| 6.3 | Job status transitions API routes | Eng Lead |
| 6.4 | Active jobs view (SCR-PRO-12) | Eng 2 |
| 6.5 | Completed jobs view (SCR-PRO-13) | Eng 2 |
| 6.6 | Customer marks complete (SCR-CUST-08 status update) | Eng 2 |
| 6.7 | Review submission screen (SCR-CUST-14) | Eng 2 |
| 6.8 | Review API route (submit + moderation queue) | Eng Lead |
| 6.9 | Provider stats update (avg_rating, review_count) trigger | Eng Lead |
| 6.10 | Admin review moderation queue (SCR-ADMIN-07) | Eng 2 |
| 6.11 | Design: job tracking, review screen | Designer |

**Sprint Goal:** Full transaction loop complete end-to-end

---

### Sprint 7 (Week 7): Provider Profile + Performance
**Focus:** Public profile, trust signals, provider performance panel

| # | Task | Owner |
|---|---|---|
| 7.1 | Public provider profile page — full (SCR-CUST-09, /artisan/[slug]) | Eng 2 |
| 7.2 | Work gallery component | Eng 2 |
| 7.3 | Reviews list on profile | Eng 2 |
| 7.4 | Provider profile editor (SCR-PRO-15) | Eng 2 |
| 7.5 | Work photo upload/delete | Eng Lead |
| 7.6 | Provider performance panel (SCR-PRO-16) | Eng 2 |
| 7.7 | Provider settings (SCR-PRO settings) | Eng 2 |
| 7.8 | Customer profile + settings (SCR-CUST-13) | Eng 2 |
| 7.9 | Design: public profile, performance panel | Designer |

---

### Sprint 8 (Week 8): Notifications + Admin Completion
**Focus:** Notifications, full admin tooling

| # | Task | Owner |
|---|---|---|
| 8.1 | Database migration 007: notifications | Eng Lead |
| 8.2 | Notification creation service (all event types) | Eng Lead |
| 8.3 | Notification center screen (SCR-CUST-12) | Eng 2 |
| 8.4 | Unread count in navigation | Eng 2 |
| 8.5 | Admin dashboard metrics (SCR-ADMIN-02) | Eng 2 |
| 8.6 | Admin user management (SCR-ADMIN-05) | Eng 2 |
| 8.7 | Admin suspend/reinstate user | Eng Lead |
| 8.8 | Admin taxonomy management (SCR-ADMIN-08) | Eng 2 |
| 8.9 | Admin disputes queue (SCR-ADMIN-09) | Eng 2 |
| 8.10 | Moderation flags (report user/content) | Eng Lead |
| 8.11 | Admin audit log viewer | Eng 2 |

---

### Sprint 9 (Week 9): Polish + RTL + Performance
**Focus:** All states, RTL audit, performance

| # | Task | Owner |
|---|---|---|
| 9.1 | All empty states (every major view) | Eng 2 |
| 9.2 | All skeleton loading states | Eng 2 |
| 9.3 | All error states with recovery | Eng 2 |
| 9.4 | Offline handling + draft save (request creation) | Eng Lead |
| 9.5 | RTL systematic audit — all screens in Arabic | Eng 2 + Designer |
| 9.6 | Lighthouse performance audit + fixes | Eng Lead |
| 9.7 | Image lazy loading optimization | Eng Lead |
| 9.8 | i18n completeness check (parity script) | Eng 2 |
| 9.9 | Arabic typography review (line height, font rendering) | Designer |
| 9.10 | Landing page + marketing pages (SCR-PUB-01 through 05) | Eng 2 |
| 9.11 | PWA manifest + mobile home screen icon | Eng 2 |

---

### Sprint 10 (Week 10): QA + Launch Prep
**Focus:** Testing, security review, launch checklist

| # | Task | Owner |
|---|---|---|
| 10.1 | E2E tests: customer full flow | QA |
| 10.2 | E2E tests: provider full flow | QA |
| 10.3 | E2E tests: auth lockout | QA |
| 10.4 | Role-based permission tests | QA |
| 10.5 | Security review: RLS policy audit | Eng Lead |
| 10.6 | Security review: admin access test | QA |
| 10.7 | Mobile device testing (Samsung Galaxy A, iPhone SE) | QA |
| 10.8 | Final production environment verification | DevOps |
| 10.9 | PostHog dashboards configured | Eng Lead |
| 10.10 | Sentry alerts configured | Eng Lead |
| 10.11 | Pre-launch checklist completion | PM |
| 10.12 | Soft launch: provider WhatsApp blast | Ops |

---

## Buffer and Contingency

The roadmap above assumes everything goes smoothly. Build in 1–2 week buffer for:
- Image upload pipeline complexity (HEIC conversion, mobile Safari quirks)
- Supabase Realtime edge cases in chat
- RTL layout fixes (Arabic is often more work than estimated)
- OTP delivery testing and edge cases with Moroccan carriers
- Admin UX taking longer than expected (admin tools are often underestimated)

**If timeline compresses:** Cut Sprint 9 polish to minimum viable (keep RTL audit and critical error states; cut some admin tools to V1.1).
