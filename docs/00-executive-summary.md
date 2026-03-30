# Anzar — Executive Product Summary

**Product Name:** Anzar (أنظار — "looks / attention" in Darija; also evokes "perspectives" — fitting for a trust marketplace)
**Product Type:** Vertical service marketplace — home services, Morocco
**Stage:** Pre-build / green-field MVP planning
**Target launch:** Casablanca, then Rabat
**Date:** March 2026

---

## What We Are Building

Anzar is a structured, trust-first service marketplace connecting Moroccan homeowners and tenants with verified local tradespeople — electricians, plumbers, painters, HVAC technicians, tilers, and handymen.

It is NOT a classifieds board. It is NOT Avito for services.

It is a **request-led, match-controlled, quality-gated lead generation platform** where:
- Customers describe a job in under 60 seconds
- The platform matches up to 3 qualified, verified providers
- Providers compete on trust, not just price
- The job gets done, rated, and tracked

The core mechanic is borrowed from the MyHammer model: **controlled lead distribution**, not open broadcast. This is what makes it a marketplace, not a bulletin board.

---

## Why Morocco, Why Now

1. **Home services are fragmented.** Finding a reliable electrician in Casablanca requires asking neighbors, calling untested numbers from Facebook groups, or trusting generic Avito posts with no accountability.
2. **Trust is the primary pain point.** Customers fear no-shows, overcharging, and poor work. Tradespeople fear time-wasting contacts and unqualified leads.
3. **Mobile penetration is high.** Morocco has ~80%+ smartphone penetration. The target audience uses WhatsApp and Facebook daily. An app-like web experience is immediately adoptable.
4. **No structured competitor exists.** Avito is a classifieds board, not a service marketplace. Khdamat and similar attempts have not achieved product-market fit with structured flows.
5. **The tradesperson supply is large and unorganized.** There are hundreds of thousands of independent artisans and small contractors across Morocco without a professional digital presence.

---

## Core Value Proposition

| For Customers | For Tradespeople |
|---|---|
| Find verified local providers fast | Receive pre-qualified job leads |
| Compare trust signals, not just ads | No cold calling or wasted time |
| One request, three relevant matches | Build a professional online reputation |
| Rate and review, creating accountability | Win business on merit |
| No spam, no irrelevant contacts | Grow without expensive marketing |

---

## Business Model (V1)

Tradespeople pay per accepted/claimed lead.

- **Lead credit model:** providers purchase a credit pack; each accepted lead costs 1 credit
- Pricing: ~20–50 MAD per lead depending on trade and job size (to be validated)
- Customers: always free to post and compare

This model is well-validated by MyHammer, Checkatrade, and Angi/HomeAdvisor. It aligns incentives: providers only pay when they get a real opportunity.

---

## MVP Scope (8–10 week build)

1. Phone/OTP auth for both user types
2. Customer request creation (category → description → photos → location → urgency)
3. Deterministic weighted matching engine (max 3 providers)
4. Provider profile pages with trust signals
5. Chat + offer threading per request
6. Job lifecycle status tracking
7. Rating and review system
8. Provider onboarding and verification queue
9. Admin dashboard (verification, moderation, categories)
10. French + Arabic (RTL) from day one

---

## Tech Stack Summary

| Layer | Choice |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Next.js API Routes + Supabase |
| Database | PostgreSQL (via Supabase) |
| Auth | Supabase Auth (phone/OTP) |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime (chat) |
| Search | PostgreSQL full-text + synonym table |
| Deployment | Vercel (frontend) + Supabase (managed backend) |
| Monitoring | Sentry + PostHog + Vercel Analytics |

---

## Team Required for MVP

- 1 Product Manager / TPM
- 1 UX/UI Designer
- 2 Full-Stack Engineers (Next.js + PostgreSQL)
- 1 Part-time DevOps / Platform Engineer
- 1 QA Engineer (manual + automation)
- 1 Operations / Community lead (Arabic-speaking, Moroccan market)

---

## Success Criteria (First 90 Days Post-Launch)

| Metric | Target |
|---|---|
| Service requests created | 500+ |
| Providers verified and active | 150+ |
| Request-to-contact rate | ≥ 40% |
| Contact-to-hire rate | ≥ 25% |
| Provider response rate | ≥ 60% |
| Reviews collected | 100+ |
| NPS | ≥ 30 |

---

## What Makes This Different

The platform differentiates by engineering **trust into the product**, not just marketing it:
- Providers can only appear in matches after human verification
- Leads are capped at 3 per request — no spamming customers
- Job completion and ratings are tracked programmatically
- Providers with poor response rates are deprioritized automatically
- Admin has full moderation and intervention capability from day one

This is a product where the quality of supply is a moat, and the job of the platform is to maintain that quality as it scales.
