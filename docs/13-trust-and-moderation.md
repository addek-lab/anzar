# Trust and Moderation Framework

## Trust Philosophy

Trust is not a feature — it is the product's core proposition. Every design decision must be evaluated through the question: **"Does this increase or decrease trust?"**

The platform's trust architecture has three layers:
1. **Signal layer:** What data we collect about provider quality
2. **Display layer:** What we show customers to help them decide
3. **Enforcement layer:** How we detect and remove bad actors

---

## Provider Trust Signals

### What is displayed to customers on provider cards and profiles:

| Signal | Source | Display |
|---|---|---|
| Verified badge | Admin verification decision | Green checkmark badge |
| Star rating | Average of published reviews | 4.8 ★ (23 avis) |
| Completed jobs count | Count of `job.status = completed` | "45 travaux réalisés" |
| Response rate | % of leads responded to | "Répond à 92% des demandes" |
| Response time | Avg hours to first message | "Répond en général en < 2h" |
| Last active | Relative time since last activity | "Actif aujourd'hui" |
| Work gallery | Provider-uploaded photos | Photo grid (up to 10) |
| Member since | Profile creation date | "Membre depuis Jan 2026" |

### Trust Tiers (internal, not displayed as a tier label)

These tiers drive the matching score but are not exposed as "Tier 1 / Tier 2" labels to customers — that feels gameable. Instead, the signals speak for themselves.

```
New / Unproven: 0 completed jobs, 0 reviews
  → eligible to appear but boosted by "new provider" factor
  → gets fewer total leads until first 3 reviews collected

Established: 3+ reviews, avg_rating >= 4.0, response_rate >= 60%
  → normal matching priority

Strong: 10+ reviews, avg_rating >= 4.5, response_rate >= 80%
  → top of match lists

At-risk: response_rate < 40% OR avg_rating < 3.5
  → matching score penalized
  → internal warning triggered for ops team

Problem: repeated no-shows, multiple reports, fraud signals
  → manual admin review
  → possible restriction or suspension
```

---

## Verification Process

### What is verified:
1. **Phone number** (always — OTP auth)
2. **Identity document** (CIN = Carte d'Identité Nationale)
   - Admin views uploaded document image
   - Verifies name matches registration name
   - Verifies document appears genuine (not obvious fake)
3. **Business registration** (optional — if provider operates as a company)

### What is NOT verified in V1:
- Professional license / trade certification (V2 enhancement)
- Insurance
- Tax registration

### Verification SLA:
- Target: < 24 hours from submission
- Weekend backlog acceptable: next business day
- Provider receives notification of decision within 24h

### Rejection Reasons (standardized list for notifications):
- `document_unreadable` → "Votre document est illisible. Merci de retélécharger."
- `document_incomplete` → "Document incomplet. Merci de fournir les deux faces."
- `name_mismatch` → "Le nom sur le document ne correspond pas à votre profil."
- `invalid_document` → "Ce type de document n'est pas accepté."
- `profile_incomplete` → "Veuillez compléter votre profil avant de soumettre."
- `other` → Custom note from admin

---

## Review System

### Collection
- Reviews triggered by job completion (customer prompted)
- Customer has 14 days to leave a review after job completion
- After 14 days, review prompt disappears (but can still be accessed from job history)

### Content validation
```
- Rating: required, 1–5 integer
- Comment: optional, max 300 chars
- No URLs, phone numbers, or emails in review text (prevents off-platform solicitation)
- Auto-flagged if contains: competitor names, abusive keywords (regex list)
- All reviews go through status: 'pending' before publishing
```

### Review Moderation Queue
- Default: reviews published after 48h if no admin action (auto-approve cadence)
- Flagged reviews: hold indefinitely until admin decision
- Admin actions: `approve` | `reject` (with reason) | `edit` (admin can redact specific text)

### Review Gaming Prevention
```
- One review per job per reviewer (enforced by DB unique constraint)
- Can only review a provider if job.status = completed and job.customer_id = auth.uid()
- Cannot review within 1 hour of job completion (prevents rushed fake reviews)
- Flag if: same customer reviews the same provider more than twice (different jobs)
- Flag if: provider has 5+ new 5-star reviews in 24 hours
```

### Provider Response to Reviews
- V1.1 feature: providers can reply to a published review (publicly visible)

---

## Reporting System

### Who can report what:
- Customer can report: provider profile, specific message, review
- Provider can report: customer behavior, specific message, review

### Report flow:
```
User taps "Signaler"
    ↓
Modal with reason options:
  - "Contenu inapproprié"
  - "Comportement abusif"
  - "Informations fausses"
  - "Spam ou escroquerie"
  - "Autre" + text field
    ↓
Report stored in moderation_flags table
    ↓
Target flagged for admin review
    ↓
Reporter receives: "Merci. Nous avons bien reçu votre signalement."
```

---

## Fraud Detection (V1 — Rule-Based)

### Signals tracked:

| Signal | Threshold | Action |
|---|---|---|
| Multiple OTP requests from same phone | > 5 in 1 hour | Rate limit + flag |
| Account created from same device (fingerprint) as suspended account | Any | Flag for manual review |
| Provider has 0% response rate after 10 leads | 0% rate | Internal alert + ops outreach |
| Same phone number used for both customer and provider | Any | Flag (legitimate in Morocco but unusual) |
| Customer creates 10+ requests in 24h | > 10 | Flag as potential scraper |
| Provider receives 5+ 5-star reviews in 24h | > 5 | Flag review spike |
| Message contains phone number patterns (provider bypassing platform) | Regex match | Soft flag + track conversion |

### Phone number in messages (off-platform diversion):
This is a known anti-pattern (providers sharing their number to avoid platform lead tracking). In V1:
- Detect phone number patterns in messages (regex)
- Log for monitoring (do not block in V1 — too aggressive for early adoption)
- Use as signal in V2 monetization design

---

## Provider Status Transitions

```
                   ┌──────────┐
                   │  pending │ ← initial state after onboarding
                   └────┬─────┘
              approve   │   reject
             ┌──────────┼──────────┐
             ▼          ▼          │
        ┌─────────┐ ┌──────────┐   │
        │verified │ │ rejected │   │ (can resubmit)
        └────┬────┘ └──────────┘   │
             │                     │
         restrict                  │
             │                     │
        ┌────▼──────┐              │
        │ restricted│              │
        └────┬──────┘              │
        reinstate │   suspend       │
             └────┤                │
                  ▼                │
           ┌──────────┐            │
           │ suspended│            │
           └──────────┘            │
              reinstate            │
               ↑──────────────────┘
```

**Restricted providers:**
- Still appear in their existing active jobs
- NOT included in new matching runs
- Visible as "profile paused" to themselves
- Use case: provider reported, under investigation but not conclusively fraudulent

**Suspended providers:**
- Cannot log in
- Disappear from all match pools immediately
- All pending matches cancelled
- No notification of their profile to customers

---

## Admin Moderation Tools

### Priority Queue Design
Admin moderation queue sorts by:
1. Reports on same entity (3+ reports on same provider = high priority)
2. Report category (fraud/scam > abusive behavior > inappropriate content)
3. Date submitted (oldest first)

### Moderation Decision Speed Targets:
| Item | Target Response |
|---|---|
| Provider verification | 24 hours |
| Review moderation | 48 hours (auto-approve after) |
| Fraud reports | 4 hours (same business day) |
| Dispute resolution | 72 hours |
| Account suspension appeal | 48 hours |

### Dispute Resolution Process (V1):
1. Customer or provider submits complaint
2. Admin reviews conversation history and job record
3. Admin contacts both parties if needed (via platform message or phone)
4. Admin closes dispute: `dismissed` | `warning_issued` | `account_restricted` | `account_suspended`
5. Both parties notified of outcome

---

## Safety Guardrails in Product Design

1. **Customer phone not revealed until provider sends offer** — prevents harvesting
2. **Max 3 providers per request** — prevents customer spam
3. **Provider documents in private storage** — never accidentally exposed
4. **No public phone numbers** — provider contact is always mediated through the platform first
5. **Rate limiting on all auth actions** — prevents credential stuffing and OTP abuse
6. **Audit log on all admin actions** — full accountability
7. **Soft deletes on accounts** — data retained for fraud investigation even after "deletion"
