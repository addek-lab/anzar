# Monetization Strategy

## V1: No Monetization (Proven Marketplace Playbook)

**Decision:** V1 is completely free for all users, on both sides.

**Why:** The core challenge in a two-sided marketplace is building trust, supply quality, and transaction completion before charging anyone. Charging too early:
- Kills provider adoption (they'll try it free first, then pay if it works)
- Corrupts the quality signal (providers who paid become more aggressive, damaging customer experience)
- Adds billing infrastructure complexity that distracts from product quality

The target for monetization activation: **90–120 days post-launch**, after demonstrating clear value.

---

## V1.1: Lead Credit System

### Model: Pay-Per-Lead (Provider Side)

Providers purchase lead credits. Each accepted/claimed lead costs 1 credit. Viewing a lead is free; responding costs 1 credit.

**Why this model:**
- Aligns incentives: providers only pay for real opportunities
- Self-selecting quality: providers who think the job is worth pursuing will pay; junk leads naturally get declined
- Proven: used by MyHammer, Bark, Angi, Thumbtack in various forms
- Low risk for providers: no subscription, no commitment

### Credit Pack Pricing (initial hypothesis — validate with provider interviews)

| Pack | Credits | Price (MAD) | Per Lead |
|---|---|---|---|
| Starter | 5 credits | 100 MAD | 20 MAD/lead |
| Standard | 15 credits | 250 MAD | ~17 MAD/lead |
| Pro | 35 credits | 500 MAD | ~14 MAD/lead |

**By category (different lead values — price accordingly):**

| Category | Lead Value Hypothesis | Credit Cost |
|---|---|---|
| HVAC (climatisation) | High value, big jobs | 2 credits/lead |
| Plumbing (urgent) | High urgency, willing to pay | 2 credits/lead |
| Electrician | Medium-high value | 1.5 credits/lead |
| Painting | High value but more competitive | 1 credit/lead |
| Tiling | Project-based, medium | 1 credit/lead |
| Handyman | Lower value, quick jobs | 0.5 credits/lead |

**Note:** Pricing must be validated with actual providers before setting. Target: a provider who converts 1 in 5 leads into a 500 MAD job should be willing to pay 50–75 MAD in total lead costs (spread across 5 leads at 10–15 MAD each).

### Lead Credit Mechanics

```
Provider logs into app
    ↓
Views lead detail (free)
    ↓
Taps "Répondre" (costs 1 credit)
    ↓
If credit balance = 0:
    → "Vous n'avez plus de crédits. Achetez un pack pour répondre."
    → Link to credit purchase page
    ↓
Credit deducted on first response submission (not on view)
    ↓
No refund if customer doesn't respond (standard lead marketplace model)
    → Exception: if customer deletes account within 24h, credit refunded
```

### Credit Purchase Flow

```
Provider taps "Acheter des crédits"
    ↓
Credit pack selection page
    ↓
Payment: initially bank transfer (manual confirmation) OR Cash Plus / Wafacash
    ↓
Admin confirms payment → credits added to account
```

**V1.1 payment note:** No card payments initially. Morocco has low credit card penetration. Options:
- Bank transfer (CCP or bank account) — admin manually confirms
- Cash Plus / Wafacash / Western Union — common among tradespeople
- Card payment: implement via Stripe or Maroc Telecommerce (CMI gateway) in V2

---

## V2: Premium Provider Subscriptions

Monthly subscription tiers for providers who want more visibility and tools.

| Tier | Price | Features |
|---|---|---|
| Free | 0 MAD/month | Basic profile, 2 free leads/month |
| Standard | 199 MAD/month | 10 leads/month included, standard matching |
| Pro | 399 MAD/month | 20 leads/month, priority in matching, "Artisan Pro" badge, analytics |

**Why subscription in V2:** Subscriptions provide predictable revenue and reward committed providers. But in V1.1, lead credits are simpler to explain and have zero upfront commitment.

---

## Monetization Guardrails

Rules to prevent monetization from degrading platform quality:

1. **Customer experience never degrades due to monetization.** Customers never pay, see ads, or receive lower quality matches because a provider didn't pay.

2. **Match quality drives position — not payment.** In V1.1, paid providers do not get higher matching scores purely by paying. Quality score still drives matching. (Exception: "boost" feature in V2 only, and only limited in frequency.)

3. **No "buy your way to the top."** A new paid provider with no reviews should not outrank a highly-rated free provider. Payment unlocks access to leads, not fake quality signals.

4. **Refund policy for poor leads.** If a customer posts a fraudulent or duplicate request, providers affected get credits back.

5. **Free tier always exists.** Providers never fully blocked from the platform for non-payment. The free tier is limited but usable.

---

## Revenue Projections (Rough, Year 1)

**Conservative estimate:**
- 150 active providers × 20 leads/month average × 15 MAD/lead = 45,000 MAD/month (~$4,500 USD) at 100% paid conversion
- Realistic conversion to paid: 50% of providers buy credits
- **Realistic V1.1 revenue: ~20,000–25,000 MAD/month (~$2,000–2,500 USD)**

This is not a business-sustaining number. This is an early signal that validates the model.

**Year 1 target (after Rabat expansion and subscription launch):**
- 500 active paying providers × ~150 MAD/month average spend
- ~75,000 MAD/month (~$7,500 USD)

This funds 1–2 local team members and proves unit economics before raising capital.
