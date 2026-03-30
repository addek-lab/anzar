# Risk Register

## Risk Assessment Framework

**Likelihood:** Low (1), Medium (2), High (3)
**Impact:** Low (1), Medium (2), High (3)
**Score:** Likelihood × Impact (max 9)

---

## Product Risks

| # | Risk | L | I | Score | Mitigation |
|---|---|---|---|---|---|
| P1 | **Supply-side cold start:** Not enough verified providers at launch → 0-match requests → customer churn | 3 | 3 | 9 | Launch supply acquisition 4 weeks before customer marketing. Do NOT launch publicly until 100+ verified providers exist. Ops team manually onboards first 150 providers. |
| P2 | **Provider response rate is low:** Providers receive leads but don't respond → customer frustration | 3 | 3 | 9 | Response rate tracked. Providers with < 40% response rate deprioritized in matching. Ops team calls inactive providers. Consider "3 unanswered leads → account paused" rule in V1.1. |
| P3 | **Request completion rate is low:** Customers create requests but don't hire → no social proof, no reviews | 2 | 3 | 6 | Improve matching quality. Add nudge notifications. Ensure WhatsApp contact button is prominent. |
| P4 | **Request quality is poor:** Customers submit vague requests that providers reject | 2 | 2 | 4 | Onboarding micro-copy, placeholder examples in description field, category-specific prompts. |
| P5 | **Pricing expectations misaligned:** Customers expect free quotes, providers want paid leads | 2 | 2 | 4 | Clear in-app communication that quotes are free for customers. Monetization messaging for providers is transparent. |
| P6 | **RTL layout breaks in unexpected ways:** Arabic mode causes layout issues in certain browsers | 2 | 2 | 4 | RTL visual tests in CI. Manual testing on real Android and iOS devices before launch. |
| P7 | **Darija mismatch in search:** Users search for services in Darija and get no results | 2 | 2 | 4 | Build synonym table with common Darija terms before launch. Accept imperfect coverage at V1. |

---

## Technical Risks

| # | Risk | L | I | Score | Mitigation |
|---|---|---|---|---|---|
| T1 | **Supabase outage:** BaaS downtime causes platform unavailability | 1 | 3 | 3 | Supabase Pro SLA: 99.5%. Status page monitoring. Communicate to users if > 30 min. Mitigation: the platform is not life-critical, short downtime is acceptable. |
| T2 | **OTP SMS delivery failure:** Twilio or Moroccan carrier delays OTP | 2 | 3 | 6 | Test OTP delivery rates with Moroccan numbers before launch. Have a backup SMS provider (Infobip as alternative). Show "Renvoyer le code" option prominently. |
| T3 | **Image upload failures on mobile:** Poor connectivity causes upload failures | 3 | 2 | 6 | Progressive upload with retry. Clear error states. Allow "skip photos" option. |
| T4 | **Matching engine returns 0 providers for many requests:** Too many edge cases in filtering logic | 1 | 3 | 3 | Seed with ample providers before launch. Admin alert on 0-match requests. Manual match override in admin. |
| T5 | **Chat realtime performance degrades at scale:** Supabase Realtime has connection limits | 1 | 2 | 2 | Supabase Pro handles 500+ concurrent connections. At MVP scale this is not a concern. Re-evaluate at 1,000+ daily active users. |
| T6 | **Next.js App Router bugs:** Edge cases in RSC/client component hydration | 2 | 2 | 4 | Stick to stable Next.js 14 version. Pin dependency versions. Comprehensive E2E tests on critical flows. |
| T7 | **Database migration causes downtime:** Schema change locks production | 1 | 3 | 3 | Apply migrations before code deploy. Test on staging first. Use additive migrations (add columns, don't rename/drop in same deploy). |
| T8 | **Performance on low-end Android:** App loads slowly on entry-level devices | 2 | 2 | 4 | Mobile Lighthouse ≥ 70 gate in CI. Bundle size monitoring. Lazy load non-critical components. |

---

## Market and Business Risks

| # | Risk | L | I | Score | Mitigation |
|---|---|---|---|---|---|
| M1 | **Low customer acquisition:** Customers don't hear about Anzar or don't trust a new platform | 3 | 3 | 9 | Word-of-mouth seeding via providers who share with their customers. Community-first acquisition. Prioritize reviews and social proof early. Don't go wide before going deep. |
| M2 | **Provider fraud/scam:** Bad-actor providers use the platform to scam customers | 2 | 3 | 6 | Verification requirement. Trust signals reduce exposure of low-quality providers. Report system + moderation. |
| M3 | **Competitive response from Avito:** Avito adds a structured service request feature | 1 | 2 | 2 | Avito's brand is classifieds, not trust-verified services. Differentiation through quality > SEO coverage. Focus on depth before Avito can match trust signals. |
| M4 | **Provider retention failure:** Providers stop using the platform because leads are too expensive (V1.1) | 2 | 2 | 4 | Price leads fairly based on category value. Offer free period to build loyalty. Collect willingness-to-pay data before launching billing. |
| M5 | **Cash economy makes completion tracking impossible:** Customers don't mark jobs complete because payment is offline | 3 | 2 | 6 | Incentivize completion marking: "Leave a review and help other customers." Send follow-up SMS/notification. Auto-complete after 7 days inactivity post-hire. |
| M6 | **Team burn-out during ops-heavy launch:** Manual provider onboarding and verification is labor-intensive | 2 | 2 | 4 | Cap provider applications to 20/day in first 2 weeks. Streamline verification workflow. Hire part-time ops assistant if volume demands. |

---

## Regulatory and Legal Risks

| # | Risk | L | I | Score | Mitigation |
|---|---|---|---|---|---|
| R1 | **CNDP (Commission Nationale de contrôle de la Protection des Données) compliance:** Morocco Law 09-08 requires data protection measures | 2 | 2 | 4 | Privacy policy drafted. Data minimization applied. No international data transfer without disclosure. Consult local legal counsel before public launch. |
| R2 | **Payment regulation:** If platform is perceived as processing payments | 1 | 3 | 3 | V1 explicitly does not process payments. All transactions are cash-only between parties. Platform is a lead marketplace, not a payment processor. Document this clearly in CGU. |
| R3 | **Provider liability:** Customer claims damage caused by a matched provider | 1 | 2 | 2 | CGU explicitly states Anzar is a marketplace, not a service provider. Providers are independent contractors. Dispute resolution process documented. |

---

## Top 5 Risks to Manage Weekly

1. **P1 — Supply cold start** → Track provider count daily pre-launch
2. **P2 — Provider response rate** → Track daily; ops outreach if drops below 60%
3. **M1 — Customer acquisition** → Track daily request creation; if < 10/day by week 4, reassess acquisition strategy
4. **T2 — OTP SMS delivery** → Monitor OTP success rate; alert if < 90% delivery
5. **M5 — Completion tracking** → Auto-complete rule + notification nudges

---

## Risk Review Schedule

- **Weekly:** Review top 5 risks in team standup
- **Monthly:** Full risk register review, update likelihood/impact based on new data
- **Post-incident:** Add new risks discovered during incidents
