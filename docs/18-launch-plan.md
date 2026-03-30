# Launch Plan

## Launch Philosophy

Launch small, measure everything, optimize fast.

**Target:** Soft launch in Casablanca with 100–150 verified providers before customer acquisition begins. A marketplace with no supply is a broken product. Supply must come first.

**Launch sequence:**
1. Soft launch (supply only) — build provider base
2. Beta launch — controlled customer access
3. Public launch — open to all in Casablanca

---

## Pre-Launch Phase (Weeks -4 to 0)

### Week -4: Infrastructure Ready

- [ ] Production Supabase project created and configured
- [ ] Vercel production deployment working
- [ ] CI/CD pipeline tested end-to-end
- [ ] All environment variables in Vercel production
- [ ] SMS provider (Twilio) configured for Moroccan numbers
- [ ] Supabase backups confirmed working
- [ ] Sentry DSN connected and test error received
- [ ] PostHog key connected and test event received
- [ ] Admin account created and tested
- [ ] Health check endpoint live and monitored

### Week -3: Content and Localization

- [ ] All French translations complete and proofread (native speaker review)
- [ ] All Arabic translations complete and proofread (native Arabic speaker review)
- [ ] Category icons and names confirmed culturally appropriate
- [ ] Help/FAQ content written in French and Arabic
- [ ] Landing page SEO: meta tags, OG images, Arabic/French keyword targeting
- [ ] Privacy policy and CGU (Terms of Service) written (Moroccan law reference)
- [ ] "How it works" page complete

### Week -2: Provider Seeding (Supply Acquisition)

**Goal:** 150 verified providers before any customer marketing

**Method:**
1. Ops team creates a simple WhatsApp broadcast list of Moroccan tradespeople
2. Personal message: "Vous êtes plombier/électricien à Casablanca? Testez Anzar — recevez des demandes de clients gratuitement en ce moment."
3. Provider registrations processed daily (admin queue)
4. Admin approves all valid applications within 24h
5. Target breakdown:
   - 40 electricians
   - 35 plumbers
   - 30 painters
   - 20 HVAC technicians
   - 15 tilers
   - 10 handymen

**KPI to unlock beta:** 100 verified providers in Casablanca

### Week -1: Beta Testing

- [ ] 20 internal test users (team, family, friends) create test requests
- [ ] Full flow tested: request → match → offer → hire → complete → review
- [ ] Admin verification queue processed by real admin
- [ ] Arabic RTL tested on real Android devices (Samsung Galaxy A series)
- [ ] iOS Safari tested
- [ ] Payment flow confirmed NOT present (check no accidental payment CTAs)
- [ ] Load test: simulate 50 concurrent request submissions
- [ ] All critical bugs resolved
- [ ] Performance: Lighthouse mobile score ≥ 70 on all critical pages

---

## Soft Launch (Week 0)

### Launch Day Checklist

**Morning (8h):**
- [ ] Confirm all providers notified and ready
- [ ] Admin team online and ready to process verifications
- [ ] Ops on standby for provider support questions
- [ ] Team WhatsApp group active for real-time incident response

**Launch:**
- [ ] Flip production to "open" (remove any coming-soon gate)
- [ ] Send first provider WhatsApp blast: "Anzar est en ligne ! Complétez votre profil pour recevoir vos premiers leads."
- [ ] Team members submit first real test requests to verify full loop

**First Hour:**
- [ ] Monitor Sentry for errors
- [ ] Monitor PostHog for first events
- [ ] Monitor Supabase for database performance
- [ ] Customer support WhatsApp active

**End of Day:**
- [ ] Review all requests submitted
- [ ] Check match quality (any 0-match requests?)
- [ ] Review provider response rate to first leads
- [ ] Document any issues for hotfix the next day

---

## Controlled Beta Launch (Weeks 1–4)

### Customer Acquisition Strategy (Controlled)

**Channel 1: Direct community outreach**
- Facebook groups for Casablanca renters/homeowners
- WhatsApp groups for apartment buildings and neighborhoods
- Message: "Besoin d'un plombier ou électricien à Casablanca? Essayez Anzar — artisans vérifiés, devis en 2h"

**Channel 2: Content seeding**
- Post in Moroccan home improvement Facebook groups with genuine helpful advice
- Include Anzar link organically

**Channel 3: Provider word-of-mouth**
- Encourage verified providers to share Anzar with their customers
- Give providers a shareable "Get a quote for free" link

**Channel 4: No paid ads yet** — too early. Optimize conversion funnel first.

### Beta KPIs (Monthly)

| Week | Target Requests | Target Provider Response Rate |
|---|---|---|
| 1 | 20+ | ≥ 50% |
| 2 | 40+ | ≥ 55% |
| 3 | 70+ | ≥ 60% |
| 4 | 100+ | ≥ 60% |

---

## Public Launch (Week 5+)

**Criteria to unlock public launch:**
- ≥ 100 submitted requests processed
- ≥ 60% provider response rate
- ≥ 40% request-to-contact rate
- No critical bugs in production
- Admin team can handle volume (verification + moderation)

**Public launch activities:**
- Press release to Moroccan tech/startup media (TechAfrique, Wulkano, Y'Brik)
- LinkedIn announcement (founder)
- Instagram / TikTok short demo video
- Partner with property management companies for B2B requests (1–2 contacts in Casablanca)

---

## Post-Launch Optimization Cadence

### Week 1–2: Fix
- Fix all bugs found in soft launch
- Improve any UX friction identified in session recordings (PostHog)
- Improve 0-match handling (reach out to providers in underserved categories)

### Week 3–4: Measure
- First funnel analysis (where are customers dropping off?)
- First provider cohort analysis (who is responding? who is inactive?)
- Identify top reasons for provider verification rejection (simplify requirements if too high)

### Week 5–8: Optimize
- Improve the worst-performing funnel step
- A/B test request wizard if completion rate < 60%
- Improve notification content if provider response rate < 60%
- Ops team personally calls the top 20 most active providers for qualitative feedback

### Month 3: Monetization Readiness
- Assess lead credit system design (V1.1)
- Validate pricing: what would providers pay per lead?
- Prepare billing infrastructure
- Brief providers on upcoming paid model (give 30-day notice)

---

## Expansion Plan: Casablanca → Rabat

**Trigger:** Casablanca reaches:
- 500+ total requests
- 60%+ response rate
- Clear product-market fit signal (repeat customer rate ≥ 20%)

**Rabat launch process:**
1. Mirror Casablanca supply acquisition approach in Rabat (ops team)
2. Add Rabat to city selector in admin
3. Activate Rabat city in production database
4. Target: 75 verified Rabat providers before first customer request

---

## Communication Plan

### Customer Communication Channels
- In-app notifications
- SMS (critical only: match found, job confirmed)
- No email for customers in V1

### Provider Communication Channels
- SMS (most reliable for tradespeople)
- In-app notifications
- WhatsApp broadcast for operational updates

### Crisis Communication
- If platform is down > 30 min: post WhatsApp message to known active users
- If major bug affects active jobs: notify affected users via SMS
- Always: honest, brief, solution-focused messaging
