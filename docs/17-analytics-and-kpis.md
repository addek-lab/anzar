# Analytics and KPI Framework

## Analytics Stack

**Tool:** PostHog (product analytics + session recording)
**Reason:** Open source option, generous free tier (< 1M events/month), server-side event support, Next.js SDK available, self-hostable if needed.

**Secondary:** Vercel Analytics for Core Web Vitals (built in, zero configuration).

---

## Event Taxonomy

All PostHog events follow a naming convention: `noun_verb` (e.g., `request_submitted`, `provider_profile_viewed`).

All events include:
- `user_id`
- `user_type` (customer / provider / admin)
- `locale` (fr / ar)
- `timestamp`
- `session_id`

### Authentication Events

| Event | Properties | Triggered When |
|---|---|---|
| `auth_phone_entered` | phone_country | Phone number submitted |
| `auth_otp_sent` | — | OTP successfully dispatched |
| `auth_otp_verified` | is_new_user | OTP verified successfully |
| `auth_otp_failed` | attempt_number | Wrong OTP entered |
| `auth_type_selected` | user_type | Account type chosen |
| `auth_language_selected` | locale | Language choice made |
| `auth_session_expired` | — | Silent session refresh failed |

### Customer Events

| Event | Properties | Triggered When |
|---|---|---|
| `request_started` | source (home/cta/nav) | Step 1 of wizard opened |
| `request_category_selected` | category_id, category_name | Category chosen |
| `request_description_entered` | char_count | Moved past description step |
| `request_photo_uploaded` | count | Photo(s) uploaded |
| `request_photo_skipped` | — | Photo step skipped |
| `request_location_set` | city, has_neighborhood | Location step completed |
| `request_urgency_set` | urgency | Urgency selected |
| `request_submitted` | category, urgency, has_photos, has_budget | Request sent to server |
| `request_matches_viewed` | match_count | Match results shown |
| `provider_profile_viewed` | provider_id, source (match_card/direct) | Profile page opened |
| `provider_contacted_chat` | provider_id, request_id | Chat initiated |
| `provider_contacted_whatsapp` | provider_id | WhatsApp button tapped |
| `provider_contacted_call` | provider_id | Call button tapped |
| `offer_viewed` | offer_id, price_range | Offer card viewed |
| `offer_accepted` | offer_id, provider_id | Offer accepted |
| `offer_declined` | offer_id, provider_id | Offer declined |
| `provider_selected` | provider_id, request_id | Provider chosen |
| `job_completed_customer` | job_id | Customer marks job complete |
| `review_started` | job_id | Review prompt opened |
| `review_submitted` | rating, has_comment | Review submitted |
| `review_skipped` | job_id | Review prompt dismissed |
| `request_abandoned` | last_step, time_spent | User left wizard without submitting |

### Provider Events

| Event | Properties | Triggered When |
|---|---|---|
| `provider_onboarding_started` | — | Onboarding step 1 opened |
| `provider_onboarding_step_completed` | step_number, step_name | Each step finished |
| `provider_onboarding_completed` | — | Final submission |
| `provider_verification_submitted` | — | Documents uploaded |
| `provider_verification_approved` | time_to_approve_hours | Admin approves |
| `provider_verification_rejected` | reason | Admin rejects |
| `lead_received` | category, urgency, neighborhood | Match created (provider side) |
| `lead_viewed` | match_id, time_to_view_hours | Provider opens lead detail |
| `lead_responded` | match_id, time_to_respond_hours | Offer or message sent |
| `lead_declined` | match_id, reason | Provider declines lead |
| `offer_sent` | offer_id, price_range | Offer submitted |
| `job_started` | job_id | Provider marks in progress |
| `job_completed_provider` | job_id | Provider marks complete |

### Admin Events

| Event | Properties | Triggered When |
|---|---|---|
| `admin_provider_approved` | provider_id | Verification approved |
| `admin_provider_rejected` | provider_id, reason | Verification rejected |
| `admin_user_suspended` | user_id, reason | Account suspended |
| `admin_review_published` | review_id | Review approved |
| `admin_review_rejected` | review_id | Review rejected |

---

## Core KPIs and Definitions

### Customer Funnel Metrics

| KPI | Formula | Target (90 days) |
|---|---|---|
| Request Start Rate | `request_started` events / DAU (customers) | — |
| Request Completion Rate | `request_submitted` / `request_started` | ≥ 70% |
| Match Coverage Rate | Requests with ≥ 1 match / total requests | ≥ 80% |
| Profile View Rate | `provider_profile_viewed` / requests with matches | ≥ 60% |
| Contact Rate | Any contact event / requests with matches | ≥ 40% |
| Hire Rate | `provider_selected` / requests with contacts | ≥ 25% |
| Completion Rate | `job_completed` / `provider_selected` | ≥ 50% |
| Review Rate | `review_submitted` / `job_completed` | ≥ 40% |

### Provider Funnel Metrics

| KPI | Formula | Target (90 days) |
|---|---|---|
| Onboarding Completion | `provider_onboarding_completed` / started | ≥ 60% |
| Verification Approval Rate | Approved / total submissions | ≥ 60% |
| Lead Response Rate | `lead_responded` / `lead_received` | ≥ 60% |
| Lead-to-Hire Rate | `provider_selected` / leads responded | ≥ 20% |
| Provider Retention (30d) | Providers active in week 4 / week 1 cohort | ≥ 50% |

### Platform Health Metrics

| KPI | Formula | Target (90 days) |
|---|---|---|
| Daily Active Requests | Count of requests submitted per day | 10+ by day 90 |
| Active Verified Providers | Count of providers with status=verified | 150+ by day 90 |
| Avg Response Time (provider) | Avg hours from lead to first response | < 4 hours |
| Platform NPS | Survey score | ≥ 30 |
| Request-to-Completion Cycle | Days from submission to job completion | < 7 days avg |

---

## Funnel Dashboard (PostHog)

Build a PostHog Funnel with these steps:
1. `request_started`
2. `request_submitted`
3. `provider_profile_viewed`
4. `provider_contacted_chat` (or whatsapp/call)
5. `provider_selected`
6. `job_completed_customer`

This is the primary product health funnel. Review weekly. Act on any step with > 30% drop-off.

---

## Request Abandonment Analysis

Track `request_abandoned` with `last_step` to identify where users give up.
- Abandonment at Step 1 (category): UX/discovery issue
- Abandonment at Step 3 (photos): friction issue, photo step too mandatory-feeling
- Abandonment at Step 5 (urgency): unclear options or missing value prop

**Action:** Weekly review for first 8 weeks post-launch. Adjust wizard UX based on findings.

---

## Provider Funnel Analysis

Key drop-off to monitor:
- Onboarding start → completion (expect high drop-off at document upload step)
- Verification submission → approval (track rejection reasons)
- Lead received → responded (if < 60%, providers are not engaging — ops outreach needed)

---

## KPI Review Cadence

| Review | Frequency | Audience | Action |
|---|---|---|---|
| Daily dashboard | Daily | Ops/PM | Flag anomalies |
| Weekly funnel review | Weekly | PM + Eng | Identify regressions |
| Provider health check | Weekly | Ops | Reach out to inactive verified providers |
| Monthly cohort analysis | Monthly | Founders + PM | Strategic decisions |
| 90-day OKR review | Once at day 90 | Full team | MVP pass/fail decision |
