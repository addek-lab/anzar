# Assumptions and MVP Definition

## Core Assumptions

### Market Assumptions
1. **Casablanca is the launch city.** Largest urban density, highest smartphone penetration, most active real estate market. Rabat is city #2.
2. **The primary customer use case is reactive (emergency/immediate need), not planned.** "My water pipe burst" and "my electricity went out" are higher frequency than "I want to renovate next month."
3. **WhatsApp is the default communication channel in Morocco.** The platform must integrate with or mimic WhatsApp UX patterns. A contact button that opens WhatsApp is not a shortcut — it's a feature.
4. **Tradespeople are not tech-native.** Onboarding must be operable by someone who uses only WhatsApp and phone calls. Complex dashboards will kill adoption.
5. **Trust is the #1 conversion driver.** Price comes second. A verified badge and positive reviews beat a lower quote with no proof.
6. **French is the professional default language.** Arabic is the cultural default. Both are required. Darija is the street default but cannot be systematized as a UI language.
7. **Cash payment is the primary transaction mode.** V1 does NOT need payment processing. The platform facilitates contact and match — money changes hands offline.
8. **SMS/OTP works in Morocco for auth.** Twilio or equivalent supports Moroccan numbers. OTP delivery rate is acceptable.
9. **The platform starts with 6 categories.** Electrician, Plumbing, Painting, HVAC, Tiling, Handyman. These are the highest-frequency home service categories.
10. **Providers outnumber available leads in early stage.** The supply acquisition challenge is real but not the product's first constraint. The first constraint is demand activation (getting customers to create requests).

### Technical Assumptions
1. **Supabase handles auth, database, storage, and realtime for V1.** This eliminates infrastructure overhead and is cost-effective for MVP scale.
2. **Next.js App Router with server components is the correct choice.** SSR + RSC gives fast mobile loads. The App Router enables nested layouts critical for mobile-app-feel navigation.
3. **PostgreSQL full-text search with a synonym table is sufficient for V1 search.** ElasticSearch or Typesense can be adopted in V2 if needed.
4. **Vercel handles deployment.** Preview deployments per PR, edge functions when needed, zero-ops CDN.
5. **Image uploads are limited to 5 per request, max 5MB each.** WebP conversion is applied on upload. This keeps storage manageable and loads fast on mobile.
6. **No mobile app in V1.** A Next.js PWA with mobile-first design is the correct first step. Native apps come in V2 if traction confirms it.
7. **Matching runs synchronously on request submission for MVP.** Async job queue is V2. With 150 providers and capped categories, synchronous matching is fast enough.
8. **Realtime chat is Supabase Realtime (WebSocket).** This is built in and requires no additional infrastructure for MVP scale.

### Business Assumptions
1. **Monetization does not activate in V1.** The first 90 days are about proving the loop (request → match → hire → rate). Credits and billing are V1.1.
2. **Provider acquisition is manual-assisted at launch.** The ops team signs up the first 100–150 providers via WhatsApp outreach and in-person onboarding. Organic growth takes over in V2.
3. **No escrow or payment processing in V1.** The legal and operational complexity of handling payments in Morocco is deferred. The platform is a lead marketplace, not a transaction processor.
4. **Admin team = 1–2 people at launch.** The admin tooling must be highly efficient for a small team to handle verification and moderation at early scale.

---

## MVP Definition

### What MVP means for Anzar

The MVP is defined as: **the smallest version of the product that can successfully complete a full loop from customer request to rated job completion, with verified providers, in Casablanca, in both French and Arabic.**

### MVP is NOT:
- Feature-complete
- Payment-enabled
- Nationwide
- Native mobile app
- AI-powered matching
- Full analytics suite
- Provider subscription management
- Multi-category beyond the 6 defined

### MVP IS:
- Functional customer request creation (60 seconds)
- Functional provider matching (up to 3 verified providers)
- Functional provider profiles with trust signals
- Functional chat/offer system per request
- Functional job lifecycle tracking
- Functional rating and review
- Functional provider onboarding + admin verification
- French + Arabic RTL from day one
- OTP phone auth
- Image uploads
- Admin dashboard: verification queue, moderation, basic user management

### MVP Acceptance Test (The Real Test)
> A real homeowner in Casablanca can open their phone, post a plumbing request with a photo, see up to 3 verified plumbers, message one, receive an offer, and hire them — all in under 10 minutes of total interaction time.
> A plumber can receive a notification of a new lead, view the request, send a price offer, and get a confirmation the customer chose them.
> An admin can review a new provider's documents, approve them, and see them appear in the matching pool.

If all three scenarios work cleanly, in Arabic and French, on a mid-range Android phone, the MVP passes.

---

## Explicit Non-Goals for V1

| Feature | Status | Reason |
|---|---|---|
| Payment processing / escrow | Deferred to V2 | Legal + operational complexity |
| Native iOS/Android apps | Deferred to V2 | PWA sufficient, validate first |
| AI matching / ML | Deferred to V2 | Deterministic scoring is enough |
| Bidding / auction mechanics | Deferred to V2 | Complexity without proven need |
| Provider subscription plans | V1.1 | Needs trust built first |
| Nationwide launch | V1.1 | Quality control requires city-by-city |
| Advanced analytics / BI | V1.1 | Basic event tracking is enough |
| Darija UI | Never (content layer only) | Not standardizable |
| Multi-language admin panel | V1.1 | Admin team is bilingual |
| Provider invoicing tools | V2 | Out of scope |
| Customer loyalty / rewards | V2 | Complexity without proven retention |
| Public API / partner integrations | V2 | No validated use case |

---

## MVP Constraints

- Build time: 8–10 weeks with a team of 3–4
- Budget assumption: bootstrapped / seed stage
- Team size: 2 full-stack engineers, 1 designer, 1 PM/TPM
- Infrastructure cost target: < $200/month at launch
- Legal: No payment processing = no PCI compliance requirement for V1
